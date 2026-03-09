---
sidebar_position: 3
---

# Tabbed

La variante `tabbed` del `feature_brick_plus` genera la estructura necesaria para pantallas con múltiples secciones de contenido en paralelo, navegadas mediante un `TabBar`. Es ideal para perfiles de usuario con varias vistas, dashboards con secciones independientes, o cualquier pantalla donde el usuario selecciona libremente entre pestañas.

## Cuándo usar esta variante

Usa `tabbed` cuando la pantalla presente varias secciones de contenido **en paralelo** (no secuenciales), donde el usuario navega entre ellas libremente con un tap. A diferencia del `stepper`, aquí no hay un orden forzado ni avance programático — el `TabController` gestiona la navegación directamente, sin pasar por el bloc.

## Estructura de archivos

```
feature/
├── base/
│   ├── feature_page.dart      ← FeaturePage (StatefulWidget) + _FeaturePageState + _FeatureView
│   └── feature_body.dart      ← _FeatureBody (recibe TabController)
├── bloc/
│   ├── feature_bloc.dart      ← _FeatureBloc (mínimo; la navegación no pasa por aquí)
│   ├── feature_event.dart     ← eventos personalizados del feature
│   └── feature_state.dart     ← _FeatureState (eliminar _FeatureStatus, ver aviso)
├── tabs/
│   ├── tab1/
│   │   ├── base/
│   │   │   ├── tab1_page.dart   ← _Tab1Page + _Tab1View
│   │   │   └── tab1_body.dart   ← _Tab1Body
│   │   ├── bloc/
│   │   │   ├── tab1_bloc.dart
│   │   │   ├── tab1_event.dart
│   │   │   └── tab1_state.dart
│   │   └── widgets/
│   └── tab2/                    (estructura idéntica a tab1)
│       ├── base/
│       ├── bloc/
│       └── widgets/
├── widgets/
│   └── (widgets compartidos del feature)
└── feature.dart                 ← export 'base/feature_page.dart';
```

:::info
Reemplaza `feature` por el nombre real del feature y `tab1`, `tab2` por nombres descriptivos del contenido de cada pestaña (`profileTab`, `postsTab`, `settingsTab`, etc.).
:::

## Sistema `part`/`part of`

Al igual que en las otras variantes, todos los archivos son partes de `base/feature_page.dart`. Esto incluye **todos los archivos de cada tab**, formando una única librería Dart privada.

### Declaraciones `part` en `base/feature_page.dart`

```dart
import 'package:myapp/core/foundation.dart';
import 'package:myapp/core/ui.dart';
// ... otras importaciones

// Base
part 'package:myapp/src/presentation/profile/base/profile_body.dart';

// Bloc raíz
part 'package:myapp/src/presentation/profile/bloc/profile_bloc.dart';
part 'package:myapp/src/presentation/profile/bloc/profile_event.dart';
part 'package:myapp/src/presentation/profile/bloc/profile_state.dart';

// Tab 1 — Posts
part 'package:myapp/src/presentation/profile/tabs/posts_tab/base/posts_tab_page.dart';
part 'package:myapp/src/presentation/profile/tabs/posts_tab/base/posts_tab_body.dart';
part 'package:myapp/src/presentation/profile/tabs/posts_tab/bloc/posts_tab_bloc.dart';
part 'package:myapp/src/presentation/profile/tabs/posts_tab/bloc/posts_tab_event.dart';
part 'package:myapp/src/presentation/profile/tabs/posts_tab/bloc/posts_tab_state.dart';

// Tab 2 — Followers
part 'package:myapp/src/presentation/profile/tabs/followers_tab/base/followers_tab_page.dart';
part 'package:myapp/src/presentation/profile/tabs/followers_tab/base/followers_tab_body.dart';
part 'package:myapp/src/presentation/profile/tabs/followers_tab/bloc/followers_tab_bloc.dart';
part 'package:myapp/src/presentation/profile/tabs/followers_tab/bloc/followers_tab_event.dart';
part 'package:myapp/src/presentation/profile/tabs/followers_tab/bloc/followers_tab_state.dart';

class ProfilePage extends StatefulWidget { ... }
class _ProfilePageState extends State<ProfilePage>
    with SingleTickerProviderStateMixin { ... }
class _ProfileView extends StatelessWidget { ... }
```

Cada archivo de tab declara su pertenencia a la librería raíz en su primera línea:

```dart
// tabs/posts_tab/base/posts_tab_page.dart
part of 'package:myapp/src/presentation/profile/base/profile_page.dart';

class _PostsTabPage extends StatelessWidget { ... }
```

## `FeaturePage` — `StatefulWidget`

**Diferencia clave respecto a `default` y `stepper`:** `FeaturePage` extiende `StatefulWidget` en lugar de `StatelessWidget`. Esto es necesario para gestionar el ciclo de vida del `TabController`.

`_FeaturePageState` incorpora el mixin `SingleTickerProviderStateMixin`, que provee el `vsync` requerido por el `TabController`.

```dart
class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  static const path = '/$routeName';
  static const routeName = 'profile';

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage>
    with SingleTickerProviderStateMixin {

  // Define las pestañas como constante estática en el State
  static const List<Tab> myTabs = <Tab>[
    Tab(text: 'Posts'),
    Tab(text: 'Seguidores'),
  ];

  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      vsync: this, // SingleTickerProviderStateMixin provee esto
      length: myTabs.length,
    );
  }

  @override
  void dispose() {
    _tabController.dispose(); // Siempre liberar el TabController
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => _ProfileBloc(),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Perfil'),
          bottom: TabBar(
            tabs: myTabs,
            controller: _tabController,
          ),
        ),
        body: _ProfileView(tabController: _tabController),
      ),
    );
  }
}
```

:::note
En esta variante, `BlocProvider` y `Scaffold` viven dentro del `build()` del State, no en una clase `Page` y `View` separadas como en `default`. `_FeatureView` se usa únicamente para delegar al `_FeatureBody`.
:::

## `_FeatureView` — recibe `TabController`

A diferencia de `default` y `stepper`, `_FeatureView` recibe el `TabController` como parámetro requerido y lo pasa al `_FeatureBody`.

```dart
class _ProfileView extends StatelessWidget {
  const _ProfileView({required TabController tabController})
      : _tabController = tabController;

  final TabController _tabController;

  @override
  Widget build(BuildContext context) {
    return _ProfileBody(tabController: _tabController);
  }
}
```

## `_FeatureBody` — `TabBarView`

`_FeatureBody` también recibe el `TabController` y lo usa para controlar el `TabBarView`. El contenido de cada pestaña lo provee el `_TabPage` correspondiente.

```dart
class _ProfileBody extends StatelessWidget {
  const _ProfileBody({required TabController tabController})
      : _tabController = tabController;

  final TabController _tabController;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<_ProfileBloc, _ProfileState>(
      builder: (context, state) {
        return TabBarView(
          controller: _tabController,
          children: const [
            _PostsTabPage(),
            _FollowersTabPage(),
          ],
        );
      },
    );
  }
}
```

:::info
A diferencia del `stepper`, no se usa `PageView` ni `NeverScrollableScrollPhysics`. El `TabBarView` con su `TabController` gestiona el deslizamiento y la sincronización con el `TabBar` automáticamente.
:::

## Bloc raíz (`_FeatureBloc`)

El bloc raíz en la variante `tabbed` es mínimo. La navegación entre tabs la gestiona el `TabController` directamente — **no** se emiten eventos para cambiar de pestaña.

```dart
class _ProfileBloc extends Bloc<_ProfileEvent, _ProfileState> {
  _ProfileBloc() : super(const _ProfileState());

  // Añade aquí handlers para operaciones propias del feature (carga de datos del perfil, etc.)
  // No se necesitan handlers para navegar entre tabs
}
```

:::warning
El brick genera un enum `_FeatureStatus` en `feature_state.dart`. **Debe eliminarse** ya que no es compatible con los patrones v2. Si necesitas estado asíncrono, usa `FetchAsyncState<T, E>` como campo del `_FeatureState`. Consulta la página [Bloc](../bloc.md#bloc-personalizado-_bloc_event-_state) para más detalles.
:::

## Tabs — mini-features

Cada tab en `tabs/tab1/`, `tabs/tab2/`, etc. es un mini-feature con su propia estructura de `Page`, `View`, `Body` y `Bloc`. Siguen los mismos patrones que los steps del `stepper`, con las siguientes características:

- **Sin rutas propias**: los tabs no son páginas navegables. Solo se renderizan dentro del `TabBarView`.
- **Sin parámetros externos**: `_Tab1Page` no recibe parámetros del exterior; el `TabController` lo gestiona el `_FeatureBody`.
- **Bloc propio**: cada tab tiene su `_Tab1Bloc` independiente, provisto por un `BlocProvider` local dentro de `_Tab1Page`.
- **Acceso al bloc raíz**: si un tab necesita disparar eventos del bloc raíz, usa `context.read<_FeatureBloc>()`.

### `_Tab1Page` y `_Tab1View`

```dart
// tabs/posts_tab/base/posts_tab_page.dart
part of 'package:myapp/src/presentation/profile/base/profile_page.dart';

class _PostsTabPage extends StatelessWidget {
  const _PostsTabPage();

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => _PostsTabBloc(),
      child: const _PostsTabView(),
    );
  }
}

class _PostsTabView extends StatelessWidget {
  const _PostsTabView();

  @override
  Widget build(BuildContext context) {
    return const _PostsTabBody();
  }
}
```

### `_Tab1Body`

```dart
// tabs/posts_tab/base/posts_tab_body.dart
part of 'package:myapp/src/presentation/profile/base/profile_page.dart';

class _PostsTabBody extends StatelessWidget {
  const _PostsTabBody();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<_PostsTabBloc, _PostsTabState>(
      builder: (context, state) {
        // Interfaz del tab: lista de posts, estado de carga, etc.
        return const Center(child: Text('Posts'));
      },
    );
  }
}
```

### Bloc del tab

El bloc de cada tab sigue los mismos patrones del [Bloc](../bloc.md) general:

```dart
// tabs/posts_tab/bloc/posts_tab_bloc.dart
part of 'package:myapp/src/presentation/profile/base/profile_page.dart';

// Opción A: estado puro con FetchAsyncState
class _PostsTabBloc extends Bloc<_PostsTabEvent, _PostsTabState> {
  _PostsTabBloc() : super(const _PostsTabState()) {
    on<_FetchPosts>(_onFetchPosts);
  }

  Future<void> _onFetchPosts(
    _FetchPosts event,
    Emitter<_PostsTabState> emit,
  ) async {
    emit(state.copyWith(posts: const AsyncLoading()));
    final result = await _repo.getPosts();
    result.resolve(
      onSuccess: (posts) => emit(state.copyWith(posts: AsyncData(posts))),
      onFailure: (error) => emit(state.copyWith(posts: AsyncError(error))),
    );
  }
}

// Opción B: RemoteDataBloc<T> si el tab solo muestra un recurso remoto
class _FollowersTabBloc extends RemoteDataBloc<List<User>> {
  @override
  Future<Result<List<User>, AppError>> fetchAndParseData() =>
      _repo.getFollowers();
}
```

## Comparativa con otras variantes

| Aspecto | Default | Stepper | Tabbed |
|---|---|---|---|
| `FeaturePage` base | `StatelessWidget` | `StatelessWidget` | `StatefulWidget` |
| Mixin | — | — | `SingleTickerProviderStateMixin` |
| `_FeatureView` | Privada | Pública | Privada (recibe `TabController`) |
| Body `const` | Sí | No | Sí (usualmente) |
| Widget de navegación | — | `PageView` | `TabBarView` |
| Navegación interna | Router | Eventos Bloc (`NextStep`/`PreviousStep`) | Usuario (tap en `TabBar`) |
| Archivo extra en `bloc/` | — | `feature_step.dart` | — |
| Subcarpeta de subelementos | — | `steps/` | `tabs/` |
| `_FeatureView` pública | No | Sí | No |
| Cuándo usarlo | Vista estándar | Flujo multipaso | Secciones paralelas |
