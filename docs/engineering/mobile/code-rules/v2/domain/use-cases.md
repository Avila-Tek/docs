# Casos de uso

Los casos de uso son los orquestadores de la lógica de negocio. Coordinan entidades, repositorios y reglas del dominio para ejecutar una operación concreta de la aplicación. En v2, cada caso de uso implementa una de las dos interfaces base definidas en `core/interfaces`.

## Interfaces base

Todos los casos de uso **deben** extender una de las dos interfaces genéricas definidas en [`core/interfaces`](../core/interfaces.md):

| Interfaz | Cuándo usarla |
|---|---|
| [`UseCaseWithParams<Type, Params>`](../core/interfaces.md#usecasewithparams) | La operación requiere datos de entrada (un objeto `Params`). |
| [`UseCaseWithoutParams<Type>`](../core/interfaces.md#usecasewithoutparams) | La operación no necesita datos de entrada. |

El parámetro de tipo `Type` **debe** ser siempre `Result<T, AppError>`.

El método que ambas interfaces obligan a implementar es `execute()`.

## Clases

### Nombrado de clases

Los casos de uso **deben** nombrarse en PascalCase con el sufijo `UseCase`. El nombre base **debe** reflejar claramente la acción que realizan.

```dart
class GetProductsUseCase { }

class CreateOrderUseCase { }

class GetCurrentUserUseCase { }
```

### Declaración completa

La clase declara la interfaz base con los tipos concretos de retorno y parámetro.

```dart
// Con parámetros
class GetProductsUseCase
    extends UseCaseWithParams<
      Result<PaginatedData<Product>, AppError>,
      GetProductsParams
    > { }

// Sin parámetros
class GetCurrentUserUseCase
    extends UseCaseWithoutParams<Result<User?, AppError>> { }
```

## Constructor

### Inyección de dependencias

Los casos de uso **deben** recibir sus dependencias a través del constructor usando parámetros nombrados `required`. Los tipos **deben** ser interfaces de repositorio, **nunca** implementaciones concretas.

```dart
class GetProductsUseCase
    extends UseCaseWithParams<
      Result<PaginatedData<Product>, AppError>,
      GetProductsParams
    > {
  GetProductsUseCase({
    required IProductRepository productRepository,
  }) : _productRepository = productRepository;

  final IProductRepository _productRepository;
}
```

### Múltiples dependencias

Un caso de uso puede depender de más de un repositorio cuando la operación requiere coordinar datos de distintas fuentes.

```dart
class ActivateSubscriptionUseCase
    extends UseCaseWithParams<Result<void, AppError>, ActivateSubscriptionParams> {
  ActivateSubscriptionUseCase({
    required ISubscriptionRepository subscriptionRepository,
    required IUserRepository userRepository,
  }) : _subscriptionRepository = subscriptionRepository,
       _userRepository = userRepository;

  final ISubscriptionRepository _subscriptionRepository;
  final IUserRepository _userRepository;
}
```

## Método `execute()`

### Implementación simple

Cuando el caso de uso delega directamente a un repositorio sin lógica adicional, `execute()` puede ser una expresión de una sola línea.

```dart
class GetProductsUseCase
    extends UseCaseWithParams<
      Result<PaginatedData<Product>, AppError>,
      GetProductsParams
    > {
  GetProductsUseCase({required IProductRepository productRepository})
      : _productRepository = productRepository;

  final IProductRepository _productRepository;

  @override
  Future<Result<PaginatedData<Product>, AppError>> execute(
    GetProductsParams parameters,
  ) => _productRepository.getProducts(parameters);
}
```

### Implementación con lógica de orquestación

Cuando la operación requiere coordinar múltiples pasos o repositorios, `execute()` contiene la lógica de orquestación. Dado que los repositorios ya retornan `Result`, **no se usan bloques `try/catch`**.

```dart
class ActivateSubscriptionUseCase
    extends UseCaseWithParams<Result<void, AppError>, ActivateSubscriptionParams> {
  ActivateSubscriptionUseCase({
    required ISubscriptionRepository subscriptionRepository,
    required IUserRepository userRepository,
  }) : _subscriptionRepository = subscriptionRepository,
       _userRepository = userRepository;

  final ISubscriptionRepository _subscriptionRepository;
  final IUserRepository _userRepository;

  @override
  Future<Result<void, AppError>> execute(
    ActivateSubscriptionParams parameters,
  ) async {
    final currentUser = _userRepository.currentUser;

    if (currentUser == null) {
      return Failure(const AppError());
    }

    return _subscriptionRepository.activate(parameters);
  }
}
```

:::note
No se usan bloques `try/catch` en los casos de uso. Los repositorios son responsables de capturar errores y devolverlos como `Failure`. La capa de dominio solo orquesta el flujo.
:::

## Streams

Los casos de uso **pueden** exponer streams del repositorio como getters cuando la capa de presentación necesita reaccionar a cambios en tiempo real.

```dart
class GetCurrentUserUseCase
    extends UseCaseWithoutParams<Result<User?, AppError>> {
  GetCurrentUserUseCase({required IUserRepository userRepository})
      : _userRepository = userRepository;

  final IUserRepository _userRepository;

  /// Emits the updated user data whenever the profile changes.
  Stream<User> get currentUserStream => _userRepository.currentUserChanges;

  @override
  Future<Result<User?, AppError>> execute() =>
      _userRepository.getCurrentUser();
}
```

## Estructura de archivos

Los casos de uso **deben** organizarse en subcarpetas por dominio dentro de `use_cases/`. Cada subcarpeta **debe** tener su propio barrel file. El directorio raíz `use_cases/` **debe** tener un barrel file `use_cases.dart` que re-exporte todos los barrel files de las subcarpetas.

```
domain/
└── use_cases/
    ├── order/
    │   ├── create_order.dart
    │   ├── get_orders.dart
    │   └── order.dart                  ← barrel file de subcarpeta
    ├── product/
    │   ├── create_product.dart
    │   ├── get_products.dart
    │   └── product.dart                ← barrel file de subcarpeta
    ├── user/
    │   ├── get_current_user.dart
    │   └── user.dart                   ← barrel file de subcarpeta
    └── use_cases.dart                  ← barrel file raíz
```

### Nombrado de archivos

Los archivos **deben** nombrarse en `snake_case` usando el nombre completo de la clase sin el sufijo `UseCase`.

```
GetProductsUseCase   →  get_products.dart
CreateOrderUseCase   →  create_order.dart
GetCurrentUserUseCase  →  get_current_user.dart
```

### Barrel file de subcarpeta

```dart title="use_cases/product/product.dart"
export 'create_product.dart';
export 'get_products.dart';
```

### Barrel file raíz

```dart title="use_cases/use_cases.dart"
export 'order/order.dart';
export 'product/product.dart';
export 'user/user.dart';
```
