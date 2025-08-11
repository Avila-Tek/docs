---
title: Enums
---

# Enums

## Constructores

## Clases

### Nombrado de clases

Los enumeradores en la capa de dominio **deben** ser correspondientes al uso que tendrá y nombrarse en singular. Algunos ejemplos de nombres de enumeradores son:

```
enum UserStatus {}

enum UserRole {}

enum PrivacyType {}
```

## Valores

### Nombrado de valores

Los parámetros de los enumeradores **deben** definirse en camel case.

```dart title="Nombrado de valores"
enum PrivacyTypeEnum {
    public,
    private,
    followersConnection, 
    connections;

    ///Resto del código...
}
```

### Valor nulo


Los enumeradores **deben** tener una opción que represente la ausencia de valor.

```dart title="Valor nulo"
    enum ItemCollectionEnum {
      post,
      book,
      track,
      unknown; /// Valor nulo

      /// Resto del código...
    }
```

## Métodos auxiliares

### Getters

Los enumeradores **pueden** incluir getters, lo que permite establecer nuevas instancias de fácil acceso para su uso en condicionales.


```dart title="Getters"

enum ReportType {
  spam,
  inappropriate,
  other,
  none;

  bool get isSpam => this == ReportType.spam;
  bool get isInappropriate => this == ReportType.inappropriate;
  bool get isOther => this == ReportType.other;
  bool get isNone => this == ReportType.none;
  
  /// Resto del codigo

}


```
