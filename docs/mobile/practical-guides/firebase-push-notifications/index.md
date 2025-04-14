---
sidebar_position: 5
---

# Firebase Push Notifications

:::warning
Esta guía fue redactada usando la versión 3.24.0 de `flutter`
:::

## Setup

Empieza agregando las dependencias [`firebase_core`](https://pub.dev/packages/firebase_core), [`firebase_messaging`](https://pub.dev/packages/firebase_messaging) y [`flutter_local_notifications`](https://pub.dev/packages/flutter_local_notifications) al proyecto de flutter en el archivo `pubspec.yaml`.

```yaml
dependencies:
  firebase_core: ^3.1.1
  firebase_messaging: ^15.1.3
  flutter_local_notifications: ^17.2.0
```

- El paquete `firebase_messaging` permite recibir y manejar notificaciones push enviadas desde Firebase Cloud Messaging (FCM).

- El paquete `flutter_local_notifications` permite mostrar notificaciones locales en dispositivos móviles.

La integración entre ambos paquetes consiste en recibir el mensaje desde el servidor con el uso de `firebase_messaging`, y al recibirlo si es necesario personalizarlo, añadir acciones específicas o simplemente mostrarlo, se usa `flutter_local_notifications`.

:::note
Para el funcionamiento de la dependencia de firebase messaging es necesario que previamente se haya [**configurado Firebase**](/docs/practical-guides/firebase-config/index.md) para cada ambiente de la aplicación.
:::

Previo a seguir con esta guía, es importante que sigas una serie de pasos para [configurar la plataforma de iOS](https://firebase.google.com/docs/cloud-messaging/flutter/client#ios)

## Implementación

### Capa de datos - Repositorio
Empieza creando una clase llamada `PushNotificationRepository` donde se realizará la implementación de Firebase Messaging con Flutter Local Notifications para gestionar las notificaciones push en la aplicación.

Este clase contendrá lo siguiente:

#### Constantes

Define un canal de notificaciones para Android con alta prioridad. Este canal se utiliza para mostrar notificaciones en Android.

```dart
const channel = AndroidNotificationChannel(
  'high_importance_channel',
  'High Importance Notifications',
  description: 'This channel is used for important notifications.',
  importance: Importance.max,
);
```

#### Constructor y atributos

El constructor recibe un objeto `errorRadarApi` para manejar errores y llama al método privado `_initialize` para configurar las notificaciones.

:::note
Llamar este método en el constructor es importante ya que permite inicializar inmediatamente el servicio en el momento que se instancia el repositorio.
:::

Los atributos a definir serán los siguientes:

- **errorRadarApi**: Interfaz para reportar errores.
- **_messagingInstance**: Instancia de FirebaseMessaging para interactuar con FCM.
- **token**: Token FCM para identificar el dispositivo en el servidor.
- **flutterLocalNotificationsPlugin**: Instancia para mostrar notificaciones locales.
- **_messageStream**: StreamController para manejar notificaciones recibidas.

```dart
PushNotificationsRepository({
  required this.errorRadarApi,
}) {
  _initialize();
}

final IErrorRadarApi errorRadarApi;

static final FirebaseMessaging _messagingInstance =
    FirebaseMessaging.instance;

static String? token;

static FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

static final StreamController<FirebaseNotificationModel> _messageStream =
    StreamController.broadcast();
```

#### Streams

Proporciona un stream de notificaciones para que otras partes de la aplicación las escuchen.

```dart
Stream<FirebaseNotificationModel> get messagesStream => _messageStream.stream;
```

#### Método para obtener el token FCM

Obtiene el token del dispositivo para FCM y lo registra en el log. Si ocurre un error, lo reporta mediante errorRadarApi.

```dart
Future<String?> getToken() async {
  try {
    final token = await _messagingInstance.getToken();
    log('FCM Token 🔑: $token');
    return token;
  } catch (e, s) {
    await errorRadarApi.captureException(e, s);
    throw FirebaseFcmTokenException();
  }
}
```

#### Método de inicialización

1.	Solicita permisos para recibir notificaciones (requestPermission).
2.	Configura notificaciones en primer plano para Android/iOS.
3.	Obtiene el token del dispositivo y lo suscribe al tema all.
4.	Configura los ajustes de inicialización para flutterLocalNotificationsPlugin.
5.	Registra manejadores para diferentes eventos de Firebase Messaging:	onMessage (notificaciones en primer plano), onBackgroundMessage (notificaciones en segundo plano), onMessageOpenedApp (Al abrir la app desde una notificación).

```dart
Future<void> _initialize() async { 
  try {
    final response = await requestPermission();

    log('User granted permission: ${response.authorizationStatus}');

    if (response.authorizationStatus == AuthorizationStatus.authorized) {
      await _messagingInstance.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      await Future<void>.delayed(const Duration(seconds: 1));

      final apnsToken = await _messagingInstance.getAPNSToken();

      await Future<void>.delayed(const Duration(seconds: 2));

      if (Platform.isAndroid || apnsToken != null) {
        token = await getToken();

        await _messagingInstance.subscribeToTopic('all');
      }

      const initializationSettingsAndroid =
          AndroidInitializationSettings('ic_notification');

      const initializationSettingsDarwin = DarwinInitializationSettings();

      const initializationSettings = InitializationSettings(
        android: initializationSettingsAndroid,
        iOS: initializationSettingsDarwin,
      );

      await flutterLocalNotificationsPlugin.initialize(
        initializationSettings,
        onDidReceiveNotificationResponse: _onDidReceiveNotificationResponse,
      );

      await flutterLocalNotificationsPlugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);

      FirebaseMessaging.onMessage.listen(_onMessageHandler);
      FirebaseMessaging.onBackgroundMessage(_backgroundHandler);
      FirebaseMessaging.onMessageOpenedApp.listen(_onMessageOpenApp);
    }
  } catch (e) {
    log('Error initializing push notifications: $e');
    rethrow;
  }
}
```

#### Manejador de evento - onMessage

Muestra una notificación local en Android cuando se recibe un mensaje en primer plano **(no hace falta configuración para iOS en este manejador)**.

```dart
static Future<void> _onMessageHandler(RemoteMessage message) async {
  final notification = message.notification;

  log('_onMessageHandler ${message.notification!.title}');

  if (message.notification != null && Platform.isAndroid) {
    await flutterLocalNotificationsPlugin.show(
      notification.hashCode,
      message.notification!.title,
      message.notification!.body,
      NotificationDetails(
        android: message.notification?.android != null
            ? AndroidNotificationDetails(
                channel.id,
                channel.name,
                channelDescription: channel.description,
              )
            : null,
      ),
      payload: jsonEncode(message.toMap()),
    );
  }
}
```

#### Manejador de evento - onBackgroundMessage

Procesa notificaciones cuando la app está en segundo plano o cerrada. Al recibir la notificación la agrega al stream para acceder a esta información en la capa de presentación de la aplicación.

```dart
@pragma('vm:entry-point')
static Future<void> _backgroundHandler(RemoteMessage message) async { 
  final notification = message.notification;

  log('_backgroundHandler ${message.notification!.title} ${message.data}');

  if (notification != null) {
    _messageStream.add(
      FirebaseNotificationModel.fromRemoteMessage(message),
    );
  } 
}
```

#### Manejador de evento - onMessageOpenedApp

Se ejecuta cuando el usuario abre la app desde una notificación. Al recibirla, la agrega al stream para acceder a esta información en la capa de presentación de la aplicación.

```dart
static Future<void> _onMessageOpenApp(RemoteMessage message) async {
  final notification = message.notification;

  if (notification != null) {
    _messageStream.add(
      FirebaseNotificationModel.fromRemoteMessage(message),
    );
  }
}
```

#### Método para solicitar permisos al usuario

Solicita permisos de notificaciones al usuario.

```dart
static Future<NotificationSettings> requestPermission() async {
  return _messagingInstance.requestPermission();
}
```

#### Método para obtener la notificación inicial

Obtiene el mensaje que activó la apertura de la app, si existe.

:::warning
La implementación de esté método es importante. Si la app es abierta desde el estado terminado a través de una notificación y dicho método no se encuentra definido, se perderá la data que la notificación contenga (por ejemplo, un url de redirección).
:::

```dart
Future<FirebaseNotification?> getInitialMessage() async {
  final initialMessage = await _messagingInstance.getInitialMessage();

  if (initialMessage != null) {
    return FirebaseNotification.fromRemoteMessage(initialMessage);
  }

  return null;
}
```

#### Cierre de recursos

Cierra el stream para liberar recursos cuando ya no se necesite.

``` dart
static void closeStreams() {
  _messageStream.close();
}
```

### Capa de datos - Modelo

#### FirebaseNotificationModel

En este modelo vamos a guardar los atributos necesarios recibidos de la notificación para usarlos en la capa de presentación. En este caso, guardamos el titulo, la descripción y el url de redirección si aplica.

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:mercantilseguros/src/domain/entities/entities.dart';

/// [FirebaseNotificationModel] model
class FirebaseNotificationModel {
  /// [FirebaseNotificationModel] constructor
  const FirebaseNotificationModel({
    required this.title,
    required this.body,
    this.redirectUrl,
  });

  /// Creates a [FirebaseNotificationModel] from a map
  factory FirebaseNotificationModel.fromRemoteMessage(RemoteMessage message) {
    final title =
        message.notification?.title ?? message.data['title'] as String?;

    final body = message.notification?.body ?? message.data['body'] as String?;

    final redirectUrl = message.data['redirectUrl'] as String?;

    return FirebaseNotificationModel(
      title: title ?? '',
      body: body ?? '',
      redirectUrl: redirectUrl,
    );
  }

  FirebaseNotification get toEntity => FirebaseNotification(
        title: title,
        body: body,
        redirectUrl: redirectUrl,
      );

  /// Firebase notification title
  final String title;

  /// Firebase notification body
  final String body;

  /// Firebase notification redirect url
  final String? redirectUrl;
}
```

### Capa de dominio - Entidad

#### FirebaseNotification

La entidad `FirebaseNotification` quedaría de la siguiente manera:

```dart
import 'package:equatable/equatable.dart';

class FirebaseNotification extends Equatable {
  const FirebaseNotification({
    required this.title,
    required this.body,
    this.redirectUrl,
  });

  final String title;

  final String body;

  final String? redirectUrl;

  FirebaseNotification copyWith({
    String? title,
    String? body,
    String? redirectUrl,
  }) {
    return FirebaseNotification(
      title: title ?? this.title,
      body: body ?? this.body,
      redirectUrl: redirectUrl ?? this.redirectUrl,
    );
  }

  @override
  List<Object?> get props => [title, body, redirectUrl];
}
```

### Capa de dominio - Caso de uso

`PushNotificationsUseCase` es un caso de uso que encapsula la lógica para interactuar con el repositorio de notificaciones push. 

Consta de un stream `pushNotificationsStream` que va a permitir escuchar notificaciones en la capa de presentación y el método `getInitialNotification` el cual permitirá obtener una notificación inicial (por ejemplo, cuando la aplicación es abierta mediante una notificación).

```dart
import 'package:project/src/data/repositories/repositories.dart';
import 'package:project/src/domain/entities/entities.dart';

class PushNotificationsUseCase {
  PushNotificationsUseCase({
    required PushNotificationsRepository pushNotificationsRepository,
  }) : _pushNotificationsRepository = pushNotificationsRepository;

  final PushNotificationsRepository _pushNotificationsRepository;

  Stream<FirebaseNotification?> get pushNotificationsStream =>
      _pushNotificationsRepository.messagesStream;

  Future<FirebaseNotification?> getInitialNotification() async {
    try {
      final message = _pushNotificationsRepository.getInitialMessage();

      return message;
    } catch (e) {
      return null;
    }
  }
}
```

### Capa de presentación

#### PushNotificationsBloc

Procede a crear un Bloc llamado `PushNotificationsBloc` en la carpeta core del proyecto, ya que este será un Bloc global. Este Bloc debe ser instanciado 
como `BlocProvider` en el nivel más alto posible de la aplicación (por lo general, en el archivo `app.dart`).

Comienza definiendo el estado del `PushNotificationsBloc`, el cual va a guardar la última notificación recibida

El archivo `push_notification_state.dart` debería verse de la siguiente manera:

```dart
part of 'push_notifications_bloc.dart';

class PushNotificationsState extends Equatable {
  const PushNotificationsState({
    this.notification,
  });

  final FirebaseNotification? notification;

  @override
  List<Object?> get props => [notification];

  PushNotificationsState copyWith({
    FirebaseNotification? notification,
  }) {
    return PushNotificationsState(
      notification: notification,
    );
  }
}
```

El archivo `push_notification_event.dart` debería verse de la siguiente manera:

```dart
part of 'push_notifications_bloc.dart';

abstract class PushNotificationsEvent extends Equatable {
  const PushNotificationsEvent();

  @override
  List<Object> get props => [];
}

class PushNotificationStarted extends PushNotificationsEvent {
  const PushNotificationStarted();
}

class PushNotificationReceived extends PushNotificationsEvent {
  const PushNotificationReceived(this.notification);

  final FirebaseNotification notification;

  @override
  List<Object> get props => [notification];
}

class PushNotificationOpened extends PushNotificationsEvent {
  const PushNotificationOpened();

  @override
  List<Object> get props => [];
}
```

En este archivo podemos ver cuatro eventos clave:
1. `PushNotificationStarted`: se encarga de obtener la notificación inicial (aquella que abrió la aplicación). De existir, emite el evento `PushNotificationReceived`. Por último, se subscribe al stream de notificaciones.
2. `PushNotificationReceived`: guarda la notificación recibida en el estado del bloc.
3. `PushNotificationOpened`: restaura el estado del Bloc para recibir la próxima notificación.

El archivo `push_notification_bloc.dart` debería quedar de la siguiente manera:

```dart
import 'dart:async';
import 'dart:developer';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:project/src/domain/entities/entities.dart';
import 'package:project/src/domain/use_cases/use_cases.dart';

part 'push_notifications_event.dart';
part 'push_notifications_state.dart';

class PushNotificationsBloc
    extends Bloc<PushNotificationsEvent, PushNotificationsState> {
  PushNotificationsBloc({
    required PushNotificationsUseCase pushNotificationsUseCase,
  })  : _pushNotificationsUseCase = pushNotificationsUseCase,
        super(
          const PushNotificationsState(),
        ) {
    on<PushNotificationStarted>(_onStarted);
    on<PushNotificationReceived>(_onReceived);
    on<PushNotificationOpened>(_onOpened);
  }

  final PushNotificationsUseCase _pushNotificationsUseCase;

  StreamSubscription<FirebaseNotification?>? _messagesStreamSubscription;

  FutureOr<void> _onStarted(
    PushNotificationStarted event,
    Emitter<PushNotificationsState> emit,
  ) async {
    await Future<void>.delayed(const Duration(seconds: 1));

    final initialMessage =
        await _pushNotificationsUseCase.getInitialNotification();

    if (initialMessage != null) {
      add(PushNotificationReceived(initialMessage));
    }

    _messagesStreamSubscription =
        _pushNotificationsUseCase.pushNotificationsStream.listen((event) {
      if (event != null) {
        add(PushNotificationReceived(event));
      }
    });
  }

  FutureOr<void> _onReceived(
    PushNotificationReceived event,
    Emitter<PushNotificationsState> emit,
  ) {
    log(
      '''Notification received ${event.notification.title} ${event.notification.redirectUrl}''',
      name: 'PushNotificationsBloc',
    );

    emit(
      state.copyWith(
        notification: event.notification,
      ),
    );
  }

  FutureOr<void> _onOpened(
    PushNotificationOpened event,
    Emitter<PushNotificationsState> emit,
  ) {
    emit(const PushNotificationsState());
  }

  @override
  Future<void> close() {
    _messagesStreamSubscription?.cancel();
    return super.close();
  }
}
```

#### BlocListener

Este `BlocListener` reacciona cuando cambia la notificación en el estado del Bloc, verificando si hay una URL de redirección asociada. Si la URL requiere autenticación y el usuario no está autenticado, redirige al inicio de la app; de lo contrario, maneja la navegación usando `handleUrlNavigation`. Finalmente, notifica al Bloc que la notificación ha sido abierta mediante el evento `PushNotificationOpened`. Este patrón asegura que las notificaciones sean procesadas y que la navegación sea controlada y segura.

El `BlocListener` debe verse de la siguiente manera:

```dart
 BlocListener<PushNotificationsBloc, PushNotificationsState>(
  listenWhen: (previous, current) =>
      current.notification != null &&
      previous.notification != current.notification,
  listener: (context, state) async {
    if (state.notification != null) {
      if (state.notification!.redirectUrl != null) {
        final uri = Uri.parse(state.notification!.redirectUrl!);

        if (urlRequiresAuthentication(uri) && !isAuthenticated) {
          context.go(AppShellBranch.home.path);
        } else {
          await handleUrlNavigation(
            context: context,
            url: state.notification!.redirectUrl!,
            urlType: UrlType.internal,
          );
        }
      } else {
        context.go(AppShellBranch.home.path);
      }

      context.read<PushNotificationsBloc>().add(
            const PushNotificationOpened(),
          );
    }
  },
),
```
