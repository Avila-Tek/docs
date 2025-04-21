---
sidebar_position: 7
---

# HttpHeadersInjector + CustomHttpClient

La implementación de `HttpHeadersInjector` está diseñada para gestionar los headers HTTP de la aplicación. Los headers se almacenan y recuperan desde un almacenamiento seguro y son utilizados para configurar peticiones HTTP en función de las necesidades de la aplicación.

De esta manera, se centraliza la gestión de headers, se evita la duplicación de lógica para generar headers y se adapta a cualquier aplicación soportando la configuración de valores adicionales.

Por otro lado, la clase `CustomHttpClient` extiende de `http.BaseClient` y actúa como un cliente HTTP personalizado para manejar las solicitudes a un API. Esta utiliza `HttpHeadersInjector` para agregar encabezados personalizados a cada solicitud, sobrescribiendo los métodos comunes get, post, put, etc.

La ventaja de su implementación radica en que además de centralizar los headers en las solicitudes, también se puede agregar lógica adicional como refrescar tokens en caso que la petición arroje un 401.

## Setup
La implementación de `HttpHeadersInjector` forma parte del paquete de Avila Tek Flutter Common Library (FCL). Comienza importando al proyecto el paquete de `avilatek_core`, `package_info_plus` y `http`.

```yaml
avilatek_core:
    git:
      url: https://github.com/Avila-Tek/flutter_common_lib.git
      ref: avilatek_core-0.4.0
      path: packages/avilatek_core
http: ^1.2.2
package_info_plus: ^8.0.0
```

## HttpHeadersInjector
A continuación, la explicación detrás de la implementación de `HttpHeadersInjector`.

```dart
import 'package:avilatek_core/src/interfaces/device_storage_api.dart';

/// Enum with the most common HTTP headers.
enum HttpHeaderType {
  /// `App-Version` header.
  appVersion('App-Version'),

  /// `Content-Type` header.
  contentType('Content-Type'),

  /// `Accept` header.
  accept('Accept'),

  /// `Accept-Language` header.
  acceptLanguage('Accept-Language'),

  /// `X-Token` header.
  xToken('x-token'),

  /// `X-Refresh-Token` header.
  xRefreshToken('x-refresh-token'),

  /// `Authorization` header.
  authorization('Authorization');

  const HttpHeaderType(this.key);

  /// The key to be used in the headers map.
  final String key;
}

/// {@template http_headers_injector}
/// This class simplifies the process of injecting headers into HTTP requests
/// and makes it possible to share across the application using device storage.
///
/// To use, simply call the [headers] method to get the stored headers and
/// optionally provide extra headers that will have priority over the stored
/// values.
///
/// The [HttpHeaderType] enum provides the most common headers, but you can
/// use any string as a key. It is recommended to use the enum values to avoid
/// duplication and typos.
/// {@endtemplate}
class HttpHeadersInjector {
  /// Creates a new instance of [HttpHeadersInjector]. The [storage] parameter
  /// is required to store the headers values. It is highly recommended that
  /// a secured storage implementation is used, like
  /// [flutter_secure_storage](https://pub.dev/packages/flutter_secure_storage).
  ///
  /// {@macro http_headers_injector}
  const HttpHeadersInjector({
    required IDeviceStorageApi storage,
  }) : _storage = storage;

  final IDeviceStorageApi _storage;

  /// Retrieves the header value.
  ///
  /// You should use the [HttpHeaderType] values when using common headers.
  Future<String?> getHeader(String key) async {
    return _storage.getValue(key);
  }

  /// Stores the header-value pair.
  ///
  /// You should use the [HttpHeaderType] values when using common headers.
  Future<void> setHeader(String key, String value) async {
    return _storage.setValue(key: key, value: value);
  }

  /// Deletes the header value.
  ///
  /// You should use the [HttpHeaderType] values when using common headers.
  Future<void> deleteHeaderValue(String key) async {
    return _storage.deleteValue(key);
  }

  /// Builds the headers using the stored values and the extra headers. The
  /// extra headers have priority over the stored values but will not change
  /// them.
  Future<Map<String, String>> headers({Map<String, String>? extra}) async {
    final acceptLanguage = await getHeader(HttpHeaderType.acceptLanguage.key) ??
        extra?[HttpHeaderType.acceptLanguage.key];
    final authToken = extra?[HttpHeaderType.authorization.key] ??
        await getHeader(HttpHeaderType.authorization.key);
    final xToken = extra?[HttpHeaderType.xToken.key] ??
        await getHeader(HttpHeaderType.xToken.key);
    final accept = extra?[HttpHeaderType.accept.key] ?? 'application/json';
    final contentType =
        extra?[HttpHeaderType.contentType.key] ?? 'application/json';

    return {
      HttpHeaderType.accept.key: accept,
      HttpHeaderType.contentType.key: contentType,
      if (acceptLanguage != null)
        HttpHeaderType.acceptLanguage.key: acceptLanguage,
      if (xToken != null && xToken.isNotEmpty)
        HttpHeaderType.xToken.key: xToken,
      if (authToken != null && authToken.isNotEmpty)
        HttpHeaderType.authorization.key: authToken,
    };
  }
}
```

### Enumeración HttpHeaderType

Define una lista de tipos de headers HTTP comunes en la aplicación, cada uno asociado a una llave (key).

```dart 
enum HttpHeaderType {
  /// `App-Version` header.
  appVersion('App-Version'),

  /// `Content-Type` header.
  contentType('Content-Type'),

  /// `Accept` header.
  accept('Accept'),

  /// `Accept-Language` header.
  acceptLanguage('Accept-Language'),

  /// `X-Token` header.
  xToken('x-token'),

  /// `X-Refresh-Token` header.
  xRefreshToken('x-refresh-token'),

  /// `Authorization` header.
  authorization('Authorization');

  const HttpHeaderType(this.key);

  /// The key to be used in the headers map.
  final String key;
}
```

Es importante considerar las siguientes llaves: 

- **App-Version**: como estandarización de las aplicaciones de Avila Tek, a toda petición realizada se le debe mandar la versión de la aplicación para el versionamiento de endpoints.
- **x-token**: En esta llave se guardar el token de autenticación del usuario.
- **x-refresh**-token: En esta llave se guarda el token para refrescar la sesión del usuario.

### Clase

La clase es responsable de manejar la inyección y gestión de headers HTTP.

```dart
class HttpHeadersInjector {
  /// Creates a new instance of [HttpHeadersInjector]. The [storage] parameter
  /// is required to store the headers values. It is highly recommended that
  /// a secured storage implementation is used, like
  /// [flutter_secure_storage](https://pub.dev/packages/flutter_secure_storage).
  ///
  /// {@macro http_headers_injector}
  const HttpHeadersInjector({
    required IDeviceStorageApi storage,
  }) : _storage = storage;

  final IDeviceStorageApi _storage;

  /// Retrieves the header value.
  ///
  /// You should use the [HttpHeaderType] values when using common headers.
  Future<String?> getHeader(String key) async {
    return _storage.getValue(key);
  }

  /// Stores the header-value pair.
  ///
  /// You should use the [HttpHeaderType] values when using common headers.
  Future<void> setHeader(String key, String value) async {
    return _storage.setValue(key: key, value: value);
  }

  /// Deletes the header value.
  ///
  /// You should use the [HttpHeaderType] values when using common headers.
  Future<void> deleteHeaderValue(String key) async {
    return _storage.deleteValue(key);
  }

  /// Builds the headers using the stored values and the extra headers. The
  /// extra headers have priority over the stored values but will not change
  /// them.
  Future<Map<String, String>> headers({Map<String, String>? extra}) async {
    final acceptLanguage = await getHeader(HttpHeaderType.acceptLanguage.key) ??
        extra?[HttpHeaderType.acceptLanguage.key];
    final authToken = extra?[HttpHeaderType.authorization.key] ??
        await getHeader(HttpHeaderType.authorization.key);
    final xToken = extra?[HttpHeaderType.xToken.key] ??
        await getHeader(HttpHeaderType.xToken.key);
    final accept = extra?[HttpHeaderType.accept.key] ?? 'application/json';
    final contentType =
        extra?[HttpHeaderType.contentType.key] ?? 'application/json';

    return {
      HttpHeaderType.accept.key: accept,
      HttpHeaderType.contentType.key: contentType,
      if (acceptLanguage != null)
        HttpHeaderType.acceptLanguage.key: acceptLanguage,
      if (xToken != null && xToken.isNotEmpty)
        HttpHeaderType.xToken.key: xToken,
      if (authToken != null && authToken.isNotEmpty)
        HttpHeaderType.authorization.key: authToken,
    };
  }
}
```

#### Atributos
- **_storage**: Instancia de IDeviceStorageApi, usada para almacenar y recuperar datos sensibles como tokens.

#### Métodos
- `getHeader`: obtiene el valor de un header desde el almacenamiento usando su llave.
- `setHeader`: guarda un header en el almacenamiento.
- `deleteHeaderValue`: elimina un header del almacenamiento.
- `headers`: genera un mapa con los headers necesarios para una petición HTTP, considerando valores adicionales (extra) y valores predeterminados

## CustomHttpClient

A continuación, la explicación detrás de la implementación de `CustomHttpClient`.

```dart
import 'dart:convert';

import 'package:avilatek_core/avilatek_core.dart';
import 'package:http/http.dart' as http;
import 'package:http/retry.dart';

class CustomHttpClient extends http.BaseClient {
  CustomHttpClient({
    required HttpHeadersInjector httpHeadersInjector,
    http.Client? inner,
  })  : _inner = inner ?? http.Client(),
        _httpHeadersInjector = httpHeadersInjector;

  final HttpHeadersInjector _httpHeadersInjector;
  final http.Client _inner;

  @override
  Future<http.Response> get(
    Uri url, {
    Map<String, String>? headers,
  }) async {
    final requestHeaders = await _httpHeadersInjector.headers(extra: headers);
    final response = await _inner.get(url, headers: requestHeaders);

    return response;
  }

  @override
  Future<http.Response> delete(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }) async {
    final requestHeaders = await _httpHeadersInjector.headers(extra: headers);
    final response = await _inner.delete(
      url,
      headers: requestHeaders,
      body: body,
      encoding: encoding,
    );

    return response;
  }

  @override
  Future<http.Response> patch(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }) async {
    final requestHeaders = await _httpHeadersInjector.headers(extra: headers);
    final response = await _inner.patch(
      url,
      headers: requestHeaders,
      body: body,
      encoding: encoding,
    );

    return response;
  }

  @override
  Future<http.Response> post(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }) async {
    final requestHeaders = await _httpHeadersInjector.headers(extra: headers);
    final response = await _inner.post(
      url,
      headers: requestHeaders,
      body: body,
      encoding: encoding,
    );

    return response;
  }

  @override
  Future<http.Response> put(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }) async {
    final requestHeaders = await _httpHeadersInjector.headers(extra: headers);
    final response = await _inner.put(
      url,
      headers: requestHeaders,
      body: body,
      encoding: encoding,
    );

    return response;
  }

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    return _inner.send(request);
  }
}
```

### Constructor
- Recibe una instancia de `HttpHeadersInjector`.
- Permite recibir un cliente HTTP, estableciendo `http.Client` como valor predeterminado si no se proporciona uno.

### Métodos get, post, patch, put y delete

Cada método sobrescrito (get, post, put, etc.):
- Llama al método headers de `_httpHeadersInjector` para generar los encabezados personalizados.
- Usa `_inner` para realizar la solicitud HTTP correspondiente.
- Devuelve la respuesta obtenida.

## Implementación

En la clase `main` de todos los flavors, instancia `HttpHeadersInjector`:

```dart
import 'package:avilatek_core/avilatek_core.dart';

const httpHeadersInjector = HttpHeadersInjector(
    storage: DeviceSecureStorageApi(),
);
```

Usa el paquete de `package_info_plus` para obtener la version actual de la app y asi guardarlo en los headers.

```dart
final packageInfo = await PackageInfo.fromPlatform();
final appVersion = packageInfo.version;

await httpHeadersInjector.setHeader(HttpHeaderType.appVersion.key, appVersion);
```

Luego instancia `CustomHttpClient` y le asignas por parámetro el `HttpHeadersInjector` previamente.

```dart
  final httpClient = CustomHttpClient(
    httpHeadersInjector: httpHeadersInjector,
    inner: http.Client(),
  );
```

Finalmente, este `httpClient` se manda por parámetro a todos los APIs definidos en la capa de datos, para realizar las peticiones al backend.

```dart
class ApiRest implements IApiRest {
  ApiRest({
    required String apiHost,
    required http.Client? httpClient,
  })  : _apiHost = apiHost,
        _httpClient = httpClient ?? http.Client();

  final String _apiHost;

  final http.Client _httpClient;

  @override
  Future<String> getData() async {
    http.Response response;

    try {
      final endpoint = Endpoints.getData(version: 'v1');

      final uri = Uri.parse(_apiHost + endpoint);

      response = await _httpClient.get(uri);

    } catch (e) {
      rethrow;
    }
    
    ...
  }
}
```