---
title: Repositorios
---

# Repositorios

## Clases

### Nombrado de repositorios

El nombre de la clase repositorio **debe** representar el módulo o el conjunto de datos que gestiona y **debe** terminar con el sufijo `Repository`.

```dart
class UserRepository

class ReportRepository

class PortfolioRepository
```

### Extensión de la interfaz del repositorio (capa de dominio)

La clase repositorio de la capa de datos **debe** extender de la interfaz repositorio de la capa dominio.

```dart
class UserRepository extends IUserRepository {}

class ReportRepository IReportRepository {}

class PortfolioRepository IPortfolioRepository {}
```

## Constructores

### Inyección de dependencias

El repositorio **debe** recibir las variables y dependencias como parámetros delegados y asignarlos a los atributos privados respectivos de la clase en el constructor.

```dart
class UserRepository extends IUserRepository {
// Se pide por parametros y se instancia a la variable api en el archivo
  UserRepository(UserApi api) : _api = api;

  final UserApi _api;
}
```

## Atributos

### Declarar variables públicas y privadas

#### A. Atributos privados

Los atributos de uso interno de la clase, como dependencias y variables auxiliares, **deben** ser atributos privados.

#### B. Atributos públicos

Los atributos públicos que sean parte de la firma de la interfaz del repositorio **deben** declararse como getters de atributos privados.

```dart
abstract class IUserRepository {
   List<Country> countries; // Atributo parte de la firma de la interfaz
}

class UserRepository extends IUserRepository {
  List<Country> _countries = <Country>[];
  @override
  List<Country> get countries => _countries; // Implementación del atributo de la interfaz por medio de un getter.
}
```

## Streams

Los `Streams` **deben** crearse a partir de un `StreamController` que controle el flujo de información del Stream desde y hacia el repositorio.

### Declaración


#### A. `StreamController` de tipo `BehaviorSubject` 

El `StreamController` **debe** declararse como una variable privada. El valor asignado debe ser de tipo `BehaviorSubject` del paquete [package:rxdart](https://pub.dev/packages/rxdart).

#### B. Atributo de tipo `Stream<T>`

El atributo de tipo `Stream<T>` **debe** ser un getter del stream de la variable `StreamController` de la clase.

```dart
class UserRepository extends IUserRepository {
  UserRepository(UserApi api) : _api = api;

  final UserApi _api;

  final _currentUserController = BehaviorSubject<User>();

  @override
  /// Stream que emite el estado actual y
  /// los suscriptores pueden escuchar este stream para recibir actualizaciones.
  Stream<User> get currentUserStream => _currentUserController.stream;
}
```

## Logger

Las funciones en los repositorios **deben** realizar un control de ejecución de las llamadas con la función `log` de la librería [`dart:developer`](https://api.flutter.dev/flutter/dart-developer/dart-developer-library.html). 

### Rastreo de llamadas

#### A. Eventos de ejecución

Al momento de iniciar una llamada **deben** registrarse al menos tres eventos de la ejecución: Al iniciar, al finalizar con éxito o al finalizar con un error.

#### B. Emojis para identificar los eventos de ejecución

Cada evento de ejecución **debe** incluir un emoji en el log de la llamada. Los emojis **deben** ser los siguientes:

- 📡 Inicio de la llamada
- ✅ Llamada exitosa
- ❌ Error en la llamada

#### C. Variable `_source`

Los repositorios **deben** declarar la variable privada `_source` de tipo estática y constante con el nombre de la clase para identificar el origen de la llamada de la función `log`.

#### D. Declaración de parámetros `error` y `stackTrace` en el log de bloque `catch`

Se **deben** declarar los parámetros `error` y `stackTrace` del método `log` en el bloque `catch` de la función.

```dart
class PostRepository extends IPostRepository {
  PostRepository({required PostApi api}) : _api = api;

  final PostApi _api;

  static const String _source = 'PostRepository';

  @override
  Future<void> deleteComment({
    required String userId,
    required String commentId,
  }) async {
    try {
      log(
        '📡 Delete comment $commentId',
        name: '$_source.deleteComment',
      );
      await _api.deleteCommentPost(
        itemId: commentId,
        ownerId: userId,
      );
      log(
        '✅ Success delete comment $commentId',
        name: '$_source.deleteComment',
      );
    } catch (e, s) {
      log(
        '❌ Delete comment $commentId',
        name: '$_source.deleteComment',
        error: e,
        stackTrace: s,
      );
      rethrow;
    }
  }
}
```

## Métodos

### Flujo de ejecución (try/catch)

Las funciones de los repositorios **deben** incluir un control de flujo implementado bajo un `try/catch` y del retorno de excepciones segun sea el caso. Como el siguiente ejemplo:

```dart
class ReportsRepository extends IReportsRepository {
  ReportsRepository(ReportsApi api) : api = api;

  final _source = 'ReportsRepository';
  final ReportsApi api;

  @override
  Future<void> createReport({
    required Report report,
    required String locale,
  }) async {
    try {
      log(
        '📡 Creating report',
        name: '$_source.createReport',
      );

      await api.createReport(
        report: ReportModel.fromEntity(report),
        locale: locale,
      );

      log(
        '✅ Report created',
        name: '$_source.createReport',
      );
    } on ResponseException catch (e) {
      log(
        '❌ Error creating the report: ${e.message}',
        name: '$_source.followProfile()',
        error: e,
      );
      throw ReportProfileException(
        message: e.message,
      );
    } catch (e) {
      log(
        '❌ Error creating the report',
        name: '$_source.createReport',
        error: e,
      );
      rethrow;
    }
  }
}

```
