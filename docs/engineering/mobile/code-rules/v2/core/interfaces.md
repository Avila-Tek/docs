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

## `IAsyncState`

`IAsyncState<T, E>` es la clase base abstracta de todos los estados async del proyecto. Contiene el valor, el status y el error opcional de cualquier operación asíncrona.

```dart title="lib/core/interfaces/async_states.dart"
abstract class IAsyncState<T, E extends BaseError> {
  const IAsyncState({
    required this.value,
    this.status = FetchAsyncStatus.initial,
    this.error,
  });

  /// The current data value (may be a placeholder/skeleton in loading states).
  final T value;

  /// The current status of the async operation.
  final AsyncStatus status;

  /// The error that occurred, if any.
  final E? error;
}
```

### Parámetros genéricos

| Parámetro | Rol | Tipo habitual |
|-----------|-----|---------------|
| `T` | Tipo del dato que almacena el estado | `double`, `List<Product>`, entidad de dominio |
| `E` | Tipo del error | `AppError` |

## `IFetchAsyncState`

Extiende `IAsyncState` con métodos de transición para operaciones de **lectura** y getters booleanos de conveniencia:

```dart title="lib/core/interfaces/async_states.dart"
abstract class IFetchAsyncState<T, E extends BaseError>
    extends IAsyncState<T, E> {
  const IFetchAsyncState({required super.value, super.error, super.status});

  /// Transitions to the loaded state with [data] as the new value.
  IAsyncState<T, E> loaded(T data);

  /// Transitions to the waiting state. Optionally replaces the placeholder value.
  IAsyncState<T, E> waiting([T? newPlaceholder]);

  /// Transitions to the failure state with the given [error].
  IAsyncState<T, E> failed(E error);

  bool get isInitial => status == FetchAsyncStatus.initial;
  bool get isWaiting => status == FetchAsyncStatus.waiting;
  bool get isLoaded  => status == FetchAsyncStatus.loaded;
  bool get isFailure => status == FetchAsyncStatus.failure;
}
```

La implementación concreta que se usa en los BLoCs es `FetchAsyncState<T, E>`. Ver [Types](./types.md).

## `ISendAsyncState`

Extiende `IAsyncState` con métodos de transición para operaciones de **escritura**:

```dart title="lib/core/interfaces/async_states.dart"
abstract class ISendAsyncState<T, E extends BaseError>
    extends IAsyncState<T, E> {
  const ISendAsyncState({required super.value, super.error, super.status});

  /// Transitions to the sent state. Optionally updates the value.
  IAsyncState<T, E> sent([T? data]);

  /// Transitions to the waiting state.
  IAsyncState<T, E> waiting();

  /// Transitions to the failure state with the given [error].
  IAsyncState<T, E> failed(E error);

  bool get isWaiting => status == SendAsyncStatus.waiting;
  bool get isSent    => status == SendAsyncStatus.sent;
  bool get isFailure => status == SendAsyncStatus.failure;
}
```

La implementación concreta es `SendAsyncState<T, E>`. Ver [Types](./types.md).

## `IReloadAsyncState`

Extiende `IFetchAsyncState` con soporte para recarga y actualización parcial. Se usa cuando la pantalla debe mostrar los datos existentes mientras se refresca en background:

```dart title="lib/core/interfaces/async_states.dart"
abstract class IReloadAsyncState<T, E extends BaseError>
    extends IFetchAsyncState<T, E> {
  const IReloadAsyncState({required super.value, super.status, super.error});

  /// Transitions to the reloading state (pull-to-refresh, background refresh).
  IReloadAsyncState<T, E> reloading([T? newPlaceholder]);

  /// Transitions to the updating state (partial data update).
  IReloadAsyncState<T, E> updating([T? newPlaceholder]);

  bool get isReloading => status == FetchAsyncStatus.reloading;
  bool get isUpdating  => status == FetchAsyncStatus.updating;
}
```

La implementación concreta es `ReloadAsyncState<T, E>`. Ver [Types](./types.md).

### Cuándo usar cada interfaz

| Interfaz | Caso de uso |
|---|---|
| `IFetchAsyncState` | Cargar datos una vez: listados, detalles, perfiles |
| `ISendAsyncState` | Enviar datos: crear, actualizar, eliminar, login, submit |
| `IReloadAsyncState` | Cargar + refrescar: listas con pull-to-refresh, datos que se actualizan en background |

---

## Estructura de archivos

Las interfaces se ubican en `lib/core/interfaces/`. Cada interfaz **debe** tener su propio archivo en `snake_case`. La carpeta **debe** tener un barrel file `interfaces.dart`.

```
lib/
└── core/
    └── interfaces/
        ├── base_enum.dart
        ├── use_cases.dart
        ├── async_states.dart
        └── interfaces.dart
```

```dart title="core/interfaces/interfaces.dart"
export 'base_enum.dart';
export 'use_cases.dart';
export 'async_states.dart';
```

### Importación

Las interfaces **deben** importarse desde el barrel file.

```dart
// ✅ Correcto
import 'package:app/core/interfaces/interfaces.dart';

// ❌ Incorrecto
import 'package:app/core/interfaces/use_cases.dart';
```
