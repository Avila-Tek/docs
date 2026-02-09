# Data Sources

## Clases

### Nombrado de clases

#### A. Nombrado de interfaces

Las interfaces de Data Source **deben** ser nombradas con el prefijo `I` (de interfaz) y **deben** utilizar alguno de los sufijos `Api`, `Service` o `DataSource`, según se considere apropiado para la clase.

```dart
abstract class IUserApi { }

abstract class IUserPrefsDataSource { }

abstract class IAnalyticsService {}

```

#### B. Nombrado de implementaciones de servicios GraphQL

Las implementaciones de Data Source **deben** ser tener el mismo nombre base de la interfaz, el mismo sufijo y usar el prefijo `GraphQL`. 

```dart

class UserApiGraphQL implements IUserApi { }

class CoreApiGraphQL implements ICoreApi { }

```

#### C. Nombrado de implementaciones de servicios REST

Las implementaciones de Data Source **deben** ser tener el mismo nombre base de la interfaz, el mismo sufijo y usar el prefijo `Rest`. 

```dart

class UserApiRest implements IUserApi { }

class CoreApiRest implements ICoreApi { }

```

#### D. Nombrado de implementaciones de otros servicios

Las implementaciones de Data Source de otros tipos de servicios distintos a APIs GraphQL o REST  **deben** tener la misma terminación de la interfaz que implementa

```dart
class RemoteConfigService implements IRemoteSettingsService { }

class AuthFirebaseService implements IAuthService { }

class SharedPreferencesDataSource implements IDeviceStorageDataSource { }

```

## Constructores

### Parámetro URL en constructores

Los constructores de Data Sources de servicios que realicen llamadas a APIs mediante URL **deben** recibir un parámetro de tipo `String` que represente la URL de la API que se va a consumir.

#### A. Aserción de formato de URLs estándar

Los constructores de Data Sources de servicios que acepten URLs de APIs deben asercir que las URLs  sean válidas según las especificaciones de la plataforma. Algunas aserciones comunes son:

- La URL debe comenzar con `http` o `https`.
- La URL debe tener un dominio válido.
- La URL no debe terminar con `/`.

```dart
class DataSource {
  DataSource(String url) {
    assert(
      url.startsWith(RegExp('^https?://')),
      'url format error: URL must start with "http://" or "https://" protocol',
    );
    assert(
      !url.endsWith('/'),
      'url format error: URL cannot end with slash "/"',
    );
  }
}
```

#### B. Aserción de formato de URLs de GraphQL

Los constructores de Data Sources de servicios que utilicen URLs de GraphQL deben asercir, adicional a los requisitos de la sección anterior, que las URLs que reciben como parámetros incluyan la ruta `/graphql`.

```dart
class DataSource {
  DataSource(String url) {
    assert(
      url.startsWith(RegExp('^https?://')),
      'url format error: URL must start with "http://" or "https://" protocol',
    );
    assert(
      url.endsWith('/graphql'),
      'url format error: URL must end with "/graphql"',
    );
  }
}
```

### Parámetro cliente HTTP en constructores

Los constructores de Data Sources de servicios que realicen llamadas a APIs HTTP como REST o GraphQL **deben** recibir un parámetro del tipo cliente que maneje la conexión con la API, usualmente un objeto de tipo `http.Client` de la librería [`http`](https://pub.dev/packages/http).

```dart

import 'package:http/http.dart' as http;

class DataSourceHttp {
  DataSource(String url, http.Client client) { }
}

```
<!-- TODO: Terminar este artículo. Es necesario definir una regla general para la definición de argumentos en constructores de clases en Dart.
#### 1.1.2.3. Definición de argumentos en constructores

Los constructores de Data Sources **deben** cumplir los lineamientos de definición de parámetros de constructores de clases en Dart,  
-->

<!-- 

### 1.1.3. Atributos

#### 1.1.3.1. 


### 1.1.4. Métodos

#### 1.1.4.1.  

-->