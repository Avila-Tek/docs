# Modelos

## Clases

### Nombrado de modelos

Los modelos **deben** incluir el sufijo `Model` en su nombre y **deben** utilizar el mismo nombre base de la entidad correspondiente.

```dart
class UserModel { }

class ProductModel { }
```

#### A. Contextualización de nombres de clases

Los modelos **pueden** incluir en su nombre el tipo de objeto que representan. Por ejemplo, `Dto` para objetos de transferencia de datos, `Response` para objetos de respuesta, `Request` para objetos de solicitud, etc; respetando la regla de [Nombrado de modelos](#nombrado-de-modelos). Se recomienda mantener un estándar en la contextualización del nombrado de modelos dentro del mismo proyecto o paquete.

```dart
class UserDtoModel extends User { }

class CreateUserRequestModel extends CreateUserRequest { }

class UpdateUserResponseModel { }
```

### Extensión de la clase entidad

Las clases de modelos **deben** extender de la clase entidad correspondiente.

```dart
class UserModel extends User { }

class ProductModel extends Product { }
```

#### A. Excepción de extensión

Esta regla no aplica para modelos que no tengan una clase entidad correspondiente. Por ejemplo, modelos de datos que no representan entidades o modelos de uso limitado a la capa de datos.

## Constructores

### Constructor generativo

Los modelos **deben** definir un [constructor generativo](https://dart.dev/language/constructors#generative-constructors) que acepte todos los [parámetros super](https://dart.dev/language/constructors#super-parameters).

```dart
class UserModel extends User {
  UserModel({
    required super.id,
    required super.name,
  });
}
```

#### A. Uso de delegados para asignación de parámetros super

Los modelos **pueden** aceptar parámetros de tipos diferentes a los de la entidad correspondiente. En estos casos, el cuerpo del constructor generativo **debe** realizar la conversión del parámetro delegado en la asignación del parámetro super correspondiente.

```dart title="Delegación de parámetros de tipos primitivos"
class UserModel extends User {
  UserModel({
    required int id, // 👈 Parámetro `id` delegado
    required super.name,
  }) : (super.id = id.toString());
  // 👆 El constructor de UserModel recibe un int como parámetro id, mientras que el constructor de User espera un String. La conversión se realiza en el cuerpo del constructor del modelo.
}
```


```dart title="Delegación de parámetros de tipo enum"
/// Modelo de enum correspondiente a la entidad UserStatus
enum UserStatusModel {
  active('active'),
  inactive('inactive');

  const UserStatusModel(this.value);

  final String value;

  UserStatus toEntity() {
    switch (this) {
      case UserStatusModel.active:
        return UserStatus.active;
      case UserStatusModel.inactive:
        return UserStatus.inactive;
    }
  }
}

class UserModel extends User {
  UserModel({
    required super.id,
    required super.name,
    required UserStatusModel status,
  }) : super(
      status: status.toEntity(), // 👈 Conversión del enum model al enum entidad
    );
}
```

### Constructor factory `fromMap`

Los modelos que requieran ser serializados de un mapa **deben** tener un [constructor *factory*](https://dart.dev/language/constructors#factory-constructors) de nombre `fromMap` que crea una instancia del modelo a partir de un objeto `Map`.

#### A. Argumento `data`

El método `fromMap` **debe** recibir un objeto de tipo `Map<E,S>` como argumento obligatorio llamado `data`. Generalmente, `E` es de tipo `String` y `S` es de tipo `dynamic`, pero esto **puede** variar de un modelo a otro.

```dart
class UserModel extends User {
  factory UserModel.fromMap(Map<String, dynamic> data) { ... }
}
```

#### B. Argumentos extra

El método `fromMap` **puede** recibir argumentos adicionales a `data`. El parámetro `data` **debe** ser posicional y el resto de parámetros **deben** ser de tipo nombrado y **pueden** ser opcionales u obligatorios.

```dart
class UserModel extends User {
  factory UserModel.fromMap(Map<String, dynamic> data, {String? extra}) {
    ... 
  }
}
```

#### C. Variables intermedias en constructores `fromMap`

Los constructores `fromMap` **deben** utilizar variables intermedias para almacenar los valores de los parámetros del constructor. 

```dart
class UserModel extends User {
  
  factory UserModel.fromMap(Map<String, dynamic> data) {
    // 👇 Variables intermedias
    final id = data['id'];
    final name = data['name'];
    
    return UserModel(id: id, name: name);
  }
}
```

#### D. Manejo de valores nulos de parámetros en constructores `fromMap`

Todos los parámetros provenientes del argumento `data` **deben** evaluar y resolver posibles valores nulos, salvo aquellos valores anulables opcionales, o aquellos que requieran una manejo especial según la necesidad del proyecto.

```dart
class UserModel extends User {
  factory UserModel.fromMap(Map<String, dynamic> data) {
    final id = data['id'] ?? ''; // 👈 Manejo de valor nulo
    final name = data['name'] ?? '';
    
    return UserModel(id: id, name: name);
  }
}
```

### Constructor nombrado `empty`

Los modelos **deben** tener un [constructor nombrado](https://dart.dev/language/constructors#named-constructors) constante `empty` que crea un modelo vacío con todos sus atributos con el valor mínimo representable de cada tipo de dato. Por ejemplo, un `int` sería `0`, un `String` una cadena vacía `''`, `List` una lista vacía `[]`, etc. 

El constructor `empty` **debe** ser un [constructor constante](https://dart.dev/language/constructors#constant-constructors).

```dart
class ProductModel extends Product {
  const ProductModel.empty() : super(
    id: '', 
    price: 0.0,
    photos: [], 
    status: ProductStatus.inactive
  );
}
```

:::note
El constructor `empty` en modelos se usa principalmente en las pruebas unitarias para crear fácilmente instancias del modelo vacías.
:::


## Atributos

### Herencia de atributos de la entidad

Los modelos **deben** respetar los atributos heredados de la entidad correspondiente. **No se debe** definir atributos redundantes o repetidos con aquellos presentes en la entidad heredada.

#### A. Atributos adicionales no redundantes

Los modelos **pueden** definir atributos adicionales que no estén presentes en la entidad que no sean redundantes, entendiendose por redundantes aquellos atributos con un mismo significado que ya están presentes en la entidad.

```dart
class User {
  User(String id);

  final String id;
}

class UserModel extends User {
  UserModel({
    required super.id, 
    required String extra,
  });

  final String extra;
}
```

### Atributo `query`

Los modelos de objetos de GraphQL **deben** tener una constante estática `query` de tipo `String` con los campos respectivos del query que se debe ejecutar para obtener el modelo.

```dart
class UserModel extends User {
  UserModel({
    required super.id,
    required super.name,
  });
}

static const String query = r'''
  id,
  name,
''';
```

### Atributos de tipo `DateTime`

Los modelos con atributos de tipo `DateTime` **deben** declarar estos atributos como getters y guardar el valor en formato [Unix epoch UTC](https://es.wikipedia.org/wiki/Tiempo_Unix) (de tipo `int`).

```dart
class UserModel extends User {
  const UserModel({
    required this.createdAtUnix,
  });

  const ProductModel.empty() : super(
    createdAtUnix: 0,
  );

  DateTime get createdAt => DateTime.fromMillisecondsSinceEpoch(createdAtUnix);
  final int createdAtUnix;
}
```

:::warning
Esta regla también aplica a las entidades. En la mayoría de los casos, el modelo no necesita declarar el atributo dentro de su clase, ya que el valor se obtiene de la entidad por herencia.
:::

## Métodos especiales

### Método `toMap`

Los modelos que requieran ser convertidos a un mapa **deben** tener un método `toMap` que convierta el modelo en un objeto de tipo `Map<String,dynamic>`.

```dart
class UserModel extends User {  
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
    };
  }
}
```

#### A. Serialización de enums

Los modelo con atributos de tipo enum **deben** serializar los valores de los enums en el formato adecuado para el servicio externo usando las funciones auxiliares del enum modelo.

```dart title="Serialización de enums"
enum UserStatusModel {
  active('active'),
  inactive('inactive');

  const UserStatusModel(this.value);

  final String value;

  UserStatusModel fromEntity(UserStatus status) {
    switch (status) {
      case UserStatus.active:
        return UserStatusModel.active;
      case UserStatus.inactive:
        return UserStatusModel.inactive;
    }
  }
}

class UserModel extends User {
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'status': UserstatusModel.fromEntity(status).value, // 👈 Conversión del enum entidad al enum model
    };
  }
}
```

#### B. Omisión del método `toMap`

Los modelos que no requieran serializar a un mapa **deben** omitir el método `toMap`.


### Método `toJson`

Los modelos que requieran serializar a un objeto JSON **deben** tener un método `toJson` que convierta el modelo en un `String` en formato JSON mediante la función [`jsonEncode`](https://api.flutter.dev/flutter/dart-convert/jsonEncode.html) de la librería [`dart:convert`](https://api.dart.dev/stable/2.18.0/dart-convert/jsonEncode.html).

```dart
import 'dart:convert';

class UserModel extends User {
  Map<String, dynamic> toMap() { ... }
  String toJson() {
    return jsonEncode(toMap());
  }
}
```

#### A. Omisión del método `toJson`

Los modelos que no requieran serializar a un objeto JSON **deben** omitir el método `toJson`.


:::note
Se recomienda usar interfaces para forzar la estructura de los enumeradores.
:::
