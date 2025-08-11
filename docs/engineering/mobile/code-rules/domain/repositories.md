# Repositorios

## Clases

### Nombrado de repositorios

Los repositorios **deben** reflejar el módulo o el conjunto de datos que gestiona, **debe** tener `I` como prefijo y terminar con el sufijo `Repository`. Como los siguientes ejemplos:

- IReportsRepository
- IUserRepository
- IPortfolioRepository

### Tipo abstracta

Los repositorios **deben** ser abstractos para evitar la dependencia de implementaciones externas.

```dart
abstract class IReportsRepository {}

abstract class IUserRepository {}

abstract class IPortfolioRepository {}
```

## Atributos

### Cuando declarar atributos en la interfaz de repositorio

#### A. Atributos privados

Los atributos de uso interno de la clase, como dependencias y variables auxiliares, **deben** ser atributos privados.

#### B. Atributos públicos

Los atributos públicos que sean parte de la firma de la interfaz del repositorio **deben** declararse como getters de atributos privados.

```dart
abstract class IUserRepository {
   List<Country> countries;
}
```

## Streams

Los `Streams` **deben** declararse como getters del atributo stream de un `StreamController` que controle el flujo de información en el repositorio.

## Cuándo y cómo declarar streams en la interfaz de repositorio

Los `streams` **deben** ser declarados cuando sea el caso de necesitarlo y de la siguiente manera:

```dart
abstract class IUserRepository extends IRepository {
  IUserRepository();

  Stream<bool> get currentUserStream;
  Stream<String> get followStream;
}
```

## Métodos

### Documentación de métodos

Los repositorios **deben** llevar una amplia documentación al momento de estructurarlos:

#### A. Documentación de métodos

Los métodos **deben** estar documentados colocando lo que hace, los atributos que recibe, la entidad que retorna y tambien colocar el tipo de retorno en caso de fallar.

```dart
abstract class IReportsRepository extends IRepository {
  IReportsRepository();

  /// Create a report
  /// ***Parameters***
  /// [report] information of the report with the entity
  /// ***Returns**
  /// A Future void which means the report was created successfully
  Future<void> createReport({
    required Report report,
    required String locale,
  });
}
```
#### B. Documentación de streams

Los streams creados **deben** estar documentados sobre su funcionalidad.

```dart
abstract class IUserRepository extends IRepository {
  IUserRepository();
  //Stream controller for the 
  //home when the icon is pressed for refreshed it
  Stream<bool> get homeIconPressedStream;

  //If I want the profile of the talent when I am logged as a business
  Profile? get talentProfile; 
}
```


