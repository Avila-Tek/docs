# Repositorios

Los repositorios son los responsables de mediar entre la capa de dominio y los Data Sources. Reciben entidades y parámetros del dominio, delegan las operaciones a los Data Sources y mapean los errores de infraestructura (`ServerError`) al tipo de error de dominio (`AppError`), retornando siempre un `Result<T, AppError>` a sus consumidores.

## Clases

### Nombrado de clases

El nombre del repositorio **debe** representar el módulo o conjunto de datos que gestiona y **debe** terminar con el sufijo `Repository`.

```dart
class AppNotificationRepository { }

class UserRepository { }

class WalletRepository { }
```

### Tipo de clase e implementación de interfaz

Los repositorios **deben** declararse como clases concretas que implementen la interfaz de repositorio correspondiente de la capa de dominio, usando la palabra clave `implements`.

```dart
class AppNotificationRepository implements IAppNotificationRepository { }

class UserRepository implements IUserRepository { }
```

:::note
A diferencia de la v1, los repositorios usan `implements` en lugar de `extends`. Esto garantiza que el repositorio cumpla explícitamente el contrato de la interfaz de dominio sin heredar ninguna implementación.
:::

## Constructores

### Inyección de dependencias

El repositorio **debe** recibir sus dependencias como parámetros nombrados (*named parameters*) con la palabra clave `required`.

```dart
class AppNotificationRepository implements IAppNotificationRepository {
  AppNotificationRepository({
    required IAppNotificationApi appNotificationApi,
  }) : _appNotificationApi = appNotificationApi;
}
```

#### A. Recibir interfaces de Data Sources

Los repositorios **deben** recibir **interfaces** de Data Sources (por ejemplo, `IAppNotificationApi`), no implementaciones concretas. Esto permite sustituir la implementación en tests y diferentes entornos.

```dart
// Correcto: recibe la interfaz
AppNotificationRepository({required IAppNotificationApi appNotificationApi})
  : _appNotificationApi = appNotificationApi;

// Incorrecto: recibe la implementación concreta
AppNotificationRepository({required AppNotificationApiRest appNotificationApi})
  : _appNotificationApi = appNotificationApi;
```

#### B. Asignación a atributos privados

Las dependencias **deben** asignarse a atributos privados mediante la sintaxis de inicialización del constructor.

```dart
class AppNotificationRepository implements IAppNotificationRepository {
  AppNotificationRepository({required IAppNotificationApi appNotificationApi})
    : _appNotificationApi = appNotificationApi;

  final IAppNotificationApi _appNotificationApi;
}
```

## Atributos

### Atributos de dependencias

Los atributos que almacenen dependencias inyectadas por el constructor **deben** ser `final` y privados. Los repositorios v2 no exponen atributos públicos.

```dart
class AppNotificationRepository implements IAppNotificationRepository {
  AppNotificationRepository({required IAppNotificationApi appNotificationApi})
    : _appNotificationApi = appNotificationApi;

  final IAppNotificationApi _appNotificationApi;
}
```

## Métodos

### Tipo de retorno `Result`

Los métodos de los repositorios **deben** retornar `Result<T, AppError>`. El tipo de error es `AppError` (dominio), a diferencia de los Data Sources que usan `ServerError`.

```dart
@override
Future<Result<void, AppError>> changeReadStatus(
  ChangeNotificationReadStatusParams params,
) async { ... }

@override
Future<Result<PaginatedData<AppNotification>, AppError>> getAppNotifications(
  GetAppNotificationsParams params,
) async { ... }
```

#### A. Tipo de éxito

El primer parámetro genérico de `Result` **debe** ser una entidad del dominio o `void`. Los repositorios **nunca** retornan modelos de datos (`*Model`) hacia la capa de dominio.

```dart
// Correcto: entidad del dominio
Future<Result<PaginatedData<AppNotification>, AppError>> getAppNotifications(...);

// Correcto: sin datos de retorno
Future<Result<void, AppError>> markAllNotificationsAsRead();

// Incorrecto: modelo de datos expuesto al dominio
Future<Result<AppNotificationModel, AppError>> getNotification(...);
```

#### B. Tipo de error

El segundo parámetro genérico de `Result` **debe** ser `AppError`.

### Manejo de errores sin `try/catch`

Los repositorios **no** deben implementar bloques `try/catch`. Los Data Sources ya encapsulan las excepciones en `Failure`, por lo que el repositorio solo necesita verificar el tipo del resultado.

#### A. Verificación con `is Failure`

Cuando el Data Source retorne un `Failure`, el repositorio **debe** mapear el error a `AppError` usando `AppError.fromServerError()` y retornar un nuevo `Failure`.

```dart
@override
Future<Result<void, AppError>> changeReadStatus(
  ChangeNotificationReadStatusParams params,
) async {
  final result = await _appNotificationApi.changeReadStatus(params);

  if (result is Failure) {
    return Failure(AppError.fromServerError(result.error!));
  }

  return Success(null);
}
```

#### B. Retorno de `Success`

Cuando la operación sea exitosa, el repositorio **debe** retornar `Success` con los datos correspondientes. Si el método no retorna datos, se **debe** usar `Success(null)`.

```dart
// Con datos
return Success(result.data!);

// Sin datos
return Success(null);
```

### Parámetros de métodos

Los métodos de los repositorios **deben** recibir entidades y parámetros de la capa de dominio. La conversión a modelos de solicitud (*request models*) es responsabilidad del Data Source, no del repositorio.

```dart
// Correcto: parámetro de dominio
@override
Future<Result<void, AppError>> changeReadStatus(
  ChangeNotificationReadStatusParams params,
) async { ... }

// Incorrecto: modelo de datos como parámetro
@override
Future<Result<void, AppError>> changeReadStatus(
  ChangeAppNotificationReadStatusRequestModel params,
) async { ... }
```

### Métodos de tipo `Stream`

Los repositorios que expongan `Stream`s **deben** delegar directamente al Data Source, sin transformaciones adicionales. El tipo del stream **debe** ser una entidad del dominio.

```dart
@override
Stream<AppNotification> listenToNewNotifications() {
  return _appNotificationApi.listenToNewNotifications();
}
```

:::note
Si el Data Source retorna un `Stream<AppNotificationModel>`, el repositorio es responsable de transformarlo al tipo de entidad de dominio usando `.map()`.
:::

### Ejemplo completo

```dart
class AppNotificationRepository implements IAppNotificationRepository {
  AppNotificationRepository({required IAppNotificationApi appNotificationApi})
    : _appNotificationApi = appNotificationApi;

  final IAppNotificationApi _appNotificationApi;

  @override
  Future<Result<void, AppError>> changeReadStatus(
    ChangeNotificationReadStatusParams params,
  ) async {
    final result = await _appNotificationApi.changeReadStatus(params);

    if (result is Failure) {
      return Failure(AppError.fromServerError(result.error!));
    }

    return Success(null);
  }

  @override
  Future<Result<PaginatedData<AppNotification>, AppError>> getAppNotifications(
    GetAppNotificationsParams params,
  ) async {
    final result = await _appNotificationApi.getAppNotifications(params);

    if (result is Failure) {
      return Failure(AppError.fromServerError(result.error!));
    }

    return Success(result.data!);
  }

  @override
  Stream<AppNotification> listenToNewNotifications() {
    return _appNotificationApi.listenToNewNotifications();
  }

  @override
  Future<Result<void, AppError>> markAllNotificationsAsRead() async {
    final result = await _appNotificationApi.markAllNotificationsAsRead();

    if (result is Failure) {
      return Failure(AppError.fromServerError(result.error!));
    }

    return Success(null);
  }
}
```

## Estructura de archivos

Todos los repositorios **deben** ubicarse en la carpeta `data/repositories/`. Cada repositorio vive en su propio archivo y la carpeta **debe** tener un barrel file `repositories.dart` que exporte todos los repositorios.

```bash
data/
└── repositories/
    ├── announcement_repository.dart
    ├── app_notification_repository.dart
    ├── auth_repository.dart
    ├── user_repository.dart
    └── repositories.dart
```

### Barrel file

El barrel file `repositories.dart` **debe** exportar todos los repositorios de la carpeta.

```dart title="data/repositories/repositories.dart"
export 'announcement_repository.dart';
export 'app_notification_repository.dart';
export 'auth_repository.dart';
export 'user_repository.dart';
```
