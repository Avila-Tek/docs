---
sidebar_position: 1
---

# Features

Este capítulo describe cómo crear, organizar, nombrar y desarrollar los diferentes elementos y clases que hacen vida dentro de un `Feature`.

## Creación

Para la creación de un `feature` se **debe** hacer uso de la plantilla de Mason llamada `feature_brick_plus`, disponible en el paquete de [Avila Tek Flutter Common Library (FCL)](https://github.com/Avila-Tek/flutter_common_lib).

### Comando a ejecutar

```sh
mason make feature_brick_plus -o <dirección-de-la-carpeta-de-presentación>

mason make feature_brick_plus --feature_name <nombre-del-feature> --output-dir <dirección-de-la-carpeta-de-presentación>
```

### Variantes del brick

Al usar `feature_brick_plus`, se **debe** indicar la variante según el tipo de interfaz que se va a construir:

| Variante | Descripción | Documentación |
|---|---|---|
| `default` | Vista estándar. La más común. | [Default](./variantes/default.md) |
| `stepper` | Flujo multipaso con `PageView` programático. | [Stepper](./variantes/stepper.md) |
| `tabbed` | Vista con pestañas mediante `TabBar`. | Próximamente |

:::info
Las páginas de [Page](./page.md), [View](./view.md), [Body](./body.md) y [Bloc](./bloc.md) documentan los elementos comunes a todas las variantes. Consulta la página de cada variante para conocer sus diferencias estructurales.
:::

### Opciones del comando

#### `--output-dir` u `-o`

La ruta dentro del proyecto en donde se creará el `feature`. Si no se indica, el brick se ejecuta en el directorio actual, que **debe** ser la carpeta de presentación del proyecto.

#### `--feature_name`

El nombre del feature. **Debe** cumplir las reglas de nombrado descritas a continuación. Por defecto es `login`.

## Nombrado

El nombre de un `feature` **debe** reflejar claramente la funcionalidad que gestiona, sin ningún sufijo o prefijo. **Debe** estar escrito en singular, aunque **pueden** haber excepciones cuando la funcionalidad es explícitamente plural.

:::info
Si el nombre está compuesto por más de una palabra, **debe** escribirse en **snake_case** al ejecutar el brick.
:::

```
presentation/
├─ login/
├─ profile/
├─ contract_detail/
├─ follow_requests/
```

## Estructura general (variante `default`)

Todos los features generados con la variante `default` **deben** cumplir con la siguiente estructura:

```
feature/
├─ base/
│  ├─ feature_page.dart
│  └─ feature_body.dart
├─ bloc/
│  ├─ feature_bloc.dart
│  ├─ feature_event.dart
│  └─ feature_state.dart
├─ widgets/
│  └─ (archivos de widgets adicionales)
└─ feature.dart
```

:::info
Los nombres de carpetas y archivos que contienen la palabra `feature` **deben** ser sustituidos por el nombre del feature:

```
login/
├─ base/
│  ├─ login_page.dart
│  └─ login_body.dart
├─ bloc/
│  ├─ login_bloc.dart
│  ├─ login_event.dart
│  └─ login_state.dart
├─ widgets/
└─ login.dart
```
:::

## El sistema `part`/`part of`

Todos los archivos del feature son **partes** de `base/feature_page.dart`. Esto permite que las clases internas sean privadas y accedan entre sí sin necesidad de exportaciones explícitas.

### Archivo raíz: `base/feature_page.dart`

Este archivo declara todas las partes del feature al inicio del archivo, antes de cualquier clase:

```dart
import 'package:myapp/core/foundation.dart';
import 'package:myapp/core/ui.dart';
// ... otras importaciones

part 'package:myapp/src/presentation/login/base/login_body.dart';
part 'package:myapp/src/presentation/login/bloc/login_bloc.dart';
part 'package:myapp/src/presentation/login/bloc/login_event.dart';
part 'package:myapp/src/presentation/login/bloc/login_state.dart';
part '../widgets/login_form.dart';

class LoginPage extends StatelessWidget { ... }
class _LoginView extends StatelessWidget { ... }
```

### Archivos parte

Cada archivo parte declara a qué archivo raíz pertenece en su primera línea:

```dart
// bloc/login_bloc.dart
part of 'package:myapp/src/presentation/login/base/login_page.dart';

class _LoginBloc extends Bloc<_LoginEvent, _LoginState> { ... }
```

### Visibilidad de clases

| Clase | Accesibilidad |
|---|---|
| `FeaturePage` | Pública — punto de entrada al feature |
| `_FeatureView` | Privada — accesible solo dentro del feature |
| `_FeatureBody` | Privada — accesible solo dentro del feature |
| `_FeatureBloc` | Privada — accesible solo dentro del feature |
| `_FeatureEvent` | Privada — accesible solo dentro del feature |
| `_FeatureState` | Privada — accesible solo dentro del feature |
| `_FeatureStatus` | Privada — accesible solo dentro del feature |

## Carpeta `base/`

Contiene los dos archivos principales del feature:

### `base/feature_page.dart`

Archivo raíz de la librería. Contiene:
- Todas las declaraciones `part` del feature.
- La clase pública `FeaturePage`.
- La clase privada `_FeatureView`.

### `base/feature_body.dart`

Parte del archivo raíz. Contiene la clase privada `_FeatureBody`, que es el widget principal de la interfaz.

## Carpeta `bloc/`

Contiene los archivos del bloc del feature, todos declarados como partes del archivo raíz. **No** existe un archivo barril `bloc.dart` en v2.

### `bloc/feature_bloc.dart`

Siempre presente. Contiene `_FeatureBloc`, que puede extender de cuatro tipos según la naturaleza del feature:

| Tipo | Descripción |
|---|---|
| `Bloc<_Event, _State>` | Estado de UI puro, sin operaciones de red |
| `SendDataBloc<T>` | Enviar o mutar datos (POST, PUT, DELETE) |
| `RemoteDataBloc<T>` | Obtener un único recurso remoto |
| `PagedRemoteDataBloc<T>` | Obtener listas paginadas |

Los tipos de la FCL (`SendDataBloc`, `RemoteDataBloc`, `PagedRemoteDataBloc`) ya proveen sus propios eventos y estados, por lo que los archivos `feature_event.dart` y `feature_state.dart` solo son necesarios cuando se usa `Bloc<_Event, _State>`.

:::info
Para más información sobre cada tipo de bloc, consulta el capítulo [Bloc](./bloc.md) de esta sección.
:::

### `bloc/feature_event.dart`

Define los eventos del bloc (`_FeatureEvent` y sus subclases). **Solo se requiere** cuando el bloc extiende `Bloc<_Event, _State>` directamente.

### `bloc/feature_state.dart`

Define `_FeatureStatus` (enum de estados) y `_FeatureState` (clase de estado inmutable). **Solo se requiere** cuando el bloc extiende `Bloc<_Event, _State>` directamente.

## Carpeta `widgets/`

Contiene los archivos de widgets adicionales del feature. Cada archivo **debe** ser declarado como parte del archivo raíz. **No** existe un archivo barril `widgets.dart` en v2.

:::warning
Al extraer widgets a archivos separados, evalúa si el widget será reutilizado en otros features. Si es así, **debe** crearse en la carpeta `core/widgets/` en lugar de aquí.
:::

## Archivo `feature.dart`

Archivo de barril en la raíz del feature. Exporta únicamente `base/feature_page.dart`:

```dart
// login/login.dart
export 'base/login_page.dart';
```

Esto expone solo la clase pública `LoginPage` hacia el resto de la aplicación.
