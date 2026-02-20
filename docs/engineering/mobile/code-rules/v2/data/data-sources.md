# Data Sources

Los Data Sources representan los puntos de conexión entre la aplicación y los proveedores externos de datos. Esta sección define las reglas para la creación, nombrado y estructura de las clases de Data Sources, incluyendo sus interfaces, implementaciones para servicios REST (Representational State Transfer) y GraphQL, constructores, atributos, métodos, endpoints y organización de archivos.

Los Data Sources hacen uso de clases de programación funcional (PF) como `Result`, `Success` y `Failure`, provenientes del paquete AFP (Avila-Tek Functional Programming).

## Clases

### Nombrado de clases

#### A. Nombrado de interfaces

Las interfaces de Data Source **deben** ser nombradas con el prefijo `I` (de interfaz) y **deben** utilizar alguno de los sufijos `Api`, `Service` o `DataSource`, según se considere apropiado para la clase.

```dart
abstract class IAppNotificationApi { }

abstract class IUserPrefsDataSource { }

abstract class IAnalyticsService { }
```

#### B. Nombrado de implementaciones de servicios REST

Las implementaciones de Data Source de servicios REST **deben** tener el mismo nombre base de la interfaz (sin el prefijo `I`), conservar el mismo sufijo y agregar el sufijo `Rest` al final del nombre.

```dart
class AppNotificationApiRest implements IAppNotificationApi { }

class UserApiRest implements IUserApi { }
```

#### C. Nombrado de implementaciones de servicios GraphQL

Las implementaciones de Data Source de servicios GraphQL **deben** tener el mismo nombre base de la interfaz (sin el prefijo `I`), conservar el mismo sufijo y agregar el sufijo `GraphQL` al final del nombre.

```dart
class UserApiGraphQL implements IUserApi { }

class CoreApiGraphQL implements ICoreApi { }
```

#### D. Nombrado de implementaciones de otros servicios

Las implementaciones de Data Source de otros tipos de servicios distintos a APIs GraphQL o REST **deben** tener un nombre descriptivo del servicio que implementan y la misma terminación de la interfaz que implementan.

```dart
class RemoteConfigService implements IRemoteSettingsService { }

class AuthFirebaseService implements IAuthService { }

class SharedPreferencesDataSource implements IDeviceStorageDataSource { }
```

### Tipo de clase

#### A. Interfaces como clases abstractas

Las interfaces de Data Source **deben** ser declaradas como `abstract class`.

```dart
abstract class IAppNotificationApi { }
```

#### B. Implementaciones con `implements`

Las implementaciones de Data Source **deben** usar la palabra clave `implements` para declarar su relación con la interfaz correspondiente.

```dart
class AppNotificationApiRest implements IAppNotificationApi { }
```

## Documentación de interfaces

### Comentarios de documentación en interfaces

Las interfaces de Data Source **deben** incluir comentarios de documentación (dartdoc) en cada método declarado.

### Documentación de métodos de interfaz

Los métodos declarados en las interfaces **deben** incluir comentarios de documentación con las secciones **Parameters** y **Returns** cuando el método tenga parámetros o un valor de retorno significativo.

```dart
abstract class IAppNotificationApi {
  /// Fetches a paginated list of app notifications based
  /// on the provided parameters.
  ///
  /// **Parameters**
  /// - [params] contains the parameters for fetching the notifications.
  ///
  /// **Returns**
  /// Returns a [Result] containing:
  /// - A [PaginatedData] of [AppNotificationModel] on success.
  /// - A [ServerError] if an error occurs during the request.
  Future<Result<PaginatedData<AppNotificationModel>, ServerError>>
  getAppNotifications(GetAppNotificationsRequestModel params);

  /// Change notification read status.
  ///
  /// **Parameters**
  /// - [params] contains the notification ID and the new read status.
  ///
  /// **Returns**
  /// - `void` if success.
  /// - [ServerError] if error.
  Future<Result<void, ServerError>> changeReadStatus(
    ChangeAppNotificationReadStatusRequestModel params,
  );
}
```

## Constructores

### Inyección de dependencias en constructores

Los constructores de Data Sources **deben** recibir sus dependencias como parámetros nombrados (*named parameters*) con la palabra clave `required`.

```dart
class AppNotificationApiRest implements IAppNotificationApi {
  AppNotificationApiRest({required HttpManager client}) : _client = client;
}
```

#### A. Parámetro `HttpManager` para servicios HTTP

Los constructores de Data Sources que realicen llamadas a APIs HTTP (REST o GraphQL) **deben** recibir un parámetro de tipo `HttpManager` que gestione la conexión con la API.

```dart
class AppNotificationApiRest implements IAppNotificationApi {
  AppNotificationApiRest({required HttpManager client}) : _client = client;
}
```

:::note
`HttpManager` es el cliente HTTP del proyecto que encapsula la configuración de URLs base, headers, interceptores y procesamiento de solicitudes/respuestas. Este reemplaza la convención anterior de pasar `String url` y `http.Client` como parámetros separados.
:::

#### B. Asignación a atributos privados

Las dependencias recibidas en el constructor **deben** ser asignadas a atributos privados de la clase mediante la sintaxis de inicialización del constructor.

```dart
class AppNotificationApiRest implements IAppNotificationApi {
  AppNotificationApiRest({required HttpManager client}) : _client = client;

  final HttpManager _client;
}
```

## Atributos

### Atributos de dependencias

Los atributos que almacenen dependencias inyectadas por el constructor **deben** ser declarados como `final` y privados.

```dart
class AppNotificationApiRest implements IAppNotificationApi {
  AppNotificationApiRest({required HttpManager client}) : _client = client;

  final HttpManager _client;
}
```

## Métodos

### Tipo de retorno `Result`

Los métodos de Data Sources **deben** retornar un tipo `Result<T, E>` que encapsule el resultado exitoso o el error de la operación. Las clases `Result`, `Success` y `Failure` **deben** importarse del paquete `afp`.

```yaml title="pubspec.yaml"
dependencies:
  afp:
    git:
      url: https://github.com/Avila-Tek/flutter_common_lib.git
      ref: afp-0.2.1
      path: packages/afp
```

```dart
import 'package:afp/afp.dart';

Future<Result<PaginatedData<AppNotificationModel>, ServerError>>
getAppNotifications(GetAppNotificationsRequestModel params);
```

#### A. Tipo de éxito

El primer parámetro genérico de `Result` **debe** representar el tipo de dato esperado en caso de éxito. Los tipos de éxito **deben** ser modelos de la capa de datos, no entidades del dominio. Cuando la operación no retorne datos, se **debe** usar `void`.

```dart
Future<Result<void, ServerError>> markAllNotificationsAsRead();

Future<Result<PaginatedData<AppNotificationModel>, ServerError>>
getAppNotifications(GetAppNotificationsRequestModel params);
```

#### B. Tipo de error

El segundo parámetro genérico de `Result` **debe** representar el tipo de error correspondiente al Data Source. Para APIs HTTP, se **debe** usar `ServerError`.

```dart
Future<Result<void, ServerError>> changeReadStatus(
  ChangeAppNotificationReadStatusRequestModel params,
);
```

#### C. Uso de `Success` y `Failure`

Los métodos **deben** retornar instancias de `Success` o `Failure` del paquete `afp` para encapsular el resultado de la operación.

```dart
// Resultado exitoso con datos
return Success(paginatedData);

// Resultado exitoso sin datos
return Success(null);

// Resultado con error
return Failure(const HttpError.empty());
```

### Parámetros de métodos

Los métodos de Data Sources **deben** recibir modelos de la capa de datos como parámetros, no entidades del dominio.

#### A. Modelos de solicitud como parámetros

Cuando un método requiera datos estructurados para su operación, se **debe** usar un modelo de solicitud (*request model*) como parámetro.

```dart
Future<Result<void, ServerError>> changeReadStatus(
  ChangeAppNotificationReadStatusRequestModel params,
);

Future<Result<PaginatedData<AppNotificationModel>, ServerError>>
getAppNotifications(GetAppNotificationsRequestModel params);
```

#### B. Parámetros simples

Los métodos que reciban un solo parámetro simple (como un `String` o `int`) **pueden** recibirlo directamente sin crear un modelo de solicitud.

```dart
Future<Result<void, ServerError>> deleteNotification(String notificationId);
```

### Uso de modelos de solicitud en la implementación

Dentro de las implementaciones, los modelos de solicitud recibidos como parámetro **deben** utilizarse para construir la solicitud al servicio externo, accediendo a sus propiedades y métodos como `toMap()`.

```dart
@override
Future<Result<void, ServerError>> changeReadStatus(
  ChangeAppNotificationReadStatusRequestModel params,
) async {
  try {
    final result = await _client.request(
      endpoint: AppNotificationApiRestEndpoints.changeReadStatus(
        params.notificationId.toString(),
      ),
      method: HttpOperation.patch,
      body: params.toMap(),
    );
    // ...
  }
}
```

### Manejo de errores

#### A. Bloque `try/catch`

Los métodos de las implementaciones de Data Source **deben** implementar un bloque `try/catch` para capturar excepciones durante la comunicación con el servicio externo.

```dart
@override
Future<Result<void, ServerError>> markAllNotificationsAsRead() async {
  try {
    // ... lógica de la solicitud
  } catch (e) {
    return Failure(HttpError.fromException(e));
  }
}
```

#### B. Retorno de `Failure` en bloque `catch`

En el bloque `catch`, los métodos **deben** retornar una instancia de `Failure` con el error correspondiente, utilizando `HttpError.fromException(e)` para APIs HTTP.

```dart
catch (e) {
  return Failure(HttpError.fromException(e));
}
```

#### C. Validación de código de estado

Los métodos **deben** validar el código de estado de la respuesta HTTP antes de procesar los datos. Si el código de estado no es el esperado, se **debe** retornar un `Failure`.

```dart
final result = await _client.request(
  endpoint: AppNotificationApiRestEndpoints.getAppNotifications,
  queryParams: params.toMap(),
);

if (result.statusCode != 200) {
  return Failure(const HttpError.empty());
}
```

### Métodos de tipo `Stream`

Las interfaces de Data Source **pueden** declarar métodos que retornen un `Stream<T>` para proveer datos en tiempo real. El tipo genérico `T` **debe** ser un modelo de la capa de datos.

```dart
abstract class IAppNotificationApi {
  Stream<AppNotificationModel> listenToNewNotifications();
}
```

:::note
La implementación de métodos de tipo `Stream` depende de la tecnología utilizada (WebSockets, Server-Sent Events, Firebase Realtime Database, etc.).
:::

## Endpoints

### Clase de endpoints

Las implementaciones de Data Sources de tipo REST **deben** separar las rutas de los endpoints en una clase abstracta dedicada.

#### A. Nombrado de la clase de endpoints

La clase de endpoints **debe** tener el mismo nombre base de la implementación del Data Source, seguido del sufijo `Endpoints`.

```dart
// Implementación:
class AppNotificationApiRest implements IAppNotificationApi { }

// Clase de endpoints:
abstract class AppNotificationApiRestEndpoints { }
```

#### B. Endpoints estáticos constantes

Los endpoints que no requieran parámetros dinámicos **deben** ser declarados como `static const String`.

```dart
abstract class AppNotificationApiRestEndpoints {
  static const String getAppNotifications =
      '/api/v1/notification/my-notifications';

  static const String markAllNotificationsAsRead =
      '/api/v1/notification/mark-all-as-seen';
}
```

#### C. Endpoints dinámicos como métodos estáticos

Los endpoints que requieran parámetros dinámicos (como un identificador) **deben** ser declarados como métodos `static` que reciban los parámetros necesarios y retornen un `String`.

```dart
abstract class AppNotificationApiRestEndpoints {
  static String changeReadStatus(String id) => '/api/v1/notification/$id';
}
```

#### D. Uso de endpoints en la implementación

Los métodos de la implementación del Data Source **deben** utilizar la clase de endpoints para obtener las rutas, en lugar de declarar las rutas directamente como strings literales dentro del método.

```dart
final result = await _client.request(
  endpoint: AppNotificationApiRestEndpoints.getAppNotifications,
);
```

## Estructura de archivos

### Organización de archivos por Data Source

Cada Data Source **debe** organizarse en su propia carpeta dentro de `data/data_sources/`, agrupando la interfaz, las implementaciones y la clase de endpoints.

```bash
data/
└── data_sources/
    └── app_notification_api/
        ├── app_notification_api.dart
        ├── app_notification_api_rest.dart
        └── app_notification_api_rest_endpoints.dart
```

#### A. Archivo de la interfaz

El archivo de la interfaz **debe** nombrarse con el nombre base del Data Source en `snake_case`.

#### B. Archivo de la implementación

El archivo de la implementación **debe** nombrarse con el nombre completo de la clase en `snake_case`.

#### C. Archivo de endpoints

El archivo de la clase de endpoints **debe** nombrarse con el nombre completo de la clase en `snake_case` y **debe** ubicarse en la misma carpeta que la implementación correspondiente.
