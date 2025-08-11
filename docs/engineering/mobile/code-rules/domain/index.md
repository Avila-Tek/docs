---
sidebar_position: 2
---

# Capa de dominio

La Capa de Dominio se encarga de manejar la lógica de negocio de la aplicación. Esta capa es el núcleo del proyecto y contiene todas las clases y funciones que representan la lógica de negocio de la aplicación.

## Componentes clave

- Lógica de negocio (casos de uso).
- Entidades y enumeradores de dominio.
- Validación de datos.
- Interfaces de repositorios.

## Estructura del proyecto

La estructura del proyecto de la Capa de Dominio se encuentra en la carpeta `domain` del proyecto. Dentro de esta carpeta se encuentran los siguientes subdirectorios:

```bash
domain/
├── entities/
│   ├──enums/
│   │   ├── foo_enum.dart
│   │   └── bar_enum.dart
│   ├── foo.dart
│   └── bar.dart
├── repositories/
│   ├── foo_repository.dart # Interfaz de repositorio Foo
│   └── bar_repository.dart
├── use_cases/
│   ├── foo/
│   └── bar/
│       ├── get_bar.dart
│       ├── update_bar.dart
│       └── delete_bar.dart
└── validators/
    ├── foo_validator.dart
    └── bar_validator.dart
```

- `entities`: Son las entidades de la capa de dominio. Son las unidades básicas de la aplicación.
- `enums`: Contiene los enumeradores de la capa de dominio. Se consideran también entidades.
- `repositories`: Contiene las interfaces de los repositorios.
- `validators`: Contiene los validadores de campos considerados parte de las reglas de negocio. Ejemplos de validadores son: Validadores de correo electrónico y contraseñas, validadores de formato de fecha, o validadores de otros campos. 