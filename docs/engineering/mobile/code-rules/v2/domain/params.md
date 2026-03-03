# Parámetros

Los parámetros (`params`) son objetos de entrada que encapsulan los datos necesarios para ejecutar un caso de uso o llamar a un método de repositorio. **No son entidades**: no representan un concepto del negocio por sí mismos sino los datos requeridos para realizar una operación concreta.

En la capa de datos, los [modelos de solicitud (`RequestModel`)](../data/models.md) extienden directamente las clases de parámetros del dominio para agregar la lógica de serialización.

## Clases

### Nombrado de clases

Las clases de parámetros **deben** nombrarse en PascalCase con el sufijo `Params`. El nombre base **debe** describir la operación que habilitan.

```dart
class CreateProductParams { }

class UpdateUserParams { }

class GetOrdersParams { }
```

## Constructores

### Constructor base

El constructor de los parámetros **debe** ser constante (`const`) y utilizar parámetros nombrados. Todos los campos obligatorios **deben** marcarse como `required`.

```dart
class CreateProductParams {
  const CreateProductParams({
    required this.name,
    required this.price,
    required this.categoryId,
  });

  final String name;
  final double price;
  final String categoryId;
}
```

## Atributos

### Declaración de atributos `final`

Todos los atributos **deben** ser `final`. Los parámetros son inmutables: se crean con todos sus valores y no se modifican.

```dart
class UpdateUserParams {
  const UpdateUserParams({
    required this.userId,
    required this.name,
    this.avatarUrl,
  });

  final String userId;
  final String name;

  /// The new avatar URL. Null if the avatar should not be updated.
  final String? avatarUrl;
}
```

### Atributos anulables

Los atributos de parámetros **pueden** ser anulables cuando el campo es verdaderamente opcional para la operación. Esto **debe** documentarse en el comentario del atributo.

```dart
class GetOrdersParams {
  const GetOrdersParams({
    required this.userId,
    this.status,
    this.limit,
  });

  final String userId;

  /// Filter by status. Null returns orders of all statuses.
  final OrderStatus? status;

  /// Maximum number of results. Null uses the server default.
  final int? limit;
}
```

## Métodos

### Sin métodos de transformación ni `copyWith`

Las clases de parámetros **no deben** incluir métodos de transformación, getters calculados ni `copyWith`. Son objetos de transferencia de datos (*value objects*) simples; su única responsabilidad es agrupar los datos de entrada de una operación.

```dart
// Correcto: solo atributos y constructor
class CreateProductParams {
  const CreateProductParams({
    required this.name,
    required this.price,
  });

  final String name;
  final double price;
}

// Incorrecto: métodos innecesarios en un params
class CreateProductParams {
  // ...

  CreateProductParams copyWith({ ... }) { ... } // ❌
  bool get isValid => name.isNotEmpty; // ❌
}
```

## Relación con la capa de datos

Los parámetros son la clase base que los modelos de solicitud (`RequestModel`) de la capa de datos extienden para agregar serialización. El dominio solo conoce los parámetros; la capa de datos es responsable de convertirlos al formato que espera la API.

```dart
// Dominio
class CreateProductParams {
  const CreateProductParams({
    required this.name,
    required this.price,
  });

  final String name;
  final double price;
}

// Datos (extiende el params del dominio)
class CreateProductRequestModel extends CreateProductParams {
  const CreateProductRequestModel({
    required super.name,
    required super.price,
  });

  Map<String, dynamic> toMap() => {
        'name': name,
        'price': price,
      };
}
```

:::note
Ver [Modelos → Request models](../data/models.md) para las reglas completas sobre `RequestModel`.
:::

## Estructura de archivos

Cada clase de parámetros **debe** tener su propio archivo nombrado en `snake_case`. Todos los archivos **deben** ubicarse en `domain/entities/params/`. La carpeta **debe** tener un barrel file `params.dart` que exporte todas las clases.

```
domain/
└── entities/
    └── params/
        ├── create_product_params.dart
        ├── get_orders_params.dart
        ├── update_user_params.dart
        └── params.dart               ← barrel file
```

### Nombrado de archivos

Los archivos **deben** nombrarse en `snake_case` usando el nombre completo de la clase.

```
CreateProductParams  →  create_product_params.dart
UpdateUserParams     →  update_user_params.dart
GetOrdersParams      →  get_orders_params.dart
```

### Barrel file

El barrel file `params.dart` **debe** exportar todas las clases de parámetros de la carpeta.

```dart title="entities/params/params.dart"
export 'create_product_params.dart';
export 'get_orders_params.dart';
export 'update_user_params.dart';
```
