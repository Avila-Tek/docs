---
sidebar_position: 3
---

# Capa de datos

La Capa de Datos es el punto de contacto entre las fuentes de datos externas (APIs, bases de datos, servicios de terceros) y la capa de dominio. Su responsabilidad es obtener, transformar y entregar datos al dominio de forma desacoplada de los detalles de implementación externos.

El hilo conductor de toda la capa es el patrón `Result<T, E>` del paquete [`afp`](https://github.com/Avila-Tek/flutter_common_lib/tree/main/packages/afp): cada operación retorna explícitamente un éxito (`Success`) o un fallo (`Failure`), eliminando el uso de excepciones como mecanismo de control de flujo.

## Componentes

| Componente | Responsabilidad |
|---|---|
| [**Modelos**](./models) | Representan los datos en el formato de la fuente externa. Se dividen en DTOs (lectura/escritura completa), Request Models (parámetros de escritura) y Response Models (respuestas de lectura). |
| [**Enumeraciones**](./enums) | Convierten valores *raw* de la API en enums de Dart tipados. Implementan `BaseEnum<E, T>` e incluyen lógica de serialización y deserialización. |
| [**Data Sources**](./data-sources) | Encapsulan la comunicación con servicios externos. Definen una interfaz (`IXxxApi`) y una o más implementaciones (`XxxApiRest`, `XxxApiGraphQL`). Retornan `Result<T, ServerError>`. |
| [**Repositorios**](./repositories) | Median entre el dominio y los Data Sources. Traducen parámetros del dominio, invocan el Data Source y mapean `ServerError` → `AppError`. Retornan `Result<T, AppError>`. |

## Estructura de carpetas

```bash
data/
├── data_sources/
│   └── foo_api/
│       ├── foo_api.dart                      # Interfaz
│       ├── foo_api_rest.dart                 # Implementación REST
│       └── foo_api_rest_endpoints.dart       # Endpoints
├── enums/
│   └── foo_type_enum.dart
├── models/
│   ├── dto/
│   │   └── foo_dto.dart
│   ├── requests/
│   │   └── create_foo_request_model.dart
│   └── responses/
│       └── foo_response_model.dart
└── repositories/
    ├── foo_repository.dart
    └── repositories.dart                     # Barrel file
```

:::note
Cada subcarpeta debe tener su propio barrel file que exporte todos sus elementos. El barrel file raíz de la capa (`data.dart`) debe re-exportar los barrel files de cada subcarpeta.
:::