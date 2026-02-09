---
sidebar_position: 3
---

# Capa de datos

La Capa de Datos se encarga de manejar la conexión con los diferentes servicios de datos, normalmente llamadas fuentes de datos (o *data sources*), que proveen información a la capa de dominio, así como de proporcionar una interfaz unificada para acceder a dichos datos.

## Usos frecuentes

- Conexión con APIs o bases de datos.
- Almacenamiento de datos en caché.
- Interfaz de librerías de terceros.

## Estructura del proyecto

La estructura del proyecto de la Capa de Datos se encuentra en la carpeta `data` del proyecto. Dentro de esta carpeta se encuentran los siguientes subdirectorios:


```bash
data/
├── data_sources/
│   ├── foo/
│   ├── bar/
│   └── baz/
│       ├── baz_api.dart # Interfaz del API Baz
│       ├── baz_api_rest.dart # Implementación del API Baz haciendo uso de REST
│       └── baz_api_mock.dart # Implementación mock del API Baz
├── models/
│   ├── enums/
│   │   ├── foo_enum.dart
│   │   └── bar_enum.dart
│   ├── foo_model.dart
│   └── bar_model.dart
└── repositories/
    ├── foo_repository.dart
    └── bar_repository.dart
```

- `data_sources`: Contiene los diferentes servicios de datos que se utilizarán en el proyecto.
- `enums`: Contiene los enumeradores de la capa de datos. Contienen la lógica de serialización y deserialización de sus valores.
- `models`: Contiene los modelos que representan los diferentes tipos de datos.
- `repositories`: Contiene la implementación de la interfaz de repositorios de la capa de dominio.

