# Entidades

Las entidades son clases inmutables que representan los conceptos del dominio de la aplicación. No contienen lógica de acceso a datos ni de presentación; solo definen la estructura de los datos y las operaciones de negocio puras sobre ellos.

## Clases

### Nombrado de entidades

Las entidades **deben** tener nombres que representen de forma clara y directa el concepto del dominio que simbolizan. **No deben** incluir prefijos ni sufijos innecesarios como `Entity`, `Object` o similares.

Los nombres **deben** estar en singular y en PascalCase.

```dart
class Product { }

class Order { }

class UserProfile { }
```

### Extensión de la clase `Equatable`

#### A. Contexto del uso de `Equatable`

En Dart, las clases comparan instancias por referencia en memoria de forma predeterminada. Esto significa que dos instancias con los mismos valores de atributos son consideradas distintas si no se anulan los métodos `==` y `hashCode`. Para garantizar comparaciones correctas en el dominio, se usa el paquete `Equatable`.

#### B. Implementación

Las entidades **deben** extender de `Equatable` y **deben** sobrescribir el getter `props` con la lista de atributos que participan en la comparación. Esta lista **debe** actualizarse cada vez que se modifique la entidad.

```dart
import 'package:equatable/equatable.dart';

class Product extends Equatable {
  const Product({
    required this.id,
    required this.name,
    required this.price,
  });

  final String id;
  final String name;
  final double price;

  @override
  List<Object?> get props => [id, name, price];
}
```

:::info
Para profundizar en el tema, consulta la documentación oficial de [Equatable](https://pub.dev/packages/equatable).
:::

### Documentación de la entidad

Cada entidad **debe** estar acompañada de un comentario de documentación en inglés que describa su propósito, uso y cualquier detalle relevante. El comentario **debe** ubicarse inmediatamente antes de la declaración de la clase.

```dart
/// [Product] represents a single item available for purchase
/// in the catalog. Includes pricing, availability, and metadata.
class Product extends Equatable {
  // ...
}
```

## Constructores

### Constructor base

El constructor principal de la entidad **debe** ser constante (`const`) siempre que sea posible y utilizar parámetros nombrados con `required` para los atributos obligatorios.

```dart
class Product extends Equatable {
  const Product({
    required this.id,
    required this.name,
    required this.price,
    this.description,
  });

  final String id;
  final String name;
  final double price;
  final String? description;

  @override
  List<Object?> get props => [id, name, price, description];
}
```

### Constructor `empty`

El constructor `empty` es **opcional**. Se **debe** agregar únicamente cuando exista un caso de uso concreto que lo requiera, como inicializar el estado de un Bloc, prellenar un formulario vacío o facilitar pruebas unitarias.

```dart
class Product extends Equatable {
  // ...

  const Product.empty()
      : id = '',
        name = '',
        price = 0,
        description = null;
}
```

:::note
No es necesario agregar `empty` por convención. Solo se agrega si el equipo identifica una necesidad real dentro del feature.
:::

## Métodos

### Getters

Las entidades **pueden** exponer getters para propiedades calculadas a partir de sus atributos, cuando esto simplifique el código consumidor.

```dart
class Order extends Equatable {
  final List<OrderItem> items;
  final double discountRate;

  const Order({
    required this.items,
    required this.discountRate,
  });

  double get subtotal =>
      items.fold(0, (sum, item) => sum + item.price * item.quantity);

  double get total => subtotal * (1 - discountRate);

  @override
  List<Object?> get props => [items, discountRate];
}
```

### Métodos de transformación

Las entidades **pueden** exponer métodos que devuelvan una nueva instancia con el estado transformado, cuando esa transformación tenga un nombre semántico claro dentro del dominio. Estos métodos **deben** ser puros: no modifican la instancia original sino que retornan una nueva.

```dart
class Order extends Equatable {
  final String id;
  final OrderStatus status;

  const Order({
    required this.id,
    required this.status,
  });

  /// Returns a new [Order] with [status] set to [OrderStatus.confirmed].
  Order confirm() => Order(
        id: id,
        status: OrderStatus.confirmed,
      );

  /// Returns a new [Order] with [status] set to [OrderStatus.cancelled].
  Order cancel() => Order(
        id: id,
        status: OrderStatus.cancelled,
      );

  @override
  List<Object?> get props => [id, status];
}
```

:::note
Los métodos de transformación son preferibles a `copyWith` cuando la operación tiene un nombre de negocio propio. Usa `copyWith` para actualizaciones parciales genéricas; usa métodos semánticos cuando la operación tiene un significado concreto en el dominio.
:::

### Método `copyWith`

El método `copyWith` **puede** implementarse cuando la entidad necesite actualizaciones parciales sin un nombre semántico asociado, por ejemplo al actualizar campos de un formulario.

```dart
class UserProfile extends Equatable {
  final String id;
  final String name;
  final String? avatarUrl;

  const UserProfile({
    required this.id,
    required this.name,
    this.avatarUrl,
  });

  UserProfile copyWith({
    String? id,
    String? name,
    String? avatarUrl,
  }) {
    return UserProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      avatarUrl: avatarUrl ?? this.avatarUrl,
    );
  }

  @override
  List<Object?> get props => [id, name, avatarUrl];
}
```

## Atributos

### Declaración de atributos `final`

Todos los atributos de las entidades **deben** declararse como `final`. Las entidades son inmutables: sus valores se asignan en el constructor y no cambian.

```dart
class Product extends Equatable {
  final String id;
  final String name;
  final double price;

  const Product({
    required this.id,
    required this.name,
    required this.price,
  });

  @override
  List<Object?> get props => [id, name, price];
}
```

### Atributos anulables

Los atributos **pueden** ser anulables (`Type?`), pero esto **debe** justificarse en el comentario del atributo, indicando cuándo y por qué puede ser nulo.

```dart
class Product extends Equatable {
  final String id;

  /// The promotional price. Null when no promotion is active.
  final double? promotionalPrice;

  const Product({
    required this.id,
    this.promotionalPrice,
  });

  @override
  List<Object?> get props => [id, promotionalPrice];
}
```

### Atributos requeridos y opcionales

Los atributos esenciales para la identidad o funcionamiento de la entidad **deben** marcarse como `required`. Los atributos opcionales **pueden** ser anulables o tener un valor por defecto, pero la elección **debe** estar justificada.

```dart
class Product extends Equatable {
  final String id;

  /// The tags associated with this product. Empty when none are assigned.
  final List<String> tags;

  /// The cover image URL. Null if no image has been uploaded.
  final String? imageUrl;

  const Product({
    required this.id,
    this.tags = const [],
    this.imageUrl,
  });

  @override
  List<Object?> get props => [id, tags, imageUrl];
}
```

## Estructura de archivos

Cada entidad **debe** tener su propio archivo nombrado en `snake_case`. Todos los archivos de entidades **deben** ubicarse en `domain/entities/`. La carpeta **debe** tener un barrel file `entities.dart` que exporte todas las entidades, enums y params.

```
domain/
└── entities/
    ├── enums/
    │   └── enums.dart
    ├── params/
    │   └── params.dart
    ├── product.dart
    ├── user_profile.dart
    ├── order.dart
    └── entities.dart        ← barrel file raíz
```

### Nombrado de archivos

Los archivos **deben** nombrarse en `snake_case` usando el nombre de la clase sin sufijos.

```
Product        →  product.dart
UserProfile    →  user_profile.dart
Order          →  order.dart
```

### Barrel file

El barrel file `entities.dart` **debe** re-exportar los barrels de `enums/` y `params/`, además de todas las entidades directas.

```dart title="entities/entities.dart"
export 'enums/enums.dart';
export 'params/params.dart';
export 'order.dart';
export 'product.dart';
export 'user_profile.dart';
```
