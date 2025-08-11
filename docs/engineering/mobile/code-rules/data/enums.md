---
title: Enums
---

# Enums

## Constructores

## Clases

### Implementación de la interfaz `BaseEnum`

Los enumeradores de la capa de datos **deben** implementar la interfaz `BaseEnum<E, T>`.

```dart title="Implementación de BaseEnum"
enum ItemCollectionModel implements BaseEnum<ItemCollectionEnum, String> {} // Implementación de BaseEnum

enum PrivacyTypeModel implements BaseEnum<PrivacyType, String> {}
```

### Nombrado de clases

Los nombres de los enumeradores **deben** tener el mismo nombre base de su entidad correspondiente y el sufijo `Model`, y su carpeta destino se encontrará adentro de la carpeta de `models` como una subcarpeta llamada `enums`.

```dart title="Regla de nombrado de clases"
enum ItemCollectionModel implements BaseEnum<ItemCollectionEnum, String> {}

enum PrivacyTypeModel implements BaseEnum<PrivacyType, String> {}
```

## Valores

### Atributo `value`

El atributo value representa el valor equivalente de la fuente de datos del `enum`.

```dart title="Atributo value"
enum PrivacyTypeModel implements BaseEnum<PrivacyTypeEnum, String> {
  const PrivacyTypeModel(this.value);
  final String value;
  ///Resto del código
}
```

```dart title="Atributo value de tipo int"
enum PrivacyTypeModel implements BaseEnum<PrivacyTypeEnum, String> {
  final Int value /// Nuevo value tambien puede manejarse como un valor entero;
  const PrivacyTypeModel(this.value);
}
```

### Nombrado de valores

Los parámetros de los constructores en los enumeradores **deben** reflejarse dentro de las llaves de inicialización. Primero se coloca el nombre del parámetro, seguido del valor correspondiente con base en el tipo de dato que proviene de la fuente de datos original entre paréntesis.

```dart title="Nombrado de valores"
enum ItemCollectionModel implements BaseEnum<ItemCollectionEnum, String> {
  post('post'),
  book('book'),
  track('track'),
  album('album'),
  comment('comment')

  final String value;
  const PrivacyTypeModel(this.value);

   /// Resto del código...
}

```

#### A. Formato camelCase

Los valores de los enumeradores **deben** definirse en camel case.

```dart title="Nombrado de valores"
enum PrivacyTypeModel implements BaseEnum<PrivacyTypeEnum, String> {
  public('public'),
  private('private'),
  followersConnections('followers-connections'),

  ///Aqui el ejemplo del camelCase
  connections('connections');

  /// Resto del código...
}

```

### Valor nulo

Los enumeradores **deben** tener una opción que represente la ausencia de valor.

```dart title="Valor nulo"
enum ItemCollectionModel implements BaseEnum<ItemCollectionEnum, String> {
  post('post'),
  book('book'),
  track('track'),
  unknown('');

  /// Resto del código...
}

```

### Método fromValue

"El método `fromValue` **debe** convertir un valor de tipo `T` al valor del modelo correspondiente comparandolo con el atributo `value` usando el método `firstWhere`.

#### A. Devolver un fallback con orElse

Se **debe** pasar el parametro `orElse` del método `firstWhere` para manejar posible valores nulos.

```dart title="Fallback"
enum UserStatusModel implements BaseEnum<UserStatus, String> {
  active('active'),
  inactive('inactive');

  const UserStatusModel(this.value);
  final String value;

  UserStatusModel fromValue(String value) {
    return UserStatusModel.values.firstWhere(
      (e) => e.value == value,
      orElse: () => UserStatusModel.active,
    );
  }
}

```

### Método fromEntity

El método `fromEntity` **puede** arrojar una excepción como última instancia en lugar de retornar un valor por defecto.

```dart title="Método fromEntity"
static ReportTypeEnum fromEntity(ReportType type) {
  if (type == ReportType.spam) {
    return ReportTypeEnum.spam;
  }
  if (type == ReportType.inappropriate) {
    return ReportTypeEnum.inappropriate;
  }
  if (type == ReportType.other) {
    return ReportTypeEnum.other;
  }
    ///Resto del codigo
}

```

#### A. Devolver excepciones

Para evitar devolver un valor predeterminado, se pueden manejar excepciones dentro del enumerador.

```dart title="¿Cómo devolver excepciones?"

enum ReportTypeEnum {
  spam('spam'),
  inappropriate('inappropriate'),
  other('other');

  const ReportTypeEnum(this.value);
  final String value;

  const ReportTypeEnum(this.value);
  final String value;

  static ReportTypeEnum fromEntity(ReportType type) {
    if (type == ReportType.spam) {
      return ReportTypeEnum.spam;
    }
    if (type == ReportType.inappropriate) {
      return ReportTypeEnum.inappropriate;
    }
    if (type == ReportType.other) {
      return ReportTypeEnum.other;
    }

    throw Exception('Invalid ReportTypeEnum'); //Podemos devolver una excepcion normal o una excepcion personalizada
  }
  ///Resto del código

}


```

### Método toEntity

El método `toEntity` **debe** convertir el valor del enumerador modelo al valor equivalente del enumerador entidad con una expresión
[`switch`](https://dart.dev/language/branches#switch-statements).

```dart title="toEntity"
PrivacyTypeEnum get toEntity {
  if (this == PrivacyTypeModel.public) {
    return PrivacyTypeEnum.public;
  }
  if (this == PrivacyTypeModel.private) {
    return PrivacyTypeEnum.private;
  }
  if (this == PrivacyTypeModel.followersConnections) {
    return PrivacyTypeEnum.followersConnections;
  }
  return PrivacyTypeEnum.connections;
}

```
