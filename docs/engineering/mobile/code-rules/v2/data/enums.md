# Enums

Los enums de modelos son enumeradores de la capa de datos que mapean los valores crudos del API (generalmente `String` o `int`) a los enums de dominio correspondientes, y viceversa. Todo enum de modelo **debe** implementar la interfaz [`BaseEnum<E, T>`](../core/interfaces), ubicada en `lib/core/interfaces/base_enum.dart`. Cuando el mapa de deserialización se pasa al DTO contenedor, su tipo es [`DataMap`](../core/typedefs).

```dart title="lib/core/interfaces/base_enum.dart"
abstract class BaseEnum<E, T> {
  const BaseEnum(this.value);

  /// El valor crudo del API.
  final T value;

  /// Convierte el enum modelo al enum de dominio correspondiente.
  E toEntity();
}
```

## Clases

### Nombrado

Los enums de modelos **deben** usar el mismo nombre base que el enum de dominio correspondiente y agregar el sufijo `Model`.

```dart
// Enum de dominio
enum AnnouncementTextDescriptionType { paragraph, text, heading, ... }

// Enum modelo
enum AnnouncementTextDescriptionTypeModel { ... }
```

### Implementación de `BaseEnum`

Los enums de modelos **deben** implementar `BaseEnum<E, T>` donde `E` es el tipo del enum de dominio y `T` es el tipo del valor raw del API.

```dart
enum AnnouncementTextDescriptionTypeModel
    implements BaseEnum<AnnouncementTextDescriptionType, String> { ... }
```

#### A. Tipo de valor `T`

El tipo `T` **debe** coincidir con el tipo que devuelve la API para ese campo. En la mayoría de los casos es `String`, pero **puede** ser `int` u otro tipo primitivo según el contrato del servicio externo.

## Valores y constructor

### Declaración de cases

Cada case del enum **debe** recibir su valor raw como argumento en la declaración.

```dart
enum AnnouncementTextDescriptionTypeModel
    implements BaseEnum<AnnouncementTextDescriptionType, String> {
  paragraph('paragraph'),
  text('text'),
  heading('heading'),
  list('list'),
  listItem('list-item'),
  link('link'),
  image('image'),
  unknown('unknown');

  const AnnouncementTextDescriptionTypeModel(this.value);

  @override
  final String value;
}
```

#### A. Case `unknown`

Los enums de modelos **deben** incluir un case `unknown` como valor de fallback para cualquier valor no reconocido proveniente del API. El `value` del case `unknown` **debe** ser la cadena `'unknown'`.

```dart
unknown('unknown');
```

:::note
El case `unknown` protege la aplicación ante cambios en el API que introduzcan nuevos valores no contemplados en el modelo, evitando excepciones en tiempo de ejecución.
:::

## Constructores factory

### Factory `fromValue`

Los enums de modelos **deben** tener un constructor `factory` de nombre `fromValue` que reciba el valor crudo proveniente del API y retorne el case correspondiente. Si el valor no coincide con ningún case conocido, **debe** retornar el case `unknown`.

```dart
factory AnnouncementTextDescriptionTypeModel.fromValue(String? value) {
  return values.firstWhere(
    (type) => type.value == value,
    orElse: () => AnnouncementTextDescriptionTypeModel.unknown,
  );
}
```

### Factory `fromEntity`

Los enums de modelos **deben** tener un constructor `factory` de nombre `fromEntity` que convierta un enum de dominio al enum modelo correspondiente. **Debe** implementarse con un `switch` expression exhaustivo.

```dart
factory AnnouncementTextDescriptionTypeModel.fromEntity(
  AnnouncementTextDescriptionType entity,
) => switch (entity) {
  AnnouncementTextDescriptionType.paragraph =>
    AnnouncementTextDescriptionTypeModel.paragraph,
  AnnouncementTextDescriptionType.text =>
    AnnouncementTextDescriptionTypeModel.text,
  AnnouncementTextDescriptionType.heading =>
    AnnouncementTextDescriptionTypeModel.heading,
  AnnouncementTextDescriptionType.list =>
    AnnouncementTextDescriptionTypeModel.list,
  AnnouncementTextDescriptionType.listItem =>
    AnnouncementTextDescriptionTypeModel.listItem,
  AnnouncementTextDescriptionType.link =>
    AnnouncementTextDescriptionTypeModel.link,
  AnnouncementTextDescriptionType.image =>
    AnnouncementTextDescriptionTypeModel.image,
  AnnouncementTextDescriptionType.unknown =>
    AnnouncementTextDescriptionTypeModel.unknown,
};
```

## Método `toEntity`

Los enums de modelos **deben** implementar el método `toEntity` de `BaseEnum` con `@override`. **Debe** implementarse con un `switch` expression exhaustivo sobre `this`.

```dart
@override
AnnouncementTextDescriptionType toEntity() => switch (this) {
  AnnouncementTextDescriptionTypeModel.paragraph =>
    AnnouncementTextDescriptionType.paragraph,
  AnnouncementTextDescriptionTypeModel.text =>
    AnnouncementTextDescriptionType.text,
  AnnouncementTextDescriptionTypeModel.heading =>
    AnnouncementTextDescriptionType.heading,
  AnnouncementTextDescriptionTypeModel.list =>
    AnnouncementTextDescriptionType.list,
  AnnouncementTextDescriptionTypeModel.listItem =>
    AnnouncementTextDescriptionType.listItem,
  AnnouncementTextDescriptionTypeModel.link =>
    AnnouncementTextDescriptionType.link,
  AnnouncementTextDescriptionTypeModel.image =>
    AnnouncementTextDescriptionType.image,
  AnnouncementTextDescriptionTypeModel.unknown =>
    AnnouncementTextDescriptionType.unknown,
};
```

:::note
Usar `switch` expression (no `switch` statement) permite al compilador verificar exhaustividad. Si se agrega un nuevo case al enum de dominio, Dart forzará actualizar el `switch` en el enum modelo — evitando silenciar casos no contemplados.
:::

## Uso en modelos

### Deserialización en `fromMap`

Los DTOs que reciban un valor de enum desde el API **deben** usar `fromValue` para deserializar el valor crudo, y luego `toEntity()` para pasarlo al constructor del modelo.

```dart
factory AnnouncementDtoModel.fromMap(DataMap map) {
  final type = AnnouncementTextDescriptionTypeModel.fromValue(
    map['type'] as String?,
  );

  return AnnouncementDtoModel(
    type: type.toEntity(), // 👈 Convierte al enum de dominio
  );
}
```

### Serialización en `toMap`

Los Request models que necesiten serializar un enum de dominio hacia la API **deben** usar `fromEntity` para obtener el enum modelo y luego acceder a su `.value`.

```dart
Map<String, dynamic> toMap() {
  return {
    'type': AnnouncementTextDescriptionTypeModel.fromEntity(type).value,
  };
}
```

## Estructura de archivos

Los enums de modelos se ubican en `data/models/enums/`. Cada enum **debe** tener su propio archivo en `snake_case`. La carpeta **debe** tener un barrel file `enums.dart` que exporte todos los enums.

```
data/
└── models/
    └── enums/
        ├── announcement_text_description_type_model.dart
        └── enums.dart
```

```dart title="enums/enums.dart"
export 'announcement_text_description_type_model.dart';
// ... demás enums de modelos
```
