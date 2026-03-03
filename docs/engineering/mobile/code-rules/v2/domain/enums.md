# Enums

Los enumeradores de dominio representan conjuntos cerrados y tipados de valores válidos para un concepto del negocio. Se ubican en `domain/entities/enums/` y son parte del modelo de dominio.

## Clases

### Nombrado de clases

Los enumeradores **deben** nombrarse en singular y en PascalCase, representando el concepto que describen sin sufijos innecesarios como `Enum` o `Type`.

```dart
enum OrderStatus { }

enum UserRole { }

enum PaymentMethod { }
```

## Valores

### Nombrado de valores

Los valores de los enumeradores **deben** definirse en camelCase.

```dart
enum OrderStatus {
  pending,
  confirmed,
  shipped,
  delivered,
  cancelled,
  unknown;
}
```

### Valor `unknown`

Los enumeradores **deben** incluir un valor `unknown` que represente la ausencia de valor o un estado no reconocido. Este valor actúa como fallback seguro cuando se deserializa un valor desconocido proveniente de una fuente externa.

```dart
enum PaymentMethod {
  card,
  bankTransfer,
  cash,
  unknown; // Valor de fallback
}
```

:::note
El valor `unknown` protege la aplicación de casos no contemplados. En la capa de datos, el enum modelo usa `unknown` como resultado de su factory `fromValue` cuando el API retorna un valor no reconocido. Ver [Enums de modelos](../../data/enums).
:::

## Métodos auxiliares

### Getters

Los enumeradores **pueden** incluir getters booleanos para facilitar las comprobaciones en condicionales. Cada getter **debe** tener un nombre descriptivo que exprese la condición que representa.

```dart
enum OrderStatus {
  pending,
  confirmed,
  shipped,
  delivered,
  cancelled,
  unknown;

  bool get isPending => this == OrderStatus.pending;
  bool get isConfirmed => this == OrderStatus.confirmed;
  bool get isShipped => this == OrderStatus.shipped;
  bool get isDelivered => this == OrderStatus.delivered;
  bool get isCancelled => this == OrderStatus.cancelled;
  bool get isUnknown => this == OrderStatus.unknown;
}
```

Los getters permiten escribir condicionales más legibles en el código consumidor:

```dart
// Con getter
if (order.status.isDelivered) { ... }

// Sin getter
if (order.status == OrderStatus.delivered) { ... }
```

## Estructura de archivos

Cada enumerador **debe** tener su propio archivo nombrado en `snake_case`. Todos los archivos **deben** ubicarse en `domain/entities/enums/`. La carpeta **debe** tener un barrel file `enums.dart` que exporte todos los enumeradores.

```
domain/
└── entities/
    └── enums/
        ├── order_status.dart
        ├── payment_method.dart
        ├── user_role.dart
        └── enums.dart             ← barrel file
```

### Nombrado de archivos

Los archivos **deben** nombrarse en `snake_case` usando el nombre del enumerador.

```
OrderStatus    →  order_status.dart
UserRole       →  user_role.dart
PaymentMethod  →  payment_method.dart
```

### Barrel file

El barrel file `enums.dart` **debe** exportar todos los enumeradores de la carpeta.

```dart title="entities/enums/enums.dart"
export 'order_status.dart';
export 'payment_method.dart';
export 'user_role.dart';
```
