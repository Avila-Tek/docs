---
sidebar_position: 4
---

# Firebase Analytics

:::warning
Esta guía fue redactada usando la versión 3.24.0 de `flutter`
:::

## Setup

Empieza agregando las dependencias [`firebase_core`](https://pub.dev/packages/firebase_core), [`firebase_analytics`](https://pub.dev/packages/firebase_analytics) y [`app_tracking_transparency`](https://pub.dev/packages/app_tracking_transparency) al proyecto de flutter en el archivo `pubspec.yaml`.

```yaml
dependencies:
  firebase_core: ^3.1.1
  firebase_analytics: ^11.1.0
  app_tracking_transparency: ^2.0.6
```

:::note
Para el funcionamiento de la dependencia de firebase remote config es necesario que previamente se haya [**configurado Firebase**](/docs/practical-guides/firebase-config/index.md) para cada ambiente de la aplicación.
:::

*A partir de la versión de iOS 14+, es necesario solicitar los permisos de **Transparencia de Seguimiento de Aplicaciones (App Tracking Transparency)** a los usuarios. En caso de no ser aceptados, no se podrá registrar los eventos para ese usuario.*

## Implementación

### Capa de datos

Empieza creando la clase abstracta `IAnalyticsApi`, de la siguiente forma:

```dart
abstract class IAnalyticsApi {
  Future<void> initialize();

  Future<void> logEvent(String name, {Map<String, Object>? parameters});

  Future<void> setUserInstance(String userId);

  Future<void> setUserProperty(String name, String value);
}
```

Luego, realiza la implementación de esta clase con Firebase Analytics. La clase `FirebaseAnalyticsApi` se encarga de inicializar y configurar Firebase Analytics en la aplicación. Además, gestiona los permisos de rastreo y la colección de datos en función del estado de la autorización del usuario.

El constructor toma como parámetros `firebaseApp` (la instancia de **Firebase**), `firebaseAnalytics` (la instancia de **Firebase Analytics**), y `appTrackingTransparencyWrapper` (el cual es una clase que envuelve las implementaciones del paquete **app_tracking_transparency**), que son las instancias necesarias para inicializar Firebase y manejar los permisos de rastreo.

```dart
import 'dart:developer';

import 'package:app_tracking_transparency/app_tracking_transparency.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_core/firebase_core.dart';

import 'package:project-name/src/data/data_sources/analytics/analytics_api.dart';
import 'package:project-name/src/data/data_sources/analytics/app_tracking_transparency_wrapper.dart';

class FirebaseAnalyticsApi extends IAnalyticsApi {
  FirebaseAnalyticsApi({
    required this.firebaseApp,
    required this.firebaseAnalytics,
    required this.appTrackingTransparencyWrapper,
  });

  final FirebaseApp firebaseApp;
  final FirebaseAnalytics firebaseAnalytics;
  final AppTrackingTransparencyWrapper appTrackingTransparencyWrapper;

  @override
  Future<void> initialize() async {
    try {
      var appTrackingStatus =
          await appTrackingTransparencyWrapper.trackingAuthorizationStatus();

      if (appTrackingStatus == TrackingStatus.notDetermined) {
        appTrackingStatus =
            await appTrackingTransparencyWrapper.requestTrackingAuthorization();
      }

      final hasPermissions = appTrackingStatus == TrackingStatus.authorized ||
          appTrackingStatus == TrackingStatus.notSupported;

      log('Initializing Firebase Analytics has permissions: $hasPermissions');

      await firebaseApp.setAutomaticDataCollectionEnabled(hasPermissions);
      await firebaseAnalytics.setAnalyticsCollectionEnabled(hasPermissions);
    } catch (e) {
      log('Error initializing Firebase Analytics: $e');
      rethrow;
    }
  }

  @override
  Future<void> logEvent(
    String name, {
    Map<String, Object>? parameters,
  }) async {
    try {
      log('Logging event: $name with params: $parameters');
      await firebaseAnalytics.logEvent(name: name, parameters: parameters);
    } catch (e) {
      log('Error logging event: $e');
      rethrow;
    }
  }

  @override
  Future<void> setUserInstance(String userId) async {
    try {
      log('Setting user instance: $userId');

      await firebaseAnalytics.setUserId(id: userId);
    } catch (e) {
      log('Error setting user instance: $e');
      rethrow;
    }
  }

  @override
  Future<void> setUserProperty(String name, String value) async {
    try {
      log('Setting user property: $name with value: $value');

      await firebaseAnalytics.setUserProperty(name: name, value: value);
    } catch (e) {
      log('Error setting user property: $e');
      rethrow;
    }
  }
}
```

1. ***initialize***: configura Firebase Analytics según el estado de permiso de rastreo del usuario. Primero, verifica el estado de autorización de rastreo mediante appTrackingTransparencyWrapper y, si el estado no está determinado, solicita permiso al usuario. Si el usuario autoriza el rastreo o si la función no es compatible con el dispositivo, habilita la recopilación automática de datos en Firebase. En caso de error durante la inicialización, se registra el error en la consola y se vuelve a lanzar la excepción.

2. ***logEvent***: registra un evento en Firebase Analytics. Toma el nombre del evento y un conjunto opcional de parámetros, los cuales describe la información relacionada con el evento.

3. ***setUserInstance***: establece un identificador único para el usuario en Firebase Analytics. Esta función es útil para asociar eventos y propiedades con un usuario específico.

4. ***setUserProperty***: establece propiedades personalizadas para el usuario.

#### AppTrackingTransparencyWrapper

La clase `AppTrackingTransparencyWrapper` es una clase que envuelve las implementaciones del paquete [app_tracking_transparency](https://pub.dev/packages/app_tracking_transparency), esto debido a que `AppTrackingTransparency` es una clase estática. Además, facilita el testing del código.

De esta manera, la clase queda de la siguiente forma:

```dart
import 'package:app_tracking_transparency/app_tracking_transparency.dart';

class AppTrackingTransparencyWrapper {
  Future<TrackingStatus> trackingAuthorizationStatus() async {
    return AppTrackingTransparency.trackingAuthorizationStatus;
  }

  Future<TrackingStatus> requestTrackingAuthorization() async {
    return AppTrackingTransparency.requestTrackingAuthorization();
  }
}
```
1. ***trackingAuthorizationStatus***: retorna el estado actual de los permisos de rastreo.

2. ***requestTrackingAuthorization***: muestra el dialogo nativo de iOS para solicitar los permisos.

### Capa de dominio

Empieza creando la clase abstracta `IAnalyticsRepository`, que servirá como el repositorio encargado de gestionar las analíticas de la aplicación.

```dart
abstract class IAnalyticsRepository {
  Future<void> logEvent(String name, {Map<String, Object>? parameters});

  Future<void> setUserInstance(String userId);

  Future<void> setUserProperty(String name, String value);
}
```

Luego realiza la implementación de un repositorio llamado `AnalyticsRepository` que extiende la interfaz `IAnalyticsRepository`. Este repositorio sirve como intermediario para interactuar con dos API: `IAnalyticsApi` y `IErrorRadarApi`, la primera relacionada a registro de eventos de analíticas y la segunda al manejo y captura de excepciones.

```dart
import 'package:mercantilseguros/src/data/data_sources/data_sources.dart';
import 'package:mercantilseguros/src/domain/repositories/repositories.dart';

class AnalyticsRepository extends IAnalyticsRepository {
  AnalyticsRepository({
    required this.analyticsApi,
    required this.errorRadarApi,
  });

  final IAnalyticsApi analyticsApi;
  final IErrorRadarApi errorRadarApi;

  @override
  Future<void> logEvent(
    String name, {
    Map<String, Object>? parameters,
  }) async {
    try {
      await analyticsApi.logEvent(name, parameters: parameters);
    } catch (e, str) {
      await errorRadarApi.captureException(e, str);
    }
  }

  @override
  Future<void> setUserInstance(String userId) async {
    try {
      await analyticsApi.setUserInstance(userId);
    } catch (e, str) {
      await errorRadarApi.captureException(e, str);
    }
  }
  
  @override
  Future<void> setUserProperty(String name, String value) async {
    try {
      await analyticsApi.setUserProperty(name, value);
    } catch (e, str) {
      await errorRadarApi.captureException(e, str);
    }
  }
}
```

### Capa de presentación

Comienza en el archivo `main.dart` instanciando `FirebaseAnalyticsApi` dentro de la función bootstrap e inmediatamente llamando la función del api que la inicializa.

```dart
await bootstrap(
  environment: 'development',
  useSentry: false,
  sentryDsn: sentryDns,
  builder: () async {
    late FirebaseAnalyticsApi analyticsApi;

    try {
      final firebaseApp = await Firebase.initializeApp(
        options: FirebaseOptionsDev.currentPlatform,
      );

      analyticsApi = FirebaseAnalyticsApi(
        firebaseApp: firebaseApp,
        firebaseAnalytics: FirebaseAnalytics.instanceFor(app: firebaseApp),
        appTrackingTransparencyWrapper: AppTrackingTransparencyWrapper(),
      );

      unawaited(analyticsApi.initialize());
    } catch (e) {
      log(e.toString());
    },
);
```

:::warning
Debes inicializar Firebase previamente.
:::

Define una instancia de `AnalyticsRepository` y declaralo como un `RepositoryProvider` en el archivo `app.dart`

#### ¿Cómo registrar eventos?

Existen dos maneras de registrar eventos de analíticas con esta implementación:
1) En los use cases, pasandole por parametro el `AnalyticsRepository`
2) En cualquier Stateless/Stateful widget a través del contexto de la app

Para el punto 2, crea una extensión sobre `BuildContext` para acceder fácilmente al repositorio de analíticas.

```dart
extension BuildContextX on BuildContext {
  IAnalyticsRepository get analytics => read<IAnalyticsRepository>();
}
```

Así, en lugar de escribir `context.read<IAnalyticsRepository>()`, basta con utilizar `context.analytics`.

De esta manera, ya puedes registrar eventos y definir propiedades para los usuarios en las analíticas de Firebase.

```dart
await context.analytics.logEvent(
  'event_name',
  parameters: {
    'param_1': param1,
    'param_2': param2,
  },
);
```

Cuando se registra un evento, siempre se le asigna el nombre de dicho evento y los parámetros (opcionales) que se quieran guardar.

#### Clase AnalyticsEvents

Para centralizar los nombres de eventos en el proyecto, podemos crear la clase `AnalyticsEvents`, la cual se implementa de la siguiente manera:

```dart
class AnalyticsEvents {
  static const eventName1 = 'event_name_1';

  static const eventName2 = 'event_name_2';
}
```

Se recomienda ubicar esta clase en la carpeta core del proyecto.

Finalmente, para registrar un evento en Firebase Analytics, se utiliza el siguiente código:

```dart
await context.analytics.logEvent(
  AnalyticsEvents.eventName1,
  parameters: {
    'param_1': param1,
    'param_2': param2,
  },
);
```