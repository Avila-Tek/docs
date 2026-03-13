# Repositorios

Los repositorios son interfaces que abstraen el acceso a datos. La capa de dominio solo conoce la interfaz; la capa de datos proporciona la implementación concreta. Esta separación garantiza que la lógica de negocio sea independiente de cualquier SDK externo, base de datos o API.

## Clases

### Nombrado de clases

Los repositorios **deben** nombrarse con el prefijo `I` y el sufijo `Repository`. El nombre base **debe** reflejar el módulo o conjunto de datos que gestiona.

```dart
class IProductRepository { }

class IUserRepository { }

class IOrderRepository { }
```

### Tipo abstracto

Los repositorios **deben** ser abstractos para evitar la dependencia de implementaciones concretas en la capa de dominio.

```dart
abstract class IProductRepository { }
```

## Métodos

### Retorno con `Result`

Todos los métodos **deben** retornar `Future<Result<T, AppError>>`. Los repositorios **nunca** lanzan excepciones; el éxito o el fracaso siempre se expresan a través del tipo `Result`.

```dart
abstract class IProductRepository {
  Future<Result<List<Product>, AppError>> getProducts(
    GetProductsParams params,
  );

  Future<Result<Product, AppError>> createProduct(
    CreateProductParams params,
  );

  Future<Result<void, AppError>> deleteProduct(String productId);
}
```

### Parámetros de entrada

Los métodos **deben** recibir los datos de entrada a través de los objetos [`Params`](./params) del dominio cuando la operación requiere más de un campo. Para operadores simples como un identificador, se puede aceptar el tipo directamente.

```dart
abstract class IOrderRepository {
  // Parámetro complejo → usa Params
  Future<Result<PaginatedData<Order>, AppError>> getOrders(
    GetOrdersParams params,
  );

  // Identificador simple → tipo directo
  Future<Result<Order, AppError>> getOrderById(String orderId);
}
```

### Documentación de métodos

Cada método **debe** estar documentado con una descripción de su propósito, sus parámetros y su valor de retorno en los casos de éxito y error.

```dart
abstract class IProductRepository {
  /// Fetches a paginated list of products matching the given filters.
  ///
  /// **Parameters**
  /// - [params] contains pagination, sorting, and filter criteria.
  ///
  /// **Returns**
  /// - `PaginatedData<Product>` with the matching products on success.
  /// - `AppError` if the request fails or the user is not authorized.
  Future<Result<PaginatedData<Product>, AppError>> getProducts(
    GetProductsParams params,
  );

  /// Creates a new product in the catalog.
  ///
  /// **Parameters**
  /// - [params] contains the product name, price, and category.
  ///
  /// **Returns**
  /// - `Product` with the created product data on success.
  /// - `AppError` if the creation fails or the user lacks permissions.
  Future<Result<Product, AppError>> createProduct(
    CreateProductParams params,
  );
}
```

## Streams

### Declaración de streams

Los streams **deben** declararse como getters cuando el repositorio necesita emitir datos en tiempo real. **Deben** estar documentados describiendo qué evento emiten y cuándo.

```dart
abstract class IProductRepository {
  /// Emits the updated product whenever it is modified remotely.
  Stream<Product> get productUpdates;

  /// Emits `true` when the product catalog is refreshed from the server.
  Stream<bool> get catalogRefreshed;
}
```

## Estructura de archivos

Cada repositorio **debe** tener su propio archivo nombrado en `snake_case`. Todos los archivos **deben** ubicarse en `domain/repositories/`. La carpeta **debe** tener un barrel file `repositories.dart` que exporte todas las interfaces.

```
domain/
└── repositories/
    ├── order_repository.dart
    ├── product_repository.dart
    ├── user_repository.dart
    └── repositories.dart               ← barrel file
```

### Nombrado de archivos

Los archivos **deben** nombrarse en `snake_case` a partir del nombre base de la interfaz, **sin** incluir el prefijo `I`. El prefijo es una convención de clase Dart y no forma parte del nombre del archivo.

```
IProductRepository  →  product_repository.dart
IUserRepository     →  user_repository.dart
IOrderRepository    →  order_repository.dart
```

### Barrel file

El barrel file `repositories.dart` **debe** exportar todas las interfaces de la carpeta.

```dart title="repositories/repositories.dart"
export 'order_repository.dart';
export 'product_repository.dart';
export 'user_repository.dart';
```
