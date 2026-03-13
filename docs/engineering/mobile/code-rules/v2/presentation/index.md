---
sidebar_position: 4
---

# Capa de presentación

La Capa de Presentación se encarga de manejar la lógica de presentación de la aplicación. Acá se encuentra todo lo relacionado con los widgets, el manejo de estados y la navegación de la app.

## Componentes clave

- Widgets.
- Estados de la aplicación.
- Blocs de cada feature.

## Estructura del proyecto

La carpeta `presentation/` del proyecto contiene un subdirectorio por cada feature de la aplicación:

```bash
presentation/
├── login/
├── profile/
└── contract_detail/
```

:::note
Cada carpeta corresponde a una vista o pantalla de la aplicación. Dentro de cada carpeta se encuentran todos los archivos del feature: la página, el cuerpo, el bloc y los widgets adicionales, todos enlazados mediante el sistema `part`/`part of` de Dart.
:::

## El sistema `part`/`part of`

Una de las diferencias más importantes respecto a la versión 1 es el uso del sistema de partes de Dart. Todos los archivos de un feature son **partes** (`part`) de un único archivo raíz: `base/feature_page.dart`.

Esto permite que todas las clases internas del feature sean **privadas** (prefijadas con `_`), sin necesidad de exportarlas. Solo la clase `Page` es pública, ya que es el único punto de entrada al feature desde el sistema de rutas.

```dart
// base/login_page.dart — archivo raíz del feature
part 'package:myapp/src/presentation/login/base/login_body.dart';
part 'package:myapp/src/presentation/login/bloc/login_bloc.dart';
part 'package:myapp/src/presentation/login/bloc/login_event.dart';
part 'package:myapp/src/presentation/login/bloc/login_state.dart';
part '../widgets/login_form.dart';

class LoginPage extends StatelessWidget { ... }      // pública
class _LoginView extends StatelessWidget { ... }     // privada
```

```dart
// bloc/login_bloc.dart — es una parte de login_page.dart
part of 'package:myapp/src/presentation/login/base/login_page.dart';

class _LoginBloc extends Bloc<_LoginEvent, _LoginState> { ... }
```
