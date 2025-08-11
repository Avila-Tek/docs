# Entidades

## Clases

### Nombrado de entidades

Las entidades **deben** tener nombres que representen de forma clara y directa la entidad del dominio que simbolizan. **No deben** incluir prefijos ni sufijos innecesarios como `Entity`, `Object` o similares.

Los nombres de las entidades **deben** estar en singular y en caso de ser compuestos, **deben** estar en _PascalCase_.

```dart
class User { }

class CivilStatus { }
```

**Ejemplos adicionales:**

- En el caso de representar un producto en un sistema de inventario, la entidad debería llamarse `Product`.
- Para representar una factura, la entidad debería llamarse `Invoice`.

### Extensión de la clase `Equatable`

#### A. Contexto del uso de `Equatable`

En Dart, las clases no comparan instancias basadas en sus atributos de manera predeterminada; en su lugar, se comparan utilizando la referencia en memoria. Esto quiere decir que dos instancias de una clase con los mismos valores de atributos serían consideradas diferentes si no se anulan los métodos `==` y `hashCode`. Es por ello que para asegurarse de poder comparar las entidades, se hará uso del paquete `Equatable`.

#### B. Implementación

Las entidades **deben** extender de la clase `Equatable` para facilitar la comparación de instancias, asegurando que las entidades se consideren iguales si tienen los mismos valores en sus atributos.

Es importante recordar que al extender de `Equatable`, se **debe** sobrescribir el método `props` para indicar cuáles son los atributos que se deben tener en cuenta al comparar dos instancias de la entidad. Esta lista de atributos se **debe** actualizar cada vez que se realice un cambio en la entidad.

```dart
import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String name;

  // Resto del código...

  @override
  List<Object?> get props => [id, name];
}
```

:::info
Para profundizar un poco más en el tema, se recomienda leer la documentación oficial de [Equatable](https://pub.dev/packages/equatable).
:::

### Documentación de la entidad

Cada entidad **debe** estar acompañada de comentarios que describan su propósito, uso, y cualquier detalle relevante sobre su funcionamiento o estructura. Estos comentarios **deben** estar ubicados en la parte superior de la clase, justo antes de la declaración de la misma y **deben** ir en inglés.

```dart
/// [User] contains all basic information about any user inside
/// the application.
/// This includes their unique id, email and name.
class User extends Equatable {
  //...
}
```

## Constructores

### Constructor base

El constructor principal de la entidad **debe** ser constante `(const)` siempre que sea posible. Esto permite que la entidad se use en lugares donde se requieren constantes en tiempo de compilación.

```dart
class User extends Equatable {
  final String id;
  final String name;

  const User({
    required this.id,
    required this.name,
  });

  // Resto del código...
}
```

### Constructor `empty`

Las entidades **deben** incluir un constructor `empty` que permita inicializar la entidad con valores predeterminados o vacíos. Este constructor **debe** ser constante `(const)` siempre que sea posible.

```dart
class User extends Equatable {
  // Resto del código...

  const User.empty()
      : id = '',
        name = '';

  // Resto del código...
}
```

Algunos ejemplos comunes de su uso son: inicializar un formulario vacío, declarar una variable constante en el estado de un bloc, e incluso para realizar pruebas unitarias.

## Métodos

### Getters y setters

Dentro de los métodos que posee una entidad, **pueden** existir getters y setters para acceder a los atributos de la misma. Si bien no es común, **pueden** existir casos en los que sea necesario realizar alguna lógica adicional para obtener un atributo, como se muestra en el siguiente ejemplo:

```dart
class User extends Equatable {
  final String name;
  final String lastName;

  const User({
    required this.name,
    required this.lastName,
  });

  String get fullName => '$name $lastName';

  // Resto del código...
}
```

En el caso de los setters, estos **deben** ser evitados en la medida de lo posible, ya que rompen con el principio de inmutabilidad de las entidades. Sin embargo, si es necesario, se **debe** implementar una lógica que permita mantener segura la integridad de la entidad.

```dart
class User extends Equatable {
  final String name;
  final String lastName;

  const User({
    required this.name,
    required this.lastName,
  });

  set fullName(String value) {
    final parts = value.split(' ');
    name = parts[0];
    lastName = parts[1];
  }

  // Resto del código...
}
```

### Método `copyWith`

#### A. Contexto del uso de `copyWith`

El método copyWith es una técnica común en Dart para crear una copia de una instancia de una clase con algunos valores modificados. Este método permite trabajar en torno a la inmutabilidad de las entidades, ya que en lugar de modificar la instancia existente como se haría con un `setter`, `copyWith` permite crear una nueva instancia basada en la original, con ciertos atributos modificados.

#### B. Implementación

No todas las entidades requieren un método `copyWith`, pero en caso de que lo necesite, este **debe** ser implementado de la siguiente manera:

```dart
class User extends Equatable {

  // Resto del código...

  User copyWith({
    String? id,
    String? name,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
    );
  }

  // Resto del código...
}
```

## Atributos

### Declaración de atributos `final`

Los atributos de las entidades **deben** ser declarados como `final`, asegurando así que las instancias sean inmutables. Esto significa que los valores de los atributos se asignan en el constructor y no pueden cambiar después de que se haya creado la instancia. La única excepción a esta regla es cuando se necesita modificar un atributo en un método `copyWith`.

```dart
class User extends Equatable {
  final String id;
  final String name;

  // Resto del código...
}
```

### Atributos anulables

Los atributos de la entidad **pueden** ser anulables `(null)`, pero esto **debe** estar justificado, bien sea porque el atributo es opcional o porque su valor puede ser nulo en algún momento. La explicación de por qué un atributo es anulable **debe** estar documentada en el comentario de la entidad.

```dart
class User extends Equatable {
  final String id;

  /// The email of the user. Can be null if the user hasn't provided one.
  final String? email;

  // Resto del código...
}
```

**Ejemplos adicionales:**

- En el caso de un formulario de registro, el campo de teléfono podría ser opcional, por lo que el atributo correspondiente sería anulable.
- Si una entidad será utilizada en múltiples flujos y en alguno de ellos un atributo no es necesario o no existe, este atributo **debe** ser anulable.

### Atributos requeridos / no requeridos

Los atributos que son esenciales para la identidad o funcionamiento de la entidad **deben** ser marcados como `required` en el constructor. Los atributos opcionales pueden ser declarados como anulables o tener valores por defecto. La elección entre un atributo anulable o un valor por defecto **debe** estar justificada y documentada en el comentario de la entidad.

```dart
class User extends Equatable {
  final String id;
  /// The phones of the user. Can be null if the user has no phones.
  final List<Phone>? phones;

  const User({
    required this.id,
    this.phones,
  });

  // Resto del código...
}
```

O, alternativamente:

```dart
class User extends Equatable {
  final String id;
  /// The phones of the user. Can be empty if the user has no phones.
  final List<Phone> phones;

  const User({
    required this.id,
    this.phones = const [],
  });

  // Resto del código...
}
```
