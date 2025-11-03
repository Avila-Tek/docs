---
sidebar_position: 2
---

# Implementación de logs

## Paso 1: Inicializar el logger

### Dependencias y packages
Es necesario añadir los siguientes packages a las dependencias de la app [loki_logger](https://pub.dev/packages/loki_logger) y [http_interceptor](https://pub.dev/packages/http_interceptor) 

### Configuraciones básicas del Logger 
Se debe crear una clase LoggerSettings para manejar las configuraciones basicas del logger. La clase debe lucir tal que asi.

 ```dart
 class LoggerSettings {
  LoggerSettings({
    required this.loggerName,
    required this.server,
    required this.username,
    required this.password,
    required this.appName,
    required this.environment,
    required this.version,
  });

  final String loggerName;
  final String server;
  final String username;
  final String password;
  final String appName;
  final String environment;
  final String version;
}
 ``` 
Para la conexión con Loki, se deben setear tres variables de entorno que permiten la autenticación en la plataforma. Estas variables son: 

```env
LOGGER_SERVER_HOST=
LOGGER_USERNAME=
LOGGER_PASSWORD=
```
:::warning
El valor de las mismas es proporcionado por el departamento de DevOps. Estas variables se declaran al momento de inicializar los settings, siendo estas los siguientes campos de la clase LoggerSettings:
```
server: loggerServer (LOGGER_SERVER_HOST),
username: loggerUsername (LOGGER_USERNAME),
password: loggerPassword (LOGGER_PASSWORD),
```

:::

### Clase AppLogger
Se debe crear una clase AppLogger la cual contenga los siguientes métodos.

```dart
class AppLogger {
  static late LokiLogger _lokiLogger;

  static String _userId = 'UNKNOWN-ID';
  static String _userEmail = 'UNKNOWN-EMAIL';

  static void initializeLogger({
    required LoggerSettings settings,
  }){}

  static void _log({
    required Level level,
    required String message,
    Object? error,
    StackTrace? stackTrace,
  }) {
  ...
  }

  static void info(
    String message, {
    List<String> tags = const [],
    Object? error,
    StackTrace? stackTrace,
  }) {
  ...
  }

  static void warning(
    Object? message, {
    List<String> tags = const [],
    StackTrace? stackTrace,
  }) {
  ...
  }

  static void success(
    Object? message, {
    List<String> tags = const [],
    StackTrace? stackTrace,
  }) {
  ...
  }


  static void error(
    Object? message, {
    List<String> tags = const [],
    StackTrace? stackTrace,
  }){
  ...
  }

  static void response(
    String message, {
    List<String> tags = const [],
    StackTrace? stackTrace,
  }){
  ...
  }

  static void request(
    Object? message, {
    List<String> tags = const [],
    StackTrace? stackTrace,
  }) {
  ...
  }

  static void setUserId(String? userId) => _userId = userId ?? 'UNKNOWN-ID';

  static void setUserEmail(String? userEmail) =>
      _userEmail = userEmail ?? 'UNKNOWN-EMAIL';
}
```


El método initialize debe ser un método estático y se debe realizar la inicialización del paquete [loki_logger](https://pub.dev/packages/loki_logger). Tal como se muestra a continuación.

```dart
static void initializeLogger({
  required LoggerSettings settings,
}) {
  _lokiLogger = LokiLogger(
    name: settings.username,
    config: LokiConfig(
      host: settings.server,
      basicAuth: '${settings.username}:${settings.password}',
      labels: {
        'app': settings.appName,
        'env': settings.environment,
        'version': settings.version,
      },
    ),
  );
}
```

Este método se debe llamar en el main pasando la configuración respectiva del logger para cada ambiente (development, staging y production). A continuación se muestra la configuración inicial para el ambiente de development.

```dart
//LOGGER ENVS
final loggerServer = env.get(EnvKeys.lokiLoggerServer);
final loggerUsername = env.get(EnvKeys.lokiLoggerUsername);
final loggerPassword = env.get(EnvKeys.lokiLoggerPassword);

//APP VERSION
final appInfoService = AppInfoServiceImpl();
final appVersion = await appInfoService.checkAppVersion();

//LOGGER SETTINGS
final loggerSettings = LoggerSettings(
  server: loggerServer,
  username: loggerUsername,
  password: loggerPassword,
  environment: 'dev',
  appName: [YOUR APPNAME],
  version: appVersion.data!.toString(),
  loggerName: [YOUR LOGGERNAME],
);

//INITIALIZE LOGGER
AppLogger.initializeLogger(settings: loggerSettings);
```

### Labels
Los labels son una funcionalidad de Loki que permite organizar y agrupar los mensajes de registro en flujos. Deben ser valores de baja cardinalidad. Es decir, no deberían ser atributos que puedan tener muchos valores (por ejemplo: Fechas o IDs). 

En su lugar, los labels deben estar limitados a valores estáticos, como el ambiente (DEV, STG o PROD), el nombre de la app, o la versión (que si bien es un atributo que puede variar, es altamente relevante a los logs y no varía con demasiada frecuencia). 

Estos valores se pueden ajustar al momento de inicializar el Logger.
  
## Paso 2: Estructura

### Estructura de los logs
Para mantener un orden claro que facilite la legibilidad de los logs, se estableció una estructura definida por tipo de log, de manera tal que siempre lleguen a la consola de la misma manera. Esto se declara en los métodos que se definieron en la clase `AppLogger`.

Para el log básico y principal, la estructura es la siguiente: 

```dart
/// Logs a message using `developer.log`.
///
/// [level]: An optional integer level for the log, useful for filtering.
/// [message]: The message to be logged.
/// [error]: An optional error object associated with the log.
/// [stackTrace]: An optional stack trace associated with the log.

static void _log({
    required Level level,
    required String message,
    Object? error,
    StackTrace? stackTrace,
  }) =>
      _lokiLogger.log(
        level,
        '[$_userId][$_userEmail] || $message',
        error,
        stackTrace,
      );
```
Por otra parte, los demás métodos corresponden a una misma estructura que añade al inicio del mensaje el tipo de log correspondiente junto a un emoji representativo, los tags adicionales que añada el desarrollador y el mensaje. Los métodos quedarían de la siguiente manera:

```dart
static void info(
    String message, {
    List<String> tags = const [],
    Object? error,
    StackTrace? stackTrace,
  }) {
    _log(
      level: Level.info,
      message: '[📊INFO]${tags.map((tag) => '[$tag]').join()}: $message',
      error: error,
      stackTrace: stackTrace,
    );
  }
  
  static void warning(
    Object? message, {
    List<String> tags = const [],
    StackTrace? stackTrace,
  }) =>
      _log(
        level: Level.warning,
        message: '[⚠️WARNING]${tags.map((tag) => '[$tag]').join()}: $message',
        stackTrace: stackTrace,
      );

  static void success(
    Object? message, {
    List<String> tags = const [],
    StackTrace? stackTrace,
  }) =>
      _log(
        level: Level.info,
        message: '[✅SUCCESS]${tags.map((tag) => '[$tag]').join()}: $message',
        stackTrace: stackTrace,
      );

  static void error(
    Object? message, {
    List<String> tags = const [],
    StackTrace? stackTrace,
  }) =>
      _log(
        level: Level.error,
        message: '[❌ERROR]${tags.map((tag) => '[$tag]').join()}: $message',
        stackTrace: stackTrace,
      );

  static void response(
    String message, {
    List<String> tags = const [],
    StackTrace? stackTrace,
  }) =>
      _log(
        level: Level.info,
        message: '[⬇️RESPONSE]${tags.map((tag) => '[$tag]').join()}: $message',
        stackTrace: stackTrace,
      );

  static void request(
    Object? message, {
    List<String> tags = const [],
    StackTrace? stackTrace,
  }) =>
      _log(
        level: Level.info,
        message: '[⬆️REQUEST]${tags.map((tag) => '[$tag]').join()}: $message',
        stackTrace: stackTrace,
      );
```

### Variables del usuario.
Cada log debe mostrar el email y el id del usuario que lo generó. Estas propiedades deben agregarse a través de los métodos `setUserId` y `setUserEmail` propios de la clase `AppLogger`. Estos métodos deben llamarse en el `UserApi`, específicamente en el método `getCurrentUser`, tal como se muestra a continuación.

```dart 
Future<Result<User, UserError>> getCurrentUser() async {
  //...
  //Your logic to get the user
  //...
  AppLogger.setUserId(user.id);
  AppLogger.setUserEmail(user.email);
}
```

## Paso 3: Interceptors

Los interceptors son métodos que funcionan como intermediario entre la aplicación y el servidor, permitiendo interceptar las solicitudes y respuestas de red antes de que ingresen a la aplicación. Se usan comúnmente para tareas como agregar encabezados de autenticación, registrar solicitudes y respuestas para depuración, manejar errores de manera centralizada, y reintentar llamadas fallidas. En este caso serán de ayuda para loggear las peticiones y respuestas de cada petición.

### Clase InterceptorHttpClient
Se debe crear una clase `InterceptorHttpClient` la cual debe extender de http.BaseClient. La clase debe lucir como se muestra a continuación.

```dart
class InterceptorHttpClient extends http.BaseClient {
  InterceptorHttpClient._({
    required HeadersInjector headersInjector,
    ErrorRadarDelegate? errorRadar,
    http.Client? inner,
  })  : _inner = inner ?? http.Client(),
        _headersInjector = headersInjector,
        _errorRadar = errorRadar;

  factory InterceptorHttpClient.withRetry({
    required HeadersInjector headersInjector,
    required RetryPolicy retryPolicy,
    required List<InterceptorContract> interceptors,
    ErrorRadarDelegate? errorRadar,
    http.Client? client,
  }) =>
      InterceptorHttpClient._(
        headersInjector: headersInjector,
        errorRadar: errorRadar,
        inner: InterceptedClient.build(
          interceptors: interceptors,
          retryPolicy: retryPolicy,
          client: client,
        ),
      );

  final HeadersInjector _headersInjector;
  final http.Client _inner;
  final ErrorRadarDelegate? _errorRadar;

  @override
  Future<http.Response> get(
    Uri url, {
    Map<String, String>? headers,
  }{}

  @override
  Future<http.Response> delete(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }){}

  @override
  Future<http.Response> patch(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }){}

  @override
  Future<http.Response> post(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }){}

  @override
  Future<http.Response> put(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }){}

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request){}
}
```

Esta clase debe mantener su constructor privado e inicializarse a través del constructor factory `InterceptorHttpClient.withRetry()` tal como se muestra a continuación.

```dart
final client = InterceptorHttpClient.withRetry(
  headersInjector: //... HEADER INJECTOR,
  retryPolicy: //... REFRESH TOKEN POLICY
  interceptors://...INTERCEPTORS,
);
```

Este constructor tiene acepta 2 parámetros importantes. El primero es retryPolicy, el cual contiene toda la implementación necesaria para realizar el refresh del token de autenticación. El segundo parámetro que acepta es interceptors el cual es un array que debe contener todos los interceptors de tu app.

### LoggerInterceptor
La clase `LoggerInterceptor` se utiliza en el método factory `InterceptorHttpClient.withRetry() `de la clase `InterceptorHttpClient`. Esta clase permite setear las configuraciones específicas para los métodos del interceptor. 

Se debe crear esta clase `LoggerInterceptor`, que extienda de `InterceptorContract` (clase proveniente del package `http_interceptor`). De la siguiente manera:

```dart
class LoggerInterceptor extends InterceptorContract {
  LoggerInterceptor();

  @override
  FutureOr<BaseRequest> interceptRequest({required BaseRequest request}) {}
  
  @override
  FutureOr<BaseResponse> interceptResponse({required BaseResponse response}) {}
}
```

La clase contiene dos métodos: `interceptRequest` e `interceptResponse`. La primera corresponde a la información enviada por la app al backend. (POST, PATCH), tal como se ve en el código:  

```dart
@override
FutureOr<BaseRequest> interceptRequest({required BaseRequest request}) {
    final remoteRequest = request as Request;
    final url = request.url.toString();
    final body =
        remoteRequest.body.isEmpty ? '' : '||BODY|| ${remoteRequest.body}';

    AppLogger.request(
        '$url $body',
        tags: [request.method],
    );
    return request;
}
```

El segundo método, que corresponde a interceptar los responses provenientes del backend, debe estructurarse de la siguiente manera, para seccionar el tipo de llamada correspondiente al código de respuesta: 

```dart
@override
FutureOr<BaseResponse> interceptResponse({required BaseResponse response}) {
    final remoteResponse = response as Response;

    final url = response.request?.url.toString() ?? '';
    final body =
        remoteResponse.body.isEmpty ? '' : '||BODY|| ${remoteResponse.body}';

    AppLogger.response(
        '$url $body',
        tags: response.request?.method == null ? [] : [response.request!.method],
    );

    final decodedBody = json.decode(remoteResponse.body) as DataMap? ?? {};

    final message = decodedBody['message'] ?? 'No message';

    if (remoteResponse.statusCode >= 200 && remoteResponse.statusCode < 300) {
        AppLogger.success(
        message.toString(),
        tags: ['${response.statusCode}'],
        );
    }

    if (remoteResponse.statusCode > 300 && remoteResponse.statusCode < 400) {
        AppLogger.warning(
        message,
        tags: ['${response.statusCode}'],
        );
    }

    if (response.statusCode >= 400) {
        AppLogger.error(
        message,
        tags: ['${response.statusCode}'],
        );
    }

    return response;
}
```

Además, se setea la estructura del cuerpo del mensaje `'||BODY|| ${remoteResponse.body}'`. Que va a permitir dividir la información inicial (el tipo de log, los datos del usuario, etc) del body del response; y añadir los tags correspondientes al código de status.

### RefreshTokenPolicy
Se debe crear una clase `RefreshTokenPolicy` la cual debe extender de `RetryPolicy` (clase proveniente del package http_interceptor). Esta clase debe sobreescribir el método `shouldAttemptRetryOnResponse(BaseResponse response)` el cual se va a encargar de reintentar la petición siempre que ocurra un error de autenticación (Normalmente asociados a la expiración del token). A continuación se muestra una implementación básica de la clase.

```dart
class RefreshTokenPolicy extends RetryPolicy {
  RefreshTokenPolicy({
    required IRefreshToken refreshTokenService,
  }) : _refreshTokenService = refreshTokenService;

  final IRefreshToken _refreshTokenService;

  @override
  Future<bool> shouldAttemptRetryOnResponse(BaseResponse response) async {
    try {
      final savedToken = await _refreshTokenService.currentToken;

      if (response.statusCode != 401) {
        AppLogger.info(
          'The session token is maintained: $savedToken',
          tags: ['🔑TOKEN'],
        );
        return false;
      }

      if (response.statusCode == 401) { 
      
      //Refresh token when status code is 401 Unauthorized
        await _refreshTokenService.refreshToken();
        return true;
      }

      return true;
    } catch (e, s) {
      AppLogger.error(
        'Error getting a new token',
        stackTrace: s,
      );
      return false;
    }
  }
}
```

Es importante destacar que este método únicamente se encarga de refrescar el token y reintentar la petición, sin embargo, falta agregar el token actualizado al header de la petición, esto lo implementaremos en el `RefreshTokenInterceptor`

### RefreshTokenInterceptor 

Se debe crear una clase `RefreshTokenInterceptor` la cual extienda de InterceptorContract(clase proveniente del package `http_interceptor`). Esta clase debe sobreescribir el método `interceptRequest({required BaseRequest request})` el cual se va a ejecutar antes de cada petición. A continuación se muestra una implementación básica de la clase.

```dart
class RefreshTokenInterceptor extends InterceptorContract {
  RefreshTokenInterceptor({
    required this.headersInjector,
  });

  final HeadersInjector headersInjector;

  @override
  FutureOr<BaseRequest> interceptRequest({required BaseRequest request}) async {
    final token = await headersInjector.get(HttpHeaders.authorizationHeader);

    if (token == null || token.isEmpty) {
      return request;
    }
    
    //Inject the new token in the http header
    request.headers[HttpHeaders.authorizationHeader] = token;

    AppLogger.request(
      request.url.toString(),
      tags: [request.method],
    );
    
    return request;
  }

  @override
  FutureOr<BaseResponse> interceptResponse({
    required BaseResponse response,
  }) async {
    return response;
  }
}
```

Esta clase se va a encargar de mantener el header del request actualizado previo a cada petición.

## Paso 4: Implementación final.

Por último, se deben agregar nuestras 3 clases `InterceptorHttpClient.withRetry()` de la siguiente forma.

```dart
final client = InterceptorHttpClient.withRetry(
  headersInjector: httpHeadersInjector,
  retryPolicy: RefreshTokenPolicy(
    refreshTokenService: FirebaseRefreshToken(
      headersInjector: httpHeadersInjector,
      isBearerToken: true,
    ),
  ),
  interceptors: [
    RefreshTokenInterceptor(
      headersInjector: httpHeadersInjector,
    ),
    LoggerInterceptor(),
  ],
);
```