# Modelos

Los modelos son clases de la capa de datos que extienden las entidades y parámetros del dominio e implementan la serialización manual necesaria para comunicarse con servicios externos. El proyecto no usa `json_serializable`; toda la lógica de mapeo se escribe a mano.

Existen tres tipos de modelos, cada uno con un propósito específico:

| Tipo | Sufijo | Carpeta | Propósito |
|------|--------|---------|-----------|
| DTO | `DtoModel` | `data/models/dto/` | Deserializar respuestas de la API a entidades del dominio |
| Request | `RequestModel` | `data/models/requests/` | Encapsular los parámetros de una solicitud y serializarlos hacia la API |
| Response | `ResponseModel` | `data/models/responses/` | Mapear respuestas puntuales (e.g. payloads de autenticación) |

## Clases

### Nombrado de clases

Los modelos **deben** incluir el sufijo `Model` en su nombre y **deben** utilizar el mismo nombre base de la entidad o parámetros correspondiente.

```dart
class AnnouncementDtoModel { }

class ActivateCardRequestModel { }

class AuthenticationPayloadResponseModel { }
```

#### A. Contextualización por tipo de modelo

El nombre del modelo **debe** incluir el tipo de objeto que representa (`Dto`, `Request` o `Response`) antes del sufijo `Model`.

```dart
class AnnouncementDtoModel extends Announcement { }

class ActivateCardRequestModel extends ActivateCardParams { }

class AuthenticationPayloadResponseModel extends AuthenticationPayload { }
```

### Extensión de la clase del dominio

Los modelos **deben** extender de la entidad o la clase de parámetros correspondiente del dominio.

```dart
// DTO extiende la entidad
class AnnouncementDtoModel extends Announcement { }

// Request extiende los parámetros de dominio
class ActivateCardRequestModel extends ActivateCardParams { }

// Response extiende la entidad de respuesta
class AuthenticationPayloadResponseModel extends AuthenticationPayload { }
```

#### A. Excepción de extensión

Esta regla no aplica cuando el modelo no tiene una clase de dominio correspondiente. Por ejemplo, modelos auxiliares de uso exclusivo en la capa de datos.

## Constructores

### Constructor generativo

Los modelos **deben** definir un constructor generativo que acepte todos los parámetros `super` de la clase de dominio que extienden.

```dart
class ActivateCardRequestModel extends ActivateCardParams {
  const ActivateCardRequestModel({
    required super.consecutiveNumbers,
    required super.lastCardNumbers,
  });
}
```

### Constructor factory `fromMap`

Los modelos que requieran deserializar desde un mapa (DTOs y Responses) **deben** tener un constructor `factory` de nombre `fromMap` que reciba un argumento posicional `map` de tipo `DataMap`.

:::note
`DataMap` es un typedef del proyecto definido en `lib/core/typedefs/`. Consulta [Typedefs](../core/typedefs) para más detalles sobre su uso y restricciones.
:::

```dart
class AnnouncementDtoModel extends Announcement {
  factory AnnouncementDtoModel.fromMap(DataMap map) { ... }
}
```

#### A. Variables intermedias

Los constructores `fromMap` **deben** utilizar variables intermedias para cada campo antes de llamar al constructor del modelo.

```dart
factory AnnouncementDtoModel.fromMap(DataMap map) {
  final id = map['id'] as String? ?? '';
  final title = map['title'] as String? ?? '';

  return AnnouncementDtoModel(id: id, title: title);
}
```

#### B. Manejo defensivo de nulos

Todos los valores extraídos de `map` **deben** manejar posibles nulos. El patrón estándar es el cast con `as Type?` seguido del operador `??` con el valor por defecto.

```dart
factory AnnouncementDtoModel.fromMap(DataMap map) {
  final id = map['id'] as String? ?? '';
  final title = map['title'] as String? ?? '';

  // Lista anidada
  final description =
      (map['description'] as List<dynamic>?)
          ?.map((e) => EventTextDescriptionDtoModel.fromMap(e as DataMap))
          .toList() ??
      [];

  // Objeto anidado nullable
  final photo = map['photoUrl'] != null
      ? MultimediaDtoModel.fromMap(map['photoUrl'] as DataMap)
      : null;

  // DateTime desde String
  final publishedAt =
      DateTime.tryParse(map['publishedAt'] as String? ?? '') ?? DateTime.now();

  return AnnouncementDtoModel(
    id: id,
    title: title,
    description: description,
    photo: photo,
    publishedAt: publishedAt,
  );
}
```

### Constructor factory `fromEntity`

Los modelos que necesiten convertir una entidad del dominio en un modelo de datos (sentido inverso) **deben** tener un constructor `factory` de nombre `fromEntity` que reciba la entidad correspondiente.

```dart
factory AnnouncementDtoModel.fromEntity(Announcement entity) {
  final description = entity.description
      .map(EventTextDescriptionDtoModel.fromEntity)
      .toList();

  final photo = entity.photo != null
      ? MultimediaDtoModel.fromEntity(entity.photo!)
      : null;

  return AnnouncementDtoModel(
    id: entity.id,
    documentId: entity.documentId,
    title: entity.title,
    description: description,
    publishedAt: entity.publishedAt,
    photo: photo,
    startDate: entity.startDate,
    endDate: entity.endDate,
  );
}
```

:::note
`fromEntity` es más común en DTOs cuando el repositorio necesita reenviar datos al Data Source (e.g. operaciones de creación o actualización).
:::

## Métodos

### Método `toMap`

Los Request models **deben** tener un método `toMap` que serialice el modelo en un `Map<String, dynamic>` con las claves que espera la API.

```dart
class ActivateCardRequestModel extends ActivateCardParams {
  Map<String, dynamic> toMap() {
    return {
      'consecutiveNumbers': consecutiveNumbers,
      'lastCardNumbers': lastCardNumbers,
    };
  }
}
```

#### A. Omisión de `toMap`

Los modelos que no necesiten serializar sus datos hacia la API (DTOs de solo lectura, Responses) **deben** omitir el método `toMap`.

### Método `toJson`

Los modelos que requieran serializar a un JSON string **pueden** tener un método `toJson` que llame a `jsonEncode(toMap())`.

```dart
import 'dart:convert';

class ActivateCardRequestModel extends ActivateCardParams {
  Map<String, dynamic> toMap() { ... }

  String toJson() => jsonEncode(toMap());
}
```

#### A. Omisión de `toJson`

Los modelos que no necesiten un JSON string **deben** omitir el método `toJson`.

:::warning
`go_router` requiere que las clases usadas como parámetros de ruta implementen `toJson`. Si el modelo se usa como parámetro de ruta pero no necesita serialización real, se **debe** devolver un mapa vacío para evitar advertencias del compilador, pero esto no es el uso canónico del método.

```dart
// Solo cuando sea requerido por go_router
DataMap toJson() => {};
```
:::

## Estructura de archivos

Los modelos se organizan en subcarpetas dentro de `data/models/` según su tipo. Cada subcarpeta **debe** tener un barrel file que exporte todas las clases del tipo correspondiente. El archivo raíz `models.dart` **debe** exportar todos los barrels.

```
data/
└── models/
    ├── dto/
    │   ├── announcement_dto_model.dart
    │   └── dto.dart
    ├── enums/              ← enums de modelos (ver Enums de modelos)
    │   ├── announcement_text_description_type_model.dart
    │   └── enums.dart
    ├── requests/
    │   ├── activate_card_request_model.dart
    │   └── requests.dart
    ├── responses/
    │   ├── authentication_payload_response_model.dart
    │   └── responses.dart
    └── models.dart
```

:::note
Los enums de modelos tienen sus propias reglas de estructura y nombrado. Consulta [Enums de modelos](./enums) para más detalles.
:::

### Nombrado de archivos

Los archivos de modelos **deben** nombrarse en `snake_case` usando el nombre completo de la clase sin el sufijo `Model`.

```
AnnouncementDtoModel  →  announcement_dto_model.dart
ActivateCardRequestModel  →  activate_card_request_model.dart
AuthenticationPayloadResponseModel  →  authentication_payload_response_model.dart
```

### Barrel files

Cada subcarpeta **debe** tener un barrel file nombrado con el tipo en plural (`dto.dart`, `requests.dart`, `responses.dart`) que exporte todas las clases de ese tipo. El archivo raíz `models.dart` **debe** re-exportar todos los barrels.

```dart title="dto/dto.dart"
export 'announcement_dto_model.dart';
// ... demás DTOs
```

```dart title="models.dart"
export 'dto/dto.dart';
export 'enums/enums.dart';
export 'requests/requests.dart';
export 'responses/responses.dart';
```
