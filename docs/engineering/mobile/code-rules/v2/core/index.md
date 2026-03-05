---
sidebar_position: 1
---

# Capa de core

`lib/core/` es la capa de infraestructura compartida de la aplicación: **feature-agnostic**, estable y reutilizable. Todos los módulos de `lib/src/` dependen de ella, pero nunca al revés.

El principio rector del core es la **estabilidad**: el código que vive aquí es usado por todos los features. Un cambio en el core puede afectar toda la aplicación, por lo que sus abstracciones deben ser cuidadosamente diseñadas.

## Barrel files

El core expone dos puntos de entrada según la capa que los consuma:

| Archivo | Propósito |
|---|---|
| `foundation.dart` | Re-exporta librerías de Dart (`dart:async`, `dart:io`, etc.) y paquetes base (`bloc`, `equatable`, `rxdart`). Punto de entrada para la **capa de dominio e infraestructura**. |
| `ui.dart` | Re-exporta todo lo de `foundation.dart` más componentes de UI: Material, `go_router`, `flutter_animate`, `flutter_bloc`, tema y widgets del core. Punto de entrada para la **capa de presentación**. |

```dart
// En la capa de dominio o datos
import 'package:app/core/foundation.dart';

// En la capa de presentación (BLoCs de UI, widgets)
import 'package:app/core/ui.dart';
```

:::warning
Nunca importes `ui.dart` desde la capa de dominio. Las dependencias de Flutter no deben contaminar el dominio puro.
:::

## Componentes

| Componente | Responsabilidad |
|---|---|
| [**Adapters**](./adapters.md) | Abstracciones sobre plugins y dependencias externas. Desacoplan el resto de la app de los paquetes concretos. |
| [**BLoCs compartidos**](./blocs.md) | BLoCs de estado global inyectados en el árbol raíz y consumidos desde cualquier feature. |
| [**Enums**](./enums.md) | Enumeraciones compartidas por toda la app (estados async, permisos, tipos HTTP). |
| [**Extensiones**](./extensions.md) | Métodos de extensión sobre tipos de Dart y Flutter (`BuildContext`, `String`, `num`, etc.). |
| [**Interfaces**](./interfaces.md) | Contratos abstractos para las capas de la arquitectura (`UseCase`, `BaseEnum`). |
| [**Keys**](./keys.md) | Constantes centralizadas para claves de entorno y almacenamiento local. |
| [**Types**](./types.md) | Implementaciones concretas de los estados async (`FetchAsyncState`, `SendAsyncState`, `ReloadAsyncState`). |
| [**Typedefs**](./typedefs.md) | Aliases de tipo (`DataMap`, etc.) para mejorar legibilidad. |
| [**Utils**](./utils.md) | Cliente HTTP, interceptors, formatters y utilidades stateless. |
| [**Validadores**](./validators.md) | Validadores de campos de formulario basados en `FormField<T, Result<void, E>>`. |
| [**Widgets**](./widgets.md) | Building blocks de UI reutilizables organizados por categoría. |

## Estructura de carpetas

```
lib/
└── core/
    ├── adapters/
    ├── blocs/
    ├── enums/
    ├── extensions/
    ├── interfaces/
    ├── keys/
    ├── permissions/
    ├── theme/
    ├── typedefs/
    ├── types/
    ├── utils/
    ├── validators/
    ├── variables/
    ├── widgets/
    ├── foundation.dart   # Barrel file — dominio e infraestructura
    └── ui.dart           # Barrel file — presentación
```