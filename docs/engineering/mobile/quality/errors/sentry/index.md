---
sidebar_position: 3
---

# Capturar errores con Sentry

En esta última parte vamos a añadir el registro y monitoreo de errores en plataformas externas como Sentry o Firebase Crashlytics. Esta etapa es crítica porque:
- Nos permite enterarnos en tiempo real de los errores que están ocurriendo en producción.
- Proporciona trazas completas y contexto para entender y diagnosticar problemas.

El objetivo de esta tercera parte es:
- Centralizar el registro de errores al igual que centralizamos su manejo.
- Aprovechar la información (tipo, código, detalles, stack trace) para obtener reportes útiles.

## Configuración inicial

### Acceso a Sentry

Lo primero que necesitamos es tener acceso al Sentry de la organización Avila Tek. En algunos casos, el Sentry de una aplicación específica puede estar asociado a una organización externa, por lo que es importante verificarlo. Además, debemos contar con acceso al Team del proyecto correspondiente.

Si no se tiene acceso, es necesario solicitarlo al Tech Lead del proyecto en el que se esté trabajando.

### Instalación del SDK

Una vez obtenido el acceso, para los proyectos desarrollados en Flutter, debemos configurar el SDK de Sentry en el cliente.

La documentación oficial de Sentry explica este proceso de forma detallada, pero para los fines de esta guía, lo esencial es contar con un Sentry DSN, que permitirá enviar los datos de la aplicación a Sentry.

:::info
Este DSN debe estar declarado en las variables de entorno del proyecto.
:::

En pub.dev podemos encontrar varios paquetes relacionados con Sentry. El único que debemos instalar obligatoriamente es:
1. [sentry_flutter](https://pub.dev/packages/sentry_flutter)

Este paquete permite integrar Sentry directamente con aplicaciones Flutter para capturar errores, excepciones y eventos de rendimiento.

### Configuración de sentry_flutter

Antes de proceder con la configuración de Sentry en el proyecto, es importante tener en cuenta que en nuestra librería de Flutter (Avila Tek FCL) existe una interfaz llamada ErrorRadarDelegate, la cual define las funciones principales (abstractas) relacionadas con la gestión de errores.

La implementación concreta de la librería debe extender esta interfaz para garantizar una integración consistente con el sistema de monitoreo.

Para esto debemos importar en el `pubspec.yaml` el paquete de avila_core haciendo referencia al tag `avilatek_core-1.1.2`

```yaml
 avilatek_core:
    git:
      url: https://github.com/Avila-Tek/flutter_common_lib.git
      ref: avilatek_core-1.1.2
      path: packages/avilatek_core
```

Una vez importado el paquete, debemos crear nuestra implementación de Sentry extendiendo la interfaz ErrorRadarDelegate.

Para facilitar este proceso, a continuación se muestra una implementación de ejemplo que puede servir como punto de partida.

```dart
import 'package:avilatek_core/common.dart';
import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

class SentryErrorRadar extends ErrorRadarDelegate {
  SentryErrorRadar({
    required this.environment,
    this.dsn,
  });

  final String environment;
  final String? dsn;

  @override
  bool get isCollectionEnabled => true;

  @override
  Future<void> init() async {
    SentryWidgetsFlutterBinding.ensureInitialized();

    if (dsn != null) {
      await SentryFlutter.init(
        (options) {
          options
            ..dsn = dsn
            ..environment = environment;
        },
      );
    }
  }

  @override
  void captureException(
    Object exception,
    StackTrace stackTrace, {
    Map<String, String>? tags,
    Map<String, dynamic>? extra,
  }) {
    Sentry.captureException(
      exception,
      stackTrace: stackTrace,
      withScope: (scope) {
        if (tags != null) tags.forEach(scope.setTag);
        if (extra != null) extra.forEach(scope.setContexts);
      },
    );
  }

  @override
  void addBreadcrumb(ErrorBreadcrumb breadcrumb) {
    Sentry.addBreadcrumb(
      Breadcrumb(
        message: breadcrumb.message,
        category: breadcrumb.category,
        level: _mapErrorLevelToSentryLevel(breadcrumb.level),
        data: breadcrumb.data,
        timestamp: breadcrumb.timestamp,
      ),
    );
  }

  @override
  void captureMessage(
    String message, {
    ErrorLevel level = ErrorLevel.info,
    Map<String, String>? tags,
    Map<String, dynamic>? extra,
  }) {
    Sentry.captureMessage(
      message,
      level: _mapErrorLevelToSentryLevel(level),
      withScope: (scope) {
        if (tags != null) tags.forEach(scope.setTag);
        if (extra != null) extra.forEach(scope.setContexts);
      },
    );
  }

  @override
  void clearScope() {
    Sentry.configureScope((scope) => scope.clear());
  }

  @override
  void recordFlutterFatalError(FlutterErrorDetails details) {
    Sentry.captureException(
      details.exception,
      stackTrace: details.stack,
    );
  }

  @override
  bool recordPlatformDispatcherError(Object object, StackTrace stack) {
    Sentry.captureException(
      object,
      stackTrace: stack,
    );

    return true;
  }

  @override
  void setCollectionEnabled({required bool enabled}) {
    throw UnsupportedError(
      '''Sentry does not support enabling/disabling collection at runtime.''',
    );
  }

  @override
  void setExtra(String key, dynamic value) {
    Sentry.configureScope((scope) => scope.setContexts(key, value));
  }

  @override
  void setTag(String key, String value) {
    Sentry.configureScope((scope) => scope.setTag(key, value));
  }

  @override
  void setUser(ErrorUser user) {
    final sentryUser = SentryUser(
      id: user.id,
      email: user.email,
      username: user.username,
    );

    Sentry.configureScope((scope) => scope.setUser(sentryUser));
  }

  /// Maps [ErrorLevel] to [SentryLevel].
  SentryLevel _mapErrorLevelToSentryLevel(ErrorLevel level) {
    switch (level) {
      case ErrorLevel.debug:
        return SentryLevel.debug;
      case ErrorLevel.info:
        return SentryLevel.info;
      case ErrorLevel.warning:
        return SentryLevel.warning;
      case ErrorLevel.error:
        return SentryLevel.error;
      case ErrorLevel.fatal:
        return SentryLevel.fatal;
    }
  }
}
```

Como podrás notar, la implementación es algo extensa, pero incluye todo lo necesario para capturar la mayor cantidad posible de información relevante sobre los errores.

La explicación del funcionamiento de cada una de las funciones la iremos revisando de forma gradual a lo largo de esta guía.

El siguiente paso es declarar e instanciar el SentryErrorRadar en los archivos main correspondientes a cada entorno (por ejemplo, staging y production).

Tu configuración debería verse de la siguiente forma:

```dart
void main() async {
  const environment = 'staging';

  await envs.load();

  final sentryDsn = envs.get(EnvKeys.sentryDsn);

  final sentryRadar = SentryErrorRadar(
    dsn: sentryDsn,
    environment: environment,
  );

  ErrorRadarDelegate.instance = sentryRadar;
  
  await bootstrap(() async {
       ...
  }
}
```

Es fundamental asignar la instancia de sentryRadar a ErrorRadarDelegate.instance, ya que esta referencia nos permitirá acceder al delegate desde cualquier parte de la aplicación. Esto será clave para los siguientes apartados de la guía, donde utilizaremos dicha instancia para manejar y reportar errores de forma centralizada.

Como punto de partida de la configuración de Sentry, enfoquémonos en el método init().
Aquí vamos a inicializar Sentry, en este método se pueden configurar varias opciones, por ahora las más importantes son:
  - `dsn`: Es el Domain Source Name, previamente mencionado.
  - `environment`: Es el ambiente sobre el cual se está ejecutando la aplicación. Recordemos que tenemos 3: development, staging, production.
  - `tracesSampleRate`: Controla el porcentaje de transacciones de rendimiento (performance traces) que se capturan y envían a Sentry. En producción le puedes asignar un valor entre 0.1 y 0.3 para evitar sobrecargar Sentry.
  - `profilesSampleRate`: El profiling mide qué funciones del código consumen más CPU o tiempo durante la ejecución de una transacción. Se recomienda colocar un valor bajo (0.1-0.2) y solo activarlo si realmente necesitas analizar el rendimiento a nivel de CPU.

```dart
@override
Future<void> init() async {
    SentryWidgetsFlutterBinding.ensureInitialized();

    if (dsn != null) {
        await SentryFlutter.init(
        (options) {
            options
            ..dsn = dsn
            ..environment = environment;
        },
        );
    }
}
```

Es importante agregar SentryWidgetsFlutterBinding.ensureInitialized(); esta línea asegura que el binding de Flutter esté correctamente inicializado antes de usar Sentry. Sentry necesita ese binding activo para poder interceptar errores de widgets, capturar stack traces y registrar eventos en el contexto correcto. Si no llamas a esto, Sentry podría no inicializarse correctamente o perder errores relacionados con el UI.

¿Y donde llamamos esa función? En el archivo bootstrap.dart, antes de ejecutar la función runApp().

```dart
Future<void> bootstrap(FutureOr<Widget> Function() builder) async {
  await ErrorRadarDelegate.instance.init();

  Bloc.observer = const AppBlocObserver();
  
  ...
}
```

Con Sentry ya inicializado, estamos listos para comenzar a capturar los errores de nuestra aplicación. En la siguiente sección, veremos cómo implementar este proceso paso a paso.

## Capturar errores

En este apartado abordaremos la captura de errores en nuestros proyectos y cómo enriquecer cada reporte con la mayor cantidad posible de información relevante.

Para ello, debemos centrarnos en cinco tipos principales de errores que pueden ocurrir en una aplicación Flutter:
- **Errores de API:** representan los errores no manejados que provienen de conexiones con servicios externos o APIs.
- **FlutterErrors:** corresponden a los errores que el propio framework Flutter reporta a través de FlutterError.reportError(). Incluyen fallos de construcción, renderizado, manejo de gestos o aserciones dentro del framework.
- **PlatformDispatcher:** captura los errores no detectados que se propagan al bucle principal de eventos de Dart, actuando como un mecanismo de último recurso para errores asíncronos o de nivel superior no gestionados.
- **Errores de lógica de negocio (BLoCs):** permiten capturar errores críticos del flujo lógico de la aplicación, como fallos en procesos de pago, reservas u operaciones clave.
Para manejar estos casos, nuestra interfaz ErrorRadarDelegate define tres funciones principales que nos permitirán implementar la captura centralizada de estos errores.

```dart
 @override
  void captureException(
    Object exception,
    StackTrace stackTrace, {
    Map<String, String>? tags,
    Map<String, dynamic>? extra,
  }) {
    Sentry.captureException(
      exception,
      stackTrace: stackTrace,
      withScope: (scope) {
        if (tags != null) tags.forEach(scope.setTag);
        if (extra != null) extra.forEach(scope.setContexts);
      },
    );
  }
  
  @override
  void recordFlutterFatalError(FlutterErrorDetails details) {
    Sentry.captureException(
      details.exception,
      stackTrace: details.stack,
    );
  }

  @override
  bool recordPlatformDispatcherError(Object object, StackTrace stack) {
    Sentry.captureException(
      object,
      stackTrace: stack,
    );

    return true;
  }
```

La función captureException será la que utilizaremos con mayor frecuencia dentro de nuestro código, ya que se encarga de enviar los errores directamente a Sentry.

Por su parte, las funciones recordFlutterFatalError y recordPlatformDispatcherError actúan como wrappers del propio Sentry.captureException, pero se mantienen separadas para permitir una posible extensión o personalización futura en caso de que otras librerías requieran implementar comportamientos específicos para cada tipo de error.

Dos de estas funciones se invocan desde el archivo bootstrap.dart, para poder capturar los FlutterErrors y los detalles del PlatformDispatcher.

```dart
Future<void> bootstrap(FutureOr<Widget> Function() builder) async {
  await ErrorRadarDelegate.instance.init();

  Bloc.observer = const AppBlocObserver();

  FlutterError.onError = (details) {
    log(details.exceptionAsString(), stackTrace: details.stack);

    ErrorRadarDelegate.instance.recordFlutterFatalError(details);

    FlutterError.presentError(details);
  };

  PlatformDispatcher.instance.onError = (error, stack) {
    log(error.toString(), stackTrace: stack);

    return ErrorRadarDelegate.instance
        .recordPlatformDispatcherError(error, stack);
  };

  // Add cross-flavor configuration here
  runApp(await builder());
}
```

Para los casos de errores en logica de negocio usaremos captureException (por esto es importante siempre configurar la instancia del ErrorDelegate, para poder acceder a esta en cualquier lugar de nuestra app).

Estos errores pueden registrarse en distintas secciones del codigo, pero para efectos de los BLoCs se pueden colocar en el AppBlocObserver en el método onError():

- onError(), llamado cada vez que un error es arrojado en cualquier bloc.

```dart
@override
void onError(BlocBase<dynamic> bloc, Object error, StackTrace stackTrace) {
    log('onError(${bloc.runtimeType}, $error, $stackTrace)');

    ErrorRadarDelegate.instance.captureException(error, stackTrace);

    super.onError(bloc, error, stackTrace);
}
```

Para los errores provenientes del API, podemos capturarlos mediante la creación de un interceptor HTTP, al cual se le delega esta tarea:

1. Implementar un interceptor que intercepte todas las peticiones al backend, de modo que pueda capturar cualquier error, incluso aquellos no manejados.
2. Desde el frontend, se recomienda registrar en Sentry únicamente los siguientes tipos de errores:
  - **400 (Bad Request):** para identificar en qué parte del flujo se están produciendo solicitudes inválidas.
  - **404 (Not Found):** cuando el frontend intenta acceder a un recurso que probablemente ha sido eliminado o no existe.
  - **409 (Conflict):** para detectar conflictos al intentar ejecutar acciones que el backend no puede completar.

```dart
import 'dart:async';
import 'dart:developer';

import 'package:avilatek_core/common.dart';
import 'package:http/http.dart' as http;
import 'package:http_interceptor/http_interceptor.dart';

class SentryInterceptor implements InterceptorContract {
  SentryInterceptor({
    this.statusCodesToLog = const [400, 404, 409],
  });

  final List<int> statusCodesToLog;

  @override
  FutureOr<BaseRequest> interceptRequest({required BaseRequest request}) {
    return request;
  }

  @override
  FutureOr<BaseResponse> interceptResponse({required BaseResponse response}) {
    if (statusCodesToLog.contains(response.statusCode)) {
      try {
        var responseBody = 'Response body not available';

        ServerError serverError;

        // Check if response is a concrete Response type with body
        if (response is http.Response) {
          responseBody = response.body;
          serverError = ServerError.fromMap(responseBody);
        } else {
          // For other response types (like StreamedResponse),
          // use status code only
          serverError = ServerError(
            'HTTP Error ${response.statusCode}',
            response.statusCode,
          );
        }

        final url = response.request?.url.toString() ?? 'uknown';
        final method = response.request?.method ?? 'uknown';

        ErrorRadarDelegate.instance.captureException(
          apiError,
          StackTrace.current,
          tags: {
            'url': url,
          },
          extra: {
            'Response': {
              'status_code': response.statusCode,
              'method': method,
            },
          },
        );
      } catch (e) {
        log(
          '⚠️ Error processing HTTP error response: $e',
          name: 'SentryInterceptor',
        );
      }
    }
    return response;
  }

  @override
  FutureOr<bool> shouldInterceptRequest() {
    return false;
  }

  @override
  FutureOr<bool> shouldInterceptResponse() {
    return true;
  }
}
```

La idea es interceptar la respuesta de cada petición HTTP, mapear el error al correspondiente ServerError y luego enviarlo a Sentry.

Para aportar mayor contexto al error, podemos agregar información adicional como tags, por ejemplo:
- La URL del endpoint que falló.
- El código de estado (status code) recibido.
- El método HTTP utilizado en la solicitud.

En cuanto al body de la respuesta, hay que ser muy cuidadosos con la información que se envía. Sentry recomienda enviar únicamente lo mínimo necesario. Si es necesario registrar el contenido completo del body, lo más recomendable es hacerlo a través de logs, en lugar de enviarlo directamente a Sentry.

En este punto de la guía, la consola de Sentry ya está configurada y lista para recibir y visualizar los errores capturados desde nuestras aplicaciones.

Una vez todo esté correctamente integrado, la vista en la consola debería mostrarse de la siguiente manera:

![Sentry Project Feed](/img/mobile/errors/sentry-project-feed.png)

## Subir símbolos de depuración

Los símbolos de depuración son esenciales para comprender los stacktrace de nuestras apps cuando se producen errores. Sin símbolos de depuración, los stacktrace de código minimizado u ofuscado pueden ser difíciles o imposibles de interpretar.

**¿Qué son los símbolos de depuración?**

*Los símbolos de depuración proporcionan la información necesaria para convertir las direcciones del programa de nuevo en nombres de funciones, nombres de archivos fuente y números de línea. Al compilar una aplicación Dart, especialmente con la ofuscación u optimización habilitadas, esta información suele eliminarse del paquete principal de la aplicación para reducir su tamaño.*

Para obtenerlos y subirlos a Sentry, tenemos que agregar unos scripts adicionales en el archivo de codemagic.yaml, en la sección de publishing.

```yaml
environment:
    groups:
        - play_store_credentials
        - firebase_credentials
        - staging
        - sentry_credentials
        - all
...
publishing:
    scripts:
        - name: Ensure sentry-cli is installed
          script: |
            if ! command -v sentry-cli &> /dev/null
            then
              echo "Installing sentry-cli..."
              curl -sL https://sentry.io/get-cli/ | bash
            else
              echo "sentry-cli already installed"
            fi
        
        - name: Upload iOS dSYMs to Sentry
          script: |
            echo "Searching for iOS dSYM files..."
            dsymPath=$(find $CM_BUILD_DIR/build/ios/archive/Runner.xcarchive -name "*.dSYM" | head -1)
            if [[ -z ${dsymPath} ]]; then
              echo "No iOS debug symbols found. Skipping Sentry upload."
            else
              echo "Uploading iOS dSYMs from $dsymPath to Sentry..."
              sentry-cli --auth-token $SENTRY_AUTH_TOKEN \
                upload-dif --org $SENTRY_ORG --project $SENTRY_PROJECT \
                $dsymPath
            fi
        
        - name: Upload Android symbols to Sentry
          script: |
            echo "Uploading Android debug symbols to Sentry..."
            sentry-cli --auth-token $SENTRY_AUTH_TOKEN \
              upload-dif --org $SENTRY_ORG --project $SENTRY_PROJECT \
              build/app/outputs
```

Debes agregar un grupo de variables llamado sentry_credentials y guardar las siguientes variables:
- **SENTRY_AUTH_TOKEN** (token de autorización para subir los simbolos de depuración).
- **SENTRY_ORG** (nombre de la organización, avilatek en la mayoría de los casos a menos que sea otra organización propia del proyecto).
- **SENTRY_PROJECT** (nombre del proyecto/app, tal cual como aparece en Sentry).

![Sentry project selector](/img/mobile/errors/sentry-project-selector.png)

## Enriquecer eventos

Capturar errores es solo el primer paso; lo verdaderamente valioso es enriquecer esos eventos con información contextual que nos ayude a entender qué ocurrió, dónde y por qué.

Sentry permite adjuntar datos adicionales a cada evento, lo que facilita el diagnóstico y la trazabilidad de los errores dentro de nuestras aplicaciones.

En Flutter, podemos enriquecer los eventos agregando información como:
- Datos del usuario (por ejemplo, id, email).
- Etiquetas (tags) para clasificar errores por módulo, entorno o versión.
- Contextos personalizados, como el estado de la aplicación, configuración del dispositivo o variables relevantes al momento del fallo.
- Breadcrumbs, que registran las acciones o eventos previos al error (por ejemplo, navegación, peticiones HTTP o acciones del usuario).

Incorporar este tipo de información nos permite convertir un error genérico en un reporte con contexto útil, facilitando la detección de patrones y la resolución eficiente de problemas.

### Atributos de un evento

#### Tags

Las etiquetas son pares de cadenas de texto clave/valor que están indexadas y son buscables. También ayudan a acceder rápidamente a eventos relacionados y a ver la distribución de etiquetas para un conjunto de eventos. Los usos comunes de las etiquetas incluyen el nombre de host, la versión de la plataforma y el idioma del usuario.

![Sentry error tags](/img/mobile/errors/sentry-tags.png)

Al registrar un error con nuestra función de captureException, podemos pasar cualquier tag adicional que queramos

```dart
 ErrorRadarDelegate.instance.captureException(e, st, tags: {
     "feature": "checkout",
 })
 
  ErrorRadarDelegate.instance.captureException(e, st, tags: {
     "auth_method": "login",
 })
 
  ErrorRadarDelegate.instance.captureException(e, st, tags: {,
     "payment_method": "stripe",
 })
```

#### Contexts (o extras)

Los contextos permiten adjuntar información estructurada y detallada a cada evento.

![Sentry error context](/img/mobile/errors/sentry-contexts.png)

A diferencia de los tags (que son pares clave–valor simples y planos), los contextos pueden contener objetos anidados o información más compleja: datos del dispositivo, del usuario, del estado de la app, etc.

Al registrar un error con nuestra función de captureException, podemos pasar cualquier contexto adicional que queramos.

```dart
ErrorRadarDelegate.instance.captureException(e, st, extras: {
 'payment_info': {
    'amount': 49.99,
    'currency': 'USD',
    'method': 'credit_card',
    'items': 3,
  }
});
```

:::warning
Es importante tener mucho cuidado con la información que se envía a Sentry. Siempre se debe procurar enviar la menor cantidad de datos posible y asegurarse de que no contengan información sensible.
:::

### Configurar datos del usuario 

En Sentry, el contexto de usuario nos permite asociar los errores reportados con información específica del usuario que los generó. Esto es especialmente útil para identificar patrones, reproducir errores y medir el impacto de un problema en usuarios reales.

En nuestra implementación de ErrorRadarDelegate, definimos el método setUser, que se encarga de configurar este contexto en Sentry.

```dart
@override
void setUser(ErrorUser user) {
    final sentryUser = SentryUser(
      id: user.id,
      email: user.email,
      username: user.username,
    );
    
    Sentry.configureScope((scope) => scope.setUser(sentryUser));
}
```

Es importante establecer el usuario en el momento en que este inicia sesión o cuando se detecta un cambio de usuario dentro de la aplicación. De esta manera, los errores reportados estarán correctamente asociados al contexto del usuario activo.

Una práctica recomendada es manejar esta lógica dentro del UserBloc, ya que este componente centraliza el estado del usuario a lo largo del ciclo de vida de la aplicación. Cada vez que el UserBloc emita un nuevo estado con información de usuario (por ejemplo, después de un login exitoso o un cambio de perfil), se puede llamar a la función `setUser()` para actualizar el contexto en Sentry.

Por otro lado, contamos con el método clearScope(), el cual se encarga de limpiar toda la información del contexto actual, incluyendo los datos del usuario. Este método debe invocarse cuando el usuario cierra sesión o cuando su sesión expira, para evitar que futuros errores se registren asociados a un usuario anterior.

```dart
@override
void clearScope() {
    Sentry.configureScope((scope) => scope.clear());    
}
```

Ejemplo de implementación en UserBloc en el proyecto de Socado App

```dart
Future<void> _onUserChanged(
    UserChanged event,
    Emitter<UserState> emit,
  ) async {
    if (event.user == null) {
      ErrorRadarDelegate.instance.clearScope();

      emit(
        state.copyWith(
          user: const User.empty(),
          status: AuthenticationStatus.notAuthenticated,
        ),
      );
      return;
    }

    ErrorRadarDelegate.instance.setUser(
      ErrorUser(
        id: event.user!.id,
        email: event.user!.email,
      ),
    );

    emit(
      state.copyWith(
        user: event.user,
        status: AuthenticationStatus.authenticated,
      ),
    );
  }
```

![Sentry user context](/img/mobile/errors/sentry-user-context.png)

### Breadcrumbs

Sentry utiliza Breadcrumbs para crear un rastro de los eventos que ocurrieron antes de que surgiera un problema. Estos eventos son muy similares a los registros tradicionales, pero pueden registrar datos estructurados más completos.

Sentry nos ofrece una serie de breadcrumbs que se capturan automáticamente mediante diferentes herramientas.
Por ejemplo, el SentryNavigatorObserver permite registrar las navegaciones realizadas por el usuario, mientras que el SentryHttpClient se encarga de registrar información sobre las peticiones HTTP efectuadas por la aplicación.

Para habilitar el registro de navegaciones, simplemente debemos agregar el SentryNavigatorObserver dentro de la lista de observers en nuestro archivo router.dart

Además, mediante la función addBreadcrumb, podemos registrar manualmente información relevante desde cualquier parte de la aplicación. Esto nos permite enriquecer el contexto de los errores con eventos específicos del flujo del usuario.

No es necesario agregar breadcrumbs en toda la app, pero es recomendable hacerlo en flujos críticos, por ejemplo, cuando el usuario presiona un botón que dispara una llamada a la API o inicia un proceso importante dentro de la aplicación. De esta forma, podremos reconstruir con mayor precisión el contexto previo a un error al revisar los eventos en Sentry.

```dart
 @override
  void addBreadcrumb(ErrorBreadcrumb breadcrumb) {
    Sentry.addBreadcrumb(
      Breadcrumb(
        message: breadcrumb.message,
        category: breadcrumb.category,
        level: _mapErrorLevelToSentryLevel(breadcrumb.level),
        data: breadcrumb.data,
        timestamp: breadcrumb.timestamp,
      ),
    );
  }
```

Veamos el siguiente ejemplo de agregar un producto a un carrito:

```dart
Future<void> _addToCart(
    ProductSubmitFormOnSubmit event,
    Emitter<ProductSubmitFormState> emit,
  ) async {
    final scope =
        event.form.scope != ScopeType.none ? event.form.scope : _scope;

    emit(
      state.copyWith(
        status: ProductSubmitFormStatus.loading,
        form: event.form.copyWith(scope: scope),
      ),
    );

    ErrorRadarDelegate.instance.addBreadcrumb(
      const ErrorBreadcrumb(
        message: 'Adding product to cart',
        category: 'business_event',
      ),
    );

    final result = await _addProductToCart.execute(state.form);

    result.resolve(
      (data) {
        emit(
          state.copyWith(
            status: ProductSubmitFormStatus.success,
          ),
        );
      },
      (error) {
        emit(
          state.copyWith(
            status: ProductSubmitFormStatus.failure,
            appError: error,
          ),
        );
      },
    );
  }
```

Como podemos ver en este ejemplo, se agregó un breadcrumb que nos permite confirmar que el usuario presionó el botón para añadir un producto al carrito.

Es un caso sencillo, pero podríamos haber enriquecido este breadcrumb agregando información adicional, como el ID del producto, el nombre del evento del Bloc que se ejecutó o cualquier otro dato que ayude a contextualizar la acción.

Luego, simulamos un error en la función encargada de añadir el producto, y este es el breadcrumb que se registró en Sentry como resultado:

![Sentry Breadcrumbs](/img/mobile/errors/sentry-breadcrumbs.png)

Aquí tenemos un contexto de varias cosas, lo primero que podemos notar es que hay 3 tipos:
- **Navigation:** son los breadcrumbs que nos genera el SentryNavigatorObserver, y nos permite ver exactamente a cuales rutas el usuario accedió antes de que el error ocurriese.
- **HTTP:** son los breadcrumbs que nos genera el SentryHttpClient y nos da información de todas las peticiones que hizo el usuario.
- **business_event:** son los breadcrumbs customizados y creados por nosotros (en este caso el del ejemplo), el cual nos indicó que el usuario presionó el botón de añadir producto.

Los breadcrumbs pueden llegar a contener una gran cantidad de información, por lo que es importante definir cuidadosamente qué eventos queremos registrar.

Registrar absolutamente todo puede generar ruido innecesario y, además, consumir la cuota de eventos de Sentry más rápido de lo esperado.

En cuanto a qué registrar, dependerá del tipo de proyecto y de sus flujos críticos.

Lo ideal es enfocarse en aquellos puntos del recorrido del usuario o procesos de negocio donde un error tendría un impacto significativo, como operaciones de pago, autenticación o acciones clave dentro del flujo principal de la app.

### Otras funciones

Como ultima sección de esta guía, quedan unas 3 funciones adicionales que faltan explicar, que permiten darle contexto a los errores.

```dart
@override
void setExtra(String key, dynamic value) {
    Sentry.configureScope((scope) => scope.setContexts(key, value));
}

@override
void setTag(String key, String value) {
    Sentry.configureScope((scope) => scope.setTag(key, value));
}
  
@override
void captureMessage(
    String message, {
    ErrorLevel level = ErrorLevel.info,
    Map<String, String>? tags,
    Map<String, dynamic>? extra,
}) {
    Sentry.captureMessage(
      message,
      level: _mapErrorLevelToSentryLevel(level),
      withScope: (scope) {
        if (tags != null) tags.forEach(scope.setTag);
        if (extra != null) extra.forEach(scope.setContexts);
      },
    );
}
```

- Los métodos setExtra y setTag sirven para configurar tags y contextos de forma global, es decir, no van atadas a un evento específico.
- captureMessage, que sirve para registrar eventos que no son excepciones, pero que quieres rastrear o monitorizar, como mensajes de depuración, alertas importantes o checkpoints dentro de tu aplicación.