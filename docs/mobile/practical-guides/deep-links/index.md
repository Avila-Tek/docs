---
sidebar_position: 3
---

# Deep Links

:::warning
Esta guía fue redactada usando la versión 3.24.0 de `Flutter` y la versión 6.3.2 de `app_links`.
:::

## Setup

Empieza agregando la dependencia de [`app_links`](https://pub.dev/packages/app_links) al proyecto de flutter en el archivo `pubspec.yaml`.

```yaml
dependencies:
  app_links: ^6.3.2
```

## Configuraciones nativas en Android y iOS

### Android
Desactiva el deep link predeterminado de Flutter. Para esto, específicamente desde la versión 3.24.0 de Flutter, **debes** agregar al `AndroidManifest.xml` la siguiente etiqueta de metadatos dentro de la etiqueta con .MainActivity

```xml
<meta-data android:name="flutter_deeplinking_enabled" android:value="false" />
```

Luego, agrega un intent filter dentro del `<activity>` tag

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="example.com" />
</intent-filter>
```

#### Configuración de scheme y host para multiflavors

Cada flavor puede tener su propio scheme y host configurados para el funcionamiento de los deep links. Para esto, define unos `manifestPlaceholders` para cada flavor en el archivo `build.gradle` en la ruta `android/app`. 

```gradle
productFlavors { 
        production {
            dimension "default"
            applicationIdSuffix ""
            manifestPlaceholders = [appName: "AppName", appLinkHost: "example.com"]
        }
        staging {
            dimension "default"
            applicationIdSuffix ".stg"
            manifestPlaceholders = [appName: "[STG] AppName", appLinkHost: "stg.example.com"]
        }
        development {
            dimension "default"
            applicationIdSuffix ".dev"
            manifestPlaceholders = [appName: "[DEV] AppName", appLinkHost: "dev.example.com"]
        }
    }
```

El scheme puede quedar fijo como https o se pueden definir de igual manera uno por flavor definiendo el manifestPlaceholder `appLinkScheme`, quedando el `<intent-filter>` de la siguiente manera:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="${appLinkHost}" />
</intent-filter>
```

:::note
Para que los app links funcionen desde el navegador, el único scheme aceptado es http/https.
:::

### iOS
Desactiva el deep link predeterminado de Flutter. Para esto, específicamente desde la versión 3.24.0 de Flutter, **debes** agregar al `Info.plist` la siguiente etiqueta:
```xml
<key>FlutterDeepLinkingEnabled</key>
<false/>
```

Seguido de esto, agrega los Dominios Asociados (Associated Domains) a la aplicación desde Xcode:

1. Hacer clic en el Runner de nivel superior.
2. Hacer clic en el Runner target.
3. Hacer clic en Signing & Capabilities.
4. Hacer clic en + Capability en Firma y Signing & Capabilities, para agregar un nuevo dominio.
5. Hacer clic en Dominios asociados (Associated Domains).

![Associated domains Capabilities - Xcode](/img/associated-domains.png)

6. Hacer clic en +, en la sección de Dominios Asociados.
7. Ingresa applinks:`<dominio web>`. Reemplaza `<dominio web>` con el nombre de dominio que se usará para la aplicación.

![Add associated domain - Xcode](/img/associated-domains-2.png)

## Archivos `.well-known`

### assetlinks.json
Para la configuración de Android **debes** crear y alojar un archivo `assetlinks.json` en un servidor web con un dominio que sea propiedad de la empresa. Este archivo le indica al navegador móvil qué aplicación de Android debe abrir en lugar del navegador. 

Para crear el archivo, es necesario tener el nombre del paquete de la aplicación Flutter y la huella digital `sha256` de la clave de firma que se usará para crear el APK.
1. Localiza el nombre del paquete en el archivo `AndroidManifest.xml` bajo la etiqueta `<manifest>` (por lo general tienen el formato `com.*` o `com.avilatek.*`)
2. Localiza la huella digital `sha256` de dos maneras: si la aplicación ya está subida a Google (este caso pasa en producción) **puedes** encontrar la huella digital sha256 directamente desde la consola para desarrolladores de PlayStore, en **Versión > Configuración > Integridad de la aplicación > pestaña Firma de la aplicación**. De otra manera, si estás trabajando con development o staging, **puedes** generar sha256 usando el siguiente comando `keytool -list -v -keystore <path-to-keystore>`

Teniendo estos datos, procede a crear el archivo `assetlinks.json` de la siguiente manera:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.example",
    "sha256_cert_fingerprints":
    ["FF:2A:CF:7B:DD:CC:F1:03:3E:E8:B2:27:7C:A2:E3:3C:DE:13:DB:AC:8E:EB:3A:B9:72:A1:0E:26:8A:F5:EC:AF"]
  }
}]
```

Por último, se **debe** hostear el archivo en la ruta `<webdomain>/.well-known/assetlinks.json`.

### apple-app-site-association
Para la configuración de iOS **debes** crear y alojar un archivo `apple-app-site-association` en un servidor web con un dominio que sea propiedad de la empresa. Este archivo le indica al navegador móvil qué aplicación iOS debe abrir en lugar del navegador. 

Para crear el archivo es necesario tener el `appID` de la aplicación de Flutter. En Apple, el `appID` representa `<team id>.<bundle id>`:
1. Localiza el `bundleId` (ID del paquete) en el proyecto de Xcode (por lo general tiene el formato `com.*` o `com.avilatek.*`)
2. Localiza el `teamId` (ID del equipo) en la cuenta de desarrollador.

Teniendo estos datos, procede a crear el archivo `apple-app-site-association` de la siguiente manera:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": [
          "S8QB4VV633.com.example.app"
        ],
        "paths": [
          "*"
        ],
        "components": [
          {
            "/": "/*"
          }
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": [
      "S8QB4VV633.com.example.app"
    ]
  }
}
```
:::warning
Este archivo no **debe** tener la extensión `.json`
:::

El arreglo de rutas (path) especifica los enlaces universales permitidos. El uso del asterisco * redirige cada ruta a la aplicación Flutter. Si es necesario, cambia el valor del arreglo de rutas a una configuración más adecuada.

Por último, se **debe** hostear el archivo en la ruta `<webdomain>/.well-known/apple-app-site-association`.

## Manejo de redirecciones en la aplicación

Una vez completada la configuración nativa, procede a implementar la logica de redirección dentro de la aplicación. La idea del uso de 
deep links es poder navegar a distintas secciones de nuestra aplicación, ejecutandose desde cualquier estado (en primer plano, segundo plano o terminado).

Para esto utiliza los paquetes de pub `go_router` y `app_links` e implementa un Bloc que se encargará de manejar esta lógica. Es importante saber
en este punto las rutas a las cuales el usuario puede acceder sin estar autenticado y a cuales no.

### DeepLinkBloc

Procede a crear un Bloc llamado `DeepLinkBloc` en la carpeta core del proyecto, ya que este será un Bloc global. Este Bloc debe ser instanciado 
como `BlocProvider` en el nivel más alto posible de la aplicación (por lo general, en el archivo `app.dart`).

:::info
La lógica mostrada a continuación aplica para una aplicación a la cual puedes acceder sin necesidad de estar autenticado. De ser distinta la lógica de
tu aplicación puedes adaptarla.
:::

Comienza definiendo los estados en los cuales nuestro DeepLinkBloc puede estar.

- `DeepLinkInitial`: estado inicial, solo guarda el estado de autenticación del usuario.
- `DeepLinkLoaded`: estado que se emite cuando se recibe un deep link al cual se debe redireccionar.
- `AppLinkAuthRequired`: estado que se emite cuando se recibe un deep link pero es necesario de un usuario autenticado para poder redirigir.

El archivo `deep_link_state.dart` debería verse de la siguiente manera:

```dart
part of 'deep_link_bloc.dart';

abstract class DeepLinkState {
  const DeepLinkState({
    this.isAuthenticated = false,
  });

  final bool isAuthenticated;
}

class DeepLinkInitial extends DeepLinkState {
  const DeepLinkInitial({
    super.isAuthenticated,
  });
}

class DeepLinkLoaded extends DeepLinkState {
  const DeepLinkLoaded({
    required this.link,
    super.isAuthenticated,
  });

  final Uri link;
}

class AppLinkAuthRequired extends DeepLinkState {
  const AppLinkAuthRequired({
    required this.link,
    super.isAuthenticated,
  });

  final Uri link;
}
```

Ten en cuenta que todos los DeepLinkStates extienden la clase base abstracta DeepLinkState, que tiene una propiedad de `isAuthenticated`. Esto se debe a que, independientemente del estado en el que se encuentre nuestro DeepLinkBloc, queremos saber si el usuario está autenticado.

El archivo `deep_link_event.dart` debería verse de la siguiente manera:

```dart
part of 'deep_link_bloc.dart';

abstract class DeepLinkEvent extends Equatable {
  const DeepLinkEvent();

  @override
  List<Object> get props => [];
}

class DeepLinkStarted extends DeepLinkEvent {
  const DeepLinkStarted({required this.isAuthenticated});

  final bool isAuthenticated;

  @override
  List<Object> get props => [isAuthenticated];
}

class AppLinkReceived extends DeepLinkEvent {
  const AppLinkReceived(this.link);

  final Uri link;

  @override
  List<Object> get props => [link];
}

class UserAuthenticated extends DeepLinkEvent {}

class UserLoggedOut extends DeepLinkEvent {}
```

En este archivo podemos ver cuatro eventos clave:
1. `DeepLinkStarted`: se encarga de obtener el deep link inicial (importante para los links que abren la aplicación desde el estado terminado). **Debes llamar este evento en un sitio de la app donde ya esté inicializada y conozcas el estado actual de autenticación del usuario.**
2. `AppLinkReceived`: se encarga de hacer el decoding del `Uri`, guardar el link en el estado y validar si se puede redireccionar o si requiere autenticación por parte del usuario.
3. `UserAuthenticated`: se encarga de cambiar el estado del Bloc dependiendo del estado actual. **Debes llamar este evento en un sitio de la app donde se escuchen los cambios de autenticación del usuario.**
4. `UserLoggedOut`: se encarga de cambiar el estado del Bloc al estado inicial. **Debes llamar este evento en un sitio de la app donde se escuchen los cambios de autenticación del usuario.**

El archivo `deep_link_bloc.dart` debería quedar de la siguiente manera:

```dart
import 'dart:async';
import 'dart:developer';

import 'package:app_links/app_links.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'deep_link_event.dart';
part 'deep_link_state.dart';

class DeepLinkBloc extends Bloc<DeepLinkEvent, DeepLinkState> {
  DeepLinkBloc()
      : super(
          const DeepLinkInitial(),
        ) {
    on<DeepLinkStarted>(_onDeepLinkStarted);
    on<AppLinkReceived>(_onAppLinkReceived);
    on<UserAuthenticated>(_onUserAuthenticated);
    on<UserLoggedOut>((event, emit) => emit(const DeepLinkInitial()));

    _appLinksSubscription = _appLinks.uriLinkStream.listen(
      (Uri? uri) {
        if (uri != null) {
          log('DeepLink: $uri');
          add(AppLinkReceived(uri));
        }
      },
      onError: (err) {
        // Handle exception
      },
    );
  }

  static final _appLinks = AppLinks();

  StreamSubscription<Uri?>? _appLinksSubscription;

  FutureOr<void> _onDeepLinkStarted(
    DeepLinkStarted event,
    Emitter<DeepLinkState> emit,
  ) async {
    emit(DeepLinkInitial(isAuthenticated: event.isAuthenticated));

    final initialLink = await _appLinks.getInitialLink();

    if (initialLink != null) {
      log('DeepLink: $initialLink');

      add(AppLinkReceived(initialLink));
    }
  }

  FutureOr<void> _onAppLinkReceived(
    AppLinkReceived event,
    Emitter<DeepLinkState> emit,
  ) {
    final decodedUri = Uri.parse(Uri.decodeFull(event.link.toString()));

    if (urlRequiresAuthentication(decodedUri) && !state.isAuthenticated) {
      emit(
        AppLinkAuthRequired(
          link: decodedUri,
          isAuthenticated: state.isAuthenticated,
        ),
      );
    } else {
      emit(
        DeepLinkLoaded(
          link: decodedUri,
          isAuthenticated: state.isAuthenticated,
        ),
      );
    }
  }

  FutureOr<void> _onUserAuthenticated(
    UserAuthenticated event,
    Emitter<DeepLinkState> emit,
  ) async {
    final state = this.state;

    await Future<void>.delayed(const Duration(seconds: 4));

    if (state is AppLinkAuthRequired) {
      emit(
        DeepLinkLoaded(link: state.link, isAuthenticated: true),
      );
    } else {
      emit(const DeepLinkInitial(isAuthenticated: true));
    }
  }


  @override
  Future<void> close() {
    _appLinksSubscription?.cancel();
    return super.close();
  }
}
```

Al crear una instancia de `DeepLinkBloc`, se establece un estado inicial `DeepLinkInitial`, indicando que no hay enlaces profundos cargados y que la aplicación está en su estado inicial.

En el constructor definiremos una subscripción a un stream proporcionado por `app_links` para recibir los deep links. Si se recibe un uri, se registra el enlace en los logs y se emite el evento `AppLinkReceived` para que sea procesado por el Bloc.

El `DeepLinkBloc` cuatro manejadores de eventos:

* `on<DeepLinkStarted>`: Escucha cuando la aplicación arranca y verifica si hay un enlace inicial. Cuando se inicia la aplicación, se emite `DeepLinkInitial` con el estado de autenticación. Luego, se obtiene cualquier enlace inicial (initialLink) que la aplicación haya recibido al arrancar. Si hay un enlace inicial, se registra y se procesa mediante el evento `AppLinkReceived`.
* `on<AppLinkReceived>`: Procesa los enlaces profundos recibidos. Decodifica el URI recibido para obtener un enlace limpio, si el enlace requiere autenticación (urlRequiresAuthentication) y el usuario no está autenticado, emite el estado `AppLinkAuthRequired` para indicar que la autenticación es necesaria. Si no se requiere autenticación, emite el estado `DeepLinkLoaded` con el enlace decodificado.
*	`on<UserAuthenticated>`: Actúa cuando el usuario ha sido autenticado. Si el estado actual era `AppLinkAuthRequired`, emite `DeepLinkLoaded` con el enlace original y el usuario autenticado. Si no había un enlace que requiriera autenticación, vuelve al estado inicial con el usuario autenticado.
*	`on<UserLoggedOut>`: Vuelve al estado inicial cuando el usuario cierra sesión.

### BlocListener

Este `BlocListener` se encarga de manejar la navegación cuando la aplicación detecta un deep link. Dependiendo del estado emitido (`AppLinkAuthRequired` o `DeepLinkLoaded`), redirige al usuario a la página correspondiente (inicio de sesión o una página específica según la ruta). 
Debes instanciar este `BlocListener` en un nivel de la aplicación donde ya esté inicializada y lista para realizar redirecciones.

El `BlocListener` debe verse de la siguiente manera:

```dart
BlocListener<DeepLinkBloc, DeepLinkState>(
  listenWhen: (previous, current) => previous != current,
  listener: (context, state) async {
    if (state is AppLinkAuthRequired) {
      await context.push(LoginPage.path);
    }

    if (state is DeepLinkLoaded) {
      final uriPath = state.link.path;
      final uriQuery = state.link.query;

      final shellRoutes =
          AppShellBranch.values.map((branch) => branch.path);

      if (shellRoutes.contains(uriPath)) {
        context.go('$uriPath?$uriQuery');
      } else {
        await context.push('$uriPath?$uriQuery');
      }
    }
  },
)
```

Si el estado actual es `AppLinkAuthRequired`, significa que la aplicación detectó un enlace profundo que requiere autenticación.

Si el estado es `DeepLinkLoaded`, significa que la aplicación ha cargado un enlace profundo. Extrae la ruta (uriPath) y los parámetros de consulta (uriQuery) del enlace cargado.

:::warning
Recuerda que debes manejar la logica para registrar el cambio de autenticación del usuario en el DeepLinkBloc, es decir, emitir lo eventos `UserAuthenticated` o `UserLoggedOut`.
En el caso de este ejemplo, se hace en el BlocListener del usuario: 

```dart
 BlocListener<UserBloc, UserState>(
  listenWhen: (previous, current) =>
      previous.status != current.status,
  listener: (context, state) {

    if (state.status.isUnauthenticated) {
      context.read<DeepLinkBloc>().add(UserLoggedOut());
      ...
    }

    if (state.status.isAuthenticated) {
      context.read<DeepLinkBloc>().add(UserAuthenticated());
      ...
    }
  },
)
```
:::



## Testing
Puedes usar un dispositivo real o el emulador para probar un enlace de aplicación.

### Probar app link en Android
Si usas un emulador de Android, puedes probar la redirección del enlace usando el siguiente comando en el adb shell:
```shell
adb shell 'am start -a android.intent.action.VIEW \
    -c android.intent.category.BROWSABLE \
    -d "http://<web-domain>/"' \
    <package name>
```

:::note
Aunque al ejecutar este comando se abrirá la app, no garantiza que el archivo web se haya hosteado correctamente.
:::

Para probar la configuración web y de la aplicación, debes hacer clic en un enlace directamente a través del navegador web u otra aplicación (para esto debes haber hosteado anteriormente el archivo assetlinks.json)

### Probar app link en iOS
Si usas un emulador de iOS puedes probar el enlace usando el siguiente comando en el Xcode CLI:

```shell
xcrun simctl openurl booted https://<web domain>/
```

Si usas un dispositivo físico:
1. Abre la app de notas.
2. Escribe el link configurado https://`<web domain>`/
3. Presiona el link.


## Referencias

Docs Flutter. (s.f.). Set up universal links. Flutter Documentation. https://docs.flutter.dev/cookbook/navigation/set-up-universal-links

Docs Flutter. (s.f.). Set up app links. Flutter Documentation. https://docs.flutter.dev/cookbook/navigation/set-up-app-links