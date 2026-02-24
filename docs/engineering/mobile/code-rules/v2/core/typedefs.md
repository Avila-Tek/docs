# Typedefs

Los typedefs son alias de tipos que mejoran la legibilidad del código al reemplazar tipos genéricos verbosos por nombres semánticamente expresivos. El proyecto centraliza sus aliases en `lib/core/typedefs/`, de modo que sean accesibles en toda la aplicación sin duplicación.

Como el proyecto no usa `json_serializable` y la serialización es manual, los typedefs del core aparecen de forma recurrente en la capa de datos — especialmente en los constructores `fromMap` y los métodos `toMap` de los modelos.

## `DataMap`

`DataMap` es un alias de `Map<String, dynamic>`, el tipo estándar que Dart utiliza para representar un objeto JSON deserializado.

```dart title="lib/core/typedefs/data_map.dart"
typedef DataMap = Map<String, dynamic>;
```

### Cuándo usar `DataMap`

`DataMap` **debe** usarse en la capa de datos siempre que se trabaje con mapas de serialización o deserialización: parámetros de `fromMap`, retornos de `toMap`, y variables intermedias de mapeo.

```dart
// ✅ Correcto — capa de datos
factory AnnouncementDtoModel.fromMap(DataMap map) { ... }

DataMap toMap() => { 'id': id };
```

#### A. Uso en `fromMap`

El parámetro `map` del constructor `fromMap` **debe** declararse como `DataMap`.

```dart
factory AnnouncementDtoModel.fromMap(DataMap map) {
  final id = map['id'] as String? ?? '';
  final title = map['title'] as String? ?? '';

  return AnnouncementDtoModel(id: id, title: title);
}
```

#### B. Uso en `toMap`

El tipo de retorno del método `toMap` **debe** declararse como `DataMap`.

```dart
DataMap toMap() {
  return {
    'consecutiveNumbers': consecutiveNumbers,
    'lastCardNumbers': lastCardNumbers,
  };
}
```

### Cuándo NO usar `DataMap`

`DataMap` **no debe** usarse fuera de la capa de datos. En la capa de dominio y en la capa de presentación se trabaja con entidades y tipos concretos — nunca con mapas genéricos.

```dart
// ❌ Incorrecto — dominio o presentación
class UserRepository {
  Future<DataMap> getUser(String id); // usar la entidad User, no DataMap
}
```

:::warning
Usar `DataMap` fuera de la capa de datos rompe el encapsulamiento de la arquitectura limpia. Si necesitas pasar datos estructurados entre capas, usa entidades del dominio o parámetros tipados.
:::

## Estructura de archivos

Los typedefs se ubican en `lib/core/typedefs/`. Cada typedef **debe** tener su propio archivo en `snake_case`. La carpeta **debe** tener un barrel file `typedefs.dart` que exporte todos los aliases.

```
lib/
└── core/
    └── typedefs/
        ├── data_map.dart
        └── typedefs.dart
```

```dart title="core/typedefs/typedefs.dart"
export 'data_map.dart';
// ... demás typedefs
```

### Importación

Los typedefs **deben** importarse siempre desde el barrel file, no desde el archivo individual.

```dart
// ✅ Correcto
import 'package:app/core/typedefs/typedefs.dart';

// ❌ Incorrecto
import 'package:app/core/typedefs/data_map.dart';
```
