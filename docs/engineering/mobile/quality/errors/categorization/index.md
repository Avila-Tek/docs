---
sidebar_position: 1
---

# Definición y categorización de errores

Este será el primer paso para gestionar de forma adecuada los errores que recibimos desde el backend en nuestras aplicaciones. El objetivo es establecer una base sólida para que todo el equipo pueda manejar y responder a estos errores de manera uniforme.

:::note
Es fundamental haber leído previamente la Guía 1: Estructura y categorización de los errores de backend, ya que en ella se definen los criterios y estándares que utilizaremos para identificar y clasificar los distintos tipos de errores.
:::

En esta sección aprenderemos a definir y mapear los errores en nuestra aplicación, partiendo de la estructura estandarizada que el backend nos enviará ante cualquier incidente o fallo durante una petición. Para esto, vamos a partir del **ErrorResponse** presentado en la guía:

```typescript
interface ErrorResponse {
  type: string;
  code: string;
  title: string;
  message: string;
  status: number;
  details: Record<string, any>[];
  stack?: string; // Solo para entornos de desarrollo
}
```
Esta interfaz presenta una serie de atributos (explicados detalladamente en la guía especificada previamente) los cuales vamos a mapear en una clase en nuestro proyecto, lo cual será explicado a continuación.

## Clase BaseError

Es la Interfaz base mínima para todos los tipos de error en la aplicación. Esta clase abstracta proporciona la estructura esencial que todos los objetos de error deben implementar, sirviendo como base para diferentes orígenes de errores.

Todos los tipos de error deben extender esta interfaz para garantizar un manejo de errores coherente en toda la aplicación.

```dart
abstract class BaseError implements Exception {
  const BaseError();
}
```

## Clase ServerError

Representa un error que se origina en una respuesta del servidor o de la API.

Esta clase extiende BaseError y contiene toda la información de error específica del servidor, incluyendo la clasificación del tipo, los códigos de error, el estado HTTP y los detalles estructurados. Proporciona una forma estandarizada de gestionar los errores del lado del servidor. Este es el error que se mapeará y arrojará en la capa de datos (específicamente en nuestros archivos donde se implementan los endpoints del backend).

```dart
class ServerError extends BaseError {
  const ServerError({
    required this.type,
    required this.code,
    required this.title,
    required this.message,
    required this.status,
    this.details,
  });

  factory ServerError.fromMap(Map<String, dynamic> map) {
    return ServerError(
      type: ServerErrorType.fromValue(map['type'] as String? ?? ''),
      code: map['code'] as String? ?? '',
      title: map['title'] as String? ?? '',
      message: map['message'] as String? ?? '',
      status: map['status'] as int? ?? 500,
      details: map['details'] as List?,
    );
  }
  
  final ServerErrorType type;
  final String code;
  final String title;
  final String message;
  final int status;
  final List<dynamic>? details;

  @override
  String toString() {
    return '[$status]: ${type.name} - $code';
  }
}
```

### Enum ServerErrorType

Como pueden observar, uno de los atributos es el tipo de error que se maneja. Para ello hemos creado el siguiente enum:

```dart
enum ServerErrorType {
  validationError('VALIDATION_ERROR'),
  authenticationError('AUTHENTICATION_ERROR'),
  authorizationError('AUTHORIZATION_ERROR'),
  notFoundError('NOT_FOUND_ERROR'),
  conflictError('CONFLICT_ERROR'),
  rateLimitError('RATE_LIMIT_ERROR'),
  domainError('DOMAIN_ERROR'),
  internalServerError('INTERNAL_SERVER_ERROR'),
  externalServiceError('EXTERNAL_SERVICE_ERROR');

  const ServerErrorType(this.name);

  final String name;

  factory ServerErrorType.fromValue(String value) {
    return ServerErrorType.values.firstWhere(
      (e) => e.name == value,
      orElse: () => ServerErrorType.internalServerError,
    );
  }
}
```

Este enum se utilizará principalmente para mapear la información recibida del backend y tener una referencia clara y centralizada de los distintos tipos de error. El atributo type servirá luego como base para definir clases abstractas específicas, sobre las cuales se derivarán otros errores concretos.

En otras palabras, **este enum establece la categorización de los errores que podrá manejar nuestra aplicación.** Esto lo veremos más adelante en la guía.

:::warning
- Estos tipos representan los definidos actualmente por el backend.
- No se deben agregar nuevos tipos a menos que el backend lo haga explícitamente.
:::

## Clase AppError

Es la clase base de errores de la aplicación que proporciona un sistema unificado de gestión de errores.
Esta clase extiende BaseError y sirve como base para todos los errores a nivel de aplicación, independientemente de su origen. Los errores de la aplicación pueden ser:

- **Transformados a partir de errores del servidor:** A partir de respuestas de la API.
- **Creados directamente:** Para validaciones locales, lógica de negocio o errores de paquetes.
- **Generados por paquetes:** Errores de bibliotecas externas encapsulados como errores de la aplicación.

La clase permite la creación flexible de errores y proporciona información estandarizada obre los errores a nivel de aplicación, que es coherente independientemente del origen del error.

```dart
class AppError extends BaseError {
  const AppError({
    required this.title,
    required this.message,
  });

  final String title;
  final String message;

  @override
  String toString() {
    return '$runtimeType: $message';
  }
}
```

### Método `toString()`

Sirve para crear un mensaje custom que nos va a servir luego para ver la información en Sentry o Crashlytics.

:::info
Es importante destacar que a partir de AppError también pueden derivarse otros tipos de errores específicos que no estén relacionados directamente con el servidor, por ejemplo:
- Errores locales de validación en el cliente.
- Errores de permisos a nivel de dispositivo (GPS, cámara, etc.).
- Errores de red o conectividad detectados en el frontend.
- Errores derivados de procesos internos de la app.
Lo fundamental es que, independientemente de su origen, todos los errores terminen representados como un AppError o alguna de sus subclases, ya que esta es la clase base que usaremos para manejar los errores en la UI.
:::

## Categorización de AppError en base al ServerErrorType

Como comenté anteriormente, "el ServerErrorType establece la categorización de los errores que podrá manejar nuestra aplicación". De esta manera, por cada ServerErrorType se define cada uno de los errores correspondientes:

```dart
class AuthenticationError extends AppError {
  const AuthenticationError({
    required super.title,
    required super.message,
    this.details,
  });
  
  factory AuthenticationError.fromServerError(ServerError serverError) {
    return AuthenticationError(
      title: serverError.title,
      message: serverError.message,
      details: serverError.details,
    );
  }
  
  final List<dynamic>? details;

  static AuthenticationError fromServerErrorWithMapper<T>(
    ServerError serverError, {
    required T Function(Map<String, dynamic>) detailsMapper,
  }) {
    List<T>? mappedDetails;
    if (serverError.details != null) {
      mappedDetails = serverError.details!
          .whereType<Map<String, dynamic>>()
          .map((Map<String, dynamic> item) => detailsMapper(item))
          .toList();
    }

    return AuthenticationError(
      title: serverError.title,
      message: serverError.message,
      details: mappedDetails,
    );
  }
}
```

### Método `fromServerError()`

Crea un AuthenticationError a partir de un ServerError. Transforma el error de autenticación del servidor en un error a nivel de aplicación.

```dart
final authError = AuthenticationError.fromServerError(serverError);
```

### Método `fromServerErrorWithMapper<T>()`

Crea un AuthenticationError a partir de un ServerError con detalles mapeados. La función detailsMapper permite transformar los detalles brutos del servidor en objetos de modelo específicos. Esto es útil cuando los errores de autenticación contienen información estructurada sobre intentos de autenticación fallidos.

```dart
final error = AuthenticationError.fromServerErrorWithMapper(
  serverError,
  detailsMapper: (detailMap) => AuthDetail.fromMap(detailMap),
);
```

Luego de definir todos los errores de esta manera, tendremos entonces los siguientes archivos.

```
authorization_error.dart
authentication_error.dart
conflict_error.dart
domain_error.dart
external_service_error.dart
internal_server_error.dart
not_found_error.dart
rate_limit_error.dart
validation_error.dart
```

## Definición de errores específicos por código

En la interfaz ErrorResponse existe un atributo llamado code, el cual indica el error específico arrojado por el backend.

Este campo es fundamental porque permite distinguir casos concretos dentro de una misma categoría de error (por ejemplo, diferentes códigos dentro de un mismo ServerErrorType) y, en consecuencia, ejecutar acciones específicas en la aplicación.

Por ejemplo:
- El backend puede devolver un HTTP 404 (Not Found) para diferentes escenarios.
- Uno de esos escenarios podría tener code = "USER_NOT_FOUND".
- Aun cuando no es un 401 Unauthorized, podemos decidir que si llega un UserNotFound saquemos al usuario de sesión por seguridad.

Esto nos da la flexibilidad de:
- Diferenciar subcasos dentro del mismo ServerErrorType.
- Tomar decisiones de negocio o UX personalizadas para ciertos códigos.
- Crear subclases específicas de AppError basadas en code cuando sea necesario.

De esta lógica se encargará un mapper que veremos más adelante, al cual se le delega toda la tarea de mapear ServerErrors de acuerdo al codigo y tipo.

### Implementación en errores concretos

Siguiendo este ejemplo, podemos tener en not_found_error.dart algo como:

```dart
class NotFoundError extends AppError {
  const NotFoundError({
    required super.title,
    required super.message,
    this.details,
  });
  
  factory NotFoundError.fromServerError(ServerError serverError) {
    return NotFoundError(
      title: serverError.title,
      message: serverError.message,
      details: serverError.details,
    );
  }
  
  final List<dynamic>? details;

  static NotFoundError fromServerErrorWithMapper<T>(
    ServerError serverError, {
    required T Function(Map<String, dynamic>) detailsMapper,
  }) {
    List<T>? mappedDetails;
    if (serverError.details != null) {
      mappedDetails = serverError.details!
          .whereType<Map<String, dynamic>>()
          .map((Map<String, dynamic> item) => detailsMapper(item))
          .toList();
    }

    return NotFoundError(
      title: serverError.title,
      message: serverError.message,
      details: mappedDetails,
    );
  }
}

class UserNotFoundError extends NotFoundError {
  const UserNotFoundError({
    required super.title,
    required super.message,
    super.details,
  });

  factory UserNotFoundError.fromServerError(ServerError serverError) {
    return UserNotFoundError(
      title: serverError.title,
      message: serverError.message,
      details: serverError.details
           .map((e) => UserNotFoundDetails.fromMap(e as Map<String, dynamic>))
           .toList(),
    );
  }
}
```

### Ventaja adicional: mapeo de details

Este enfoque es especialmente potente porque el backend puede devolver datos adicionales en el parámetro details, y nosotros podemos mapear esa información a modelos específicos para mostrar mensajes más detallados o actuar en consecuencia.

Por ejemplo:
- **Validaciones de formularios:** cada campo podría venir con su mensaje de error.
- **Restricciones de negocio:** mostrar causas exactas del rechazo.
- Datos extra para debugging en modo desarrollo.

En este caso, UserNotFoundDetails.fromMap() convertiría cada item del details en un objeto fuertemente tipado, lo que facilita muchísimo su uso en la UI. Estos detalles no se limitan solo a errores personalizados por code; también pueden aplicarse directamente a alguno de los errores base definidos por categoría.

Por ejemplo, si el backend decide que todos los ValidationError van a regresar un conjunto específico de detalles (por ejemplo, errores de campos de formularios), podemos mapear esa información a un modelo de detalle específico.
Esto nos permite que cualquier ValidationError ya venga listo con su lista de errores de campos, sin tener que crear un code diferente por cada escenario.

## ErrorMapper

El ErrorMapper es un mapeador de errores centralizado que transforma los errores del servidor (ServerErrors) en errores de la aplicación (AppErrors) mediante un enfoque basado en la configuración. 

ErrorMapper proporciona una forma declarativa de gestionar las respuestas de error del servidor configurando asignaciones específicas para códigos de error, tipos de error y escenarios alternativos. Esto elimina la necesidad de sentencias switch repetitivas y proporciona un enfoque coherente y fácil de mantener para la transformación de errores.

### Características principales

- **Asignación específica por código:** Gestiona códigos de error exactos con lógica personalizada.
- **Alternativas basadas en el tipo:** Asigna tipos de error a subclases estándar de AppError.
- **Gestión predeterminada:** Garantiza que todos los errores se transformen, incluso los desconocidos.

```dart
class ErrorMapper {
  factory ErrorMapper.configure(
    void Function(ErrorMapperConfig) configurator,
  ) {
    final config = ErrorMapperConfig();
    configurator(config);
    return ErrorMapper._(config);
  }

  const ErrorMapper._(this._config);

  final ErrorMapperConfig _config;

  AppError fromServerError(ServerError serverError) {
    return _config.mapError(serverError.code, serverError);
  }
}
```

### Configuración

El constructor utiliza una función de configuración para definir los manejadores de mapeo de errores de forma clara y legible. Esta función recibe una instancia de ErrorMapperConfig, que permite establecer manejadores por código, manejadores por tipo y el comportamiento predeterminado.

La función de configuración se ejecuta una única vez durante la creación de ErrorMapper, lo que facilita centralizar toda la lógica de mapeo en un único bloque coherente. Este enfoque mejora la legibilidad y la mantenibilidad en comparación con los métodos de configuración imperativos.

```dart
 final mapper = ErrorMapper.configure((config) {
   // Handle specific error codes
   config.codeHandlers = {
     'USER_NOT_FOUND': (serverError) => NotFoundError.fromServerError(serverError),
     'INVALID_EMAIL': (serverError) => ValidationError.fromServerError(serverError),
   };
   
   // Handle errors by type
   config.withStandardTypes();

   // Override specific error types (only if necessary).
   config.typeHandlers = {
     ServerErrorType.authenticationError: AuthenticationError.fromServerError,
     ServerErrorType.authorizationError: AuthorizationError.fromServerError,
   };

   // Define default behavior
   config.defaultHandler = (serverError) => AppError(message: serverError.message);
 });
```

### Método `fromServerError()`

Transforma un ServerError en un AppError utilizando las asignaciones configuradas. Este es el punto de entrada principal para la transformación de errores. Recibe un ServerError (normalmente proveniente de una respuesta de API) y aplica la lógica de asignación configurada para generar un AppError adecuado para su uso en la aplicación.

## ErrorMapperConfig

La clase ErrorMapperConfig se encarga de definir cómo los errores del servidor (ServerError) se convierten en errores de la aplicación (AppError).

Funciona como una configuración declarativa, donde puedes registrar diferentes tipos de manejadores de error según tus necesidades.

Esta clase soporta tres niveles de mapeo, ordenados por prioridad:
1. **Manejadores por código:** se usan cuando quieres tratar un error específico (por ejemplo, "USER_NOT_FOUND" o "EMAIL_ALREADY_EXISTS").
2. **Manejadores por tipo:** se usan como respaldo cuando no hay un código específico, y agrupan los errores por tipo general (por ejemplo, validationError, authenticationError, etc.).
3. **Manejador predeterminado:** se usa cuando ningún otro coincide, asegurando que todos los errores del servidor puedan transformarse en algo manejable por la app.

Gracias a esta clase, puedes centralizar toda la lógica de mapeo de errores en un solo lugar.

```dart
class ErrorMapperConfig {
  final Map<String, AppError Function(ServerError)> _codeHandlers = {};
  final Map<ServerErrorType, AppError Function(ServerError)> _typeHandlers = {};
  AppError Function(ServerError)? _defaultHandler;
  
  set codeHandlers(Map<String, AppError Function(ServerError)> handlers) {
    _codeHandlers.clear();
    for (final entry in handlers.entries) {
      _codeHandlers[entry.key.toUpperCase()] = entry.value;
    }
  }

  Map<String, AppError Function(ServerError)> get codeHandlers =>
      Map.unmodifiable(_codeHandlers);

  set typeHandlers(
    Map<ServerErrorType, AppError Function(ServerError)> handlers,
  ) {
    _typeHandlers
      ..clear()
      ..addAll(handlers);
  }

  Map<ServerErrorType, AppError Function(ServerError)> get typeHandlers =>
      Map.unmodifiable(_typeHandlers);

  set defaultHandler(AppError Function(ServerError) handler) {
    _defaultHandler = handler;
  }

  AppError Function(ServerError) get defaultHandler =>
      _defaultHandler ??
      (serverError) => AppError(
            title: serverError.title,
            message: serverError.message,
          );

  AppError mapError(String code, ServerError serverError) {
    // Try code-specific handler first
    final codeHandler = _codeHandlers[code.toUpperCase()];
    if (codeHandler != null) {
      return codeHandler(serverError);
    }

    // Try type-specific handler
    final typeHandler = _typeHandlers[serverError.type];
    if (typeHandler != null) {
      return typeHandler(serverError);
    }

    // Use default handler
    return defaultHandler(serverError);
  }
}
```

## Implementación en proyectos

Todas las clases relacionadas al manejo de errores se encuentran implementadas en la librería de FCL. Lo que queda de parte de cada developer es implementarlo en sus respectivos proyectos.

Para esto, comienza importando en el pubspec.yaml el paquete de afp.

```yaml
afp:
    git:
      url: https://github.com/Avila-Tek/flutter_common_lib.git
      ref: afp-x.x.x (to be defined)
      path: packages/afp
```

Luego, crea una clase AppErrorMapper. Lo que hará esta clase es encargarse de configurar el ErrorMapper de afp y asignarlo a una instancia para acceder a este en nuestra capa de datos.

```dart
import 'package:afp/afp.dart';

extension ServerErrorExtensions on ServerError {
  AppError toAppError() {
    return AppErrorMapper.instance.fromServerError(this);
  }
}

class AppErrorMapper {
  AppErrorMapper._();

  static final instance = ErrorMapper.configure((config) {
    config.codeHandlers = {
        'CUSTOM_ERROR': (error) => CustomError.fromServerError(error);
    };

    config.withStandardTypes();
    
    //config.typeHandlers = {}; de ser necesario sustituir algún type handler.

    config.defaultHandler = (serverError) => AppError(
          title: serverError.title,
          message: serverError.message,
        );
  });
}
```

Con esta clase implementada, podemos acceder a su instancia mediante AppErrorMapper.instance y utilizar el método fromServerError() para crear cualquier AppError a partir de un ServerError.

Por último, para simplificar su uso, podemos definir una extensión que nos evite escribir AppErrorMapper.instance en cada ocasión. Así, podremos simplemente llamar a error.toAppError().

### Ejemplos de capa de dato y dominio

```dart
class ExampleApi {
...

  @override
  Future<Result<Model, ServerError>> getData() async {
    try {
      final response = await _http.get(Uri.parse(endpoint));

      switch (response.statusCode) {
        case 200:
          final data = Model.fromMap(response);

          return Success(data);

        default:
          return Failure(ServerError.fromMap(response.body));
      }
    } catch (e, s) {
      return Failure(const ServerError());
    }
  }
  
...
}
```

```dart
class ExampleRepo {
  final ExampleApi _api;

  ExampleRepo({required ExampleApi api}) : _api = api;

  Future<Result<Model, AppError>> fetchData() async {
    final result = await _api.getData();

    if (result is Failure) {
      return Failure(result.error!.toAppError());
    }

    return Success(result.data!);
  }
}
```

## Pasos 

Ya contamos con un mapeo de errores robusto que nos permite traducir y clasificar cualquier error proveniente del backend o interno de la app.

El siguiente paso es implementar un manejador centralizado que se encargue de ejecutar acciones en la aplicación dependiendo del error.

Este manejador tendrá como objetivo:
- Recibir cualquier AppError generado en la aplicación.
- Evaluar el tipo y/o código del error para decidir qué acción ejecutar.
- Centralizar las respuestas para no duplicar lógica en diferentes pantallas o capas.