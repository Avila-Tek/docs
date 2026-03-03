# Interfaces

Las interfaces del core son clases abstractas que establecen contratos reutilizables en toda la capa de datos. Se ubican en `lib/core/interfaces/` y **no** pertenecen a ninguna capa de Clean Architecture en particular — son utilidades transversales que las capas de datos implementan.

## `BaseEnum`

`BaseEnum<E, T>` es la interfaz base que deben implementar todos los enums de la capa de datos. Establece el contrato mínimo para mapear entre un valor crudo del API y el enum de dominio correspondiente.

```dart title="lib/core/interfaces/base_enum.dart"
abstract class BaseEnum<E, T> {
  const BaseEnum(this.value);

  /// El valor crudo del API.
  final T value;

  /// Convierte el enum modelo al enum de dominio correspondiente.
  E toEntity();
}
```

### Parámetros genéricos

| Parámetro | Rol | Tipo habitual |
|-----------|-----|---------------|
| `E` | Tipo del enum de dominio al que se convierte | Enum de dominio (e.g. `AnnouncementTextDescriptionType`) |
| `T` | Tipo del valor crudo del API | `String` (puede ser `int` u otro primitivo) |

### Por qué existe

Sin `BaseEnum`, cada enum de modelo replicaría manualmente el mismo contrato — un atributo `value` y un método `toEntity()` — sin ninguna garantía de que la implementación sea coherente entre enums. `BaseEnum` fuerza ese contrato en tiempo de compilación mediante `implements`.

:::note
`BaseEnum` se implementa con `implements`, no con `extends`. Esto permite que los `enum` de Dart (que ya extienden `Enum` implícitamente) puedan usarla.
:::

### Implementación en un enum modelo

Los enums de modelos **deben** declarar `implements BaseEnum<E, T>` en su definición.

```dart
enum AnnouncementTextDescriptionTypeModel
    implements BaseEnum<AnnouncementTextDescriptionType, String> {
  paragraph('paragraph'),
  text('text'),
  unknown('unknown');

  const AnnouncementTextDescriptionTypeModel(this.value);

  @override
  final String value;

  @override
  AnnouncementTextDescriptionType toEntity() => switch (this) {
    AnnouncementTextDescriptionTypeModel.paragraph =>
      AnnouncementTextDescriptionType.paragraph,
    AnnouncementTextDescriptionTypeModel.text =>
      AnnouncementTextDescriptionType.text,
    AnnouncementTextDescriptionTypeModel.unknown =>
      AnnouncementTextDescriptionType.unknown,
  };
}
```

#### A. `@override` en `value` y `toEntity`

Ambos miembros declarados en `BaseEnum` **deben** marcarse con `@override` en la implementación para que el compilador verifique que el contrato se cumple correctamente.

#### B. `toEntity` con `switch` expression exhaustivo

El método `toEntity` **debe** implementarse con un `switch` expression (no `switch` statement) para que Dart verifique exhaustividad. Si se agrega un nuevo case al enum de dominio, el compilador forzará actualizar el `switch` del enum modelo.

```dart
// ✅ switch expression — exhaustivo, el compilador avisa si falta un case
AnnouncementTextDescriptionType toEntity() => switch (this) {
  AnnouncementTextDescriptionTypeModel.paragraph =>
    AnnouncementTextDescriptionType.paragraph,
  // ...
};

// ❌ switch statement — no garantiza exhaustividad
AnnouncementTextDescriptionType toEntity() {
  switch (this) {
    case AnnouncementTextDescriptionTypeModel.paragraph:
      return AnnouncementTextDescriptionType.paragraph;
    // un case olvidado no genera error de compilación
  }
}
```

### Uso desde la capa de datos

`BaseEnum` como tipo genérico **puede** usarse para escribir funciones auxiliares que operen sobre cualquier enum modelo sin conocer su tipo concreto.

```dart
// Ejemplo: función auxiliar que serializa cualquier BaseEnum a su valor raw
String serializeEnum<E>(BaseEnum<E, String> modelEnum) => modelEnum.value;
```

## `UseCaseWithParams`

`UseCaseWithParams<Type, Params>` es la interfaz base para los casos de uso que requieren un objeto de entrada para ejecutarse.

```dart title="lib/core/interfaces/use_cases.dart"
abstract class UseCaseWithParams<Type, Params> {
  Future<Type> execute(Params parameters);
}
```

### Parámetros genéricos

| Parámetro | Rol | Tipo habitual |
|-----------|-----|---------------|
| `Type` | Tipo de retorno del caso de uso | `Result<T, AppError>` |
| `Params` | Tipo del objeto de entrada | Clase `Params` del dominio (e.g. `GetProductsParams`) |

### Por qué existe

Sin esta interfaz, cada caso de uso definiría su método principal con un nombre arbitrario y una firma diferente. `UseCaseWithParams` fuerza un contrato uniforme — el método siempre se llama `execute` y siempre recibe un único objeto `Params` — lo que hace que todos los casos de uso sean predecibles e intercambiables.

### Implementación

Los casos de uso **deben** declarar `extends UseCaseWithParams<Type, Params>` e implementar el método `execute`.

```dart
class GetProductsUseCase
    extends UseCaseWithParams<
      Result<List<Product>, AppError>,
      GetProductsParams
    > {
  GetProductsUseCase({required IProductRepository productRepository})
      : _productRepository = productRepository;

  final IProductRepository _productRepository;

  @override
  Future<Result<List<Product>, AppError>> execute(
    GetProductsParams parameters,
  ) => _productRepository.getProducts(parameters);
}
```

---

## `UseCaseWithoutParams`

`UseCaseWithoutParams<Type>` es la interfaz base para los casos de uso que no requieren ningún dato de entrada.

```dart title="lib/core/interfaces/use_cases.dart"
abstract class UseCaseWithoutParams<Type> {
  Future<Type> execute();
}
```

### Parámetros genéricos

| Parámetro | Rol | Tipo habitual |
|-----------|-----|---------------|
| `Type` | Tipo de retorno del caso de uso | `Result<T, AppError>` |

### Cuándo usar `UseCaseWithParams` vs `UseCaseWithoutParams`

| Situación | Interfaz |
|-----------|----------|
| La operación necesita datos de entrada (filtros, IDs, campos de formulario) | `UseCaseWithParams` |
| La operación no necesita ningún dato (obtener el usuario actual, refrescar sesión) | `UseCaseWithoutParams` |

### Implementación

```dart
class GetCurrentUserUseCase
    extends UseCaseWithoutParams<Result<User?, AppError>> {
  GetCurrentUserUseCase({required IUserRepository userRepository})
      : _userRepository = userRepository;

  final IUserRepository _userRepository;

  @override
  Future<Result<User?, AppError>> execute() =>
      _userRepository.getCurrentUser();
}
```

---

## Estructura de archivos

Las interfaces se ubican en `lib/core/interfaces/`. Cada interfaz **debe** tener su propio archivo en `snake_case`. La carpeta **debe** tener un barrel file `interfaces.dart`.

```
lib/
└── core/
    └── interfaces/
        ├── base_enum.dart
        ├── use_cases.dart
        └── interfaces.dart
```

```dart title="core/interfaces/interfaces.dart"
export 'base_enum.dart';
export 'use_cases.dart';
```

### Importación

Las interfaces **deben** importarse desde el barrel file.

```dart
// ✅ Correcto
import 'package:app/core/interfaces/interfaces.dart';

// ❌ Incorrecto
import 'package:app/core/interfaces/use_cases.dart';
```
