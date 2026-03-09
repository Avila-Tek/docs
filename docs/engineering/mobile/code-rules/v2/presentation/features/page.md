---
sidebar_position: 2
---

# Page

Este capítulo describe todo lo necesario para elaborar correctamente la clase `Page`, dentro del archivo `base/feature_page.dart`.

## Nombrado

El nombre de la clase `Page` de un feature **debe** estar compuesto por el nombre de éste último seguido del sufijo `Page`, escrito en _PascalCase_.

```dart
/// Feature de iniciar sesión.
class LoginPage {}

/// Feature de perfil.
class ProfilePage {}

/// Feature del detalle de un contrato.
class ContractDetailPage {}
```

:::info
El nombrado de esta clase es generado automáticamente por el `feature_brick_plus`.
:::

## Extensión

La clase `Page` **debe** extender de `StatelessWidget`.

```dart
class LoginPage extends StatelessWidget {}
```

## Constructor

El constructor de la clase `Page` **debe** ser constante.

```dart
class LoginPage extends StatelessWidget {
  const LoginPage({super.key});
}
```

### Parámetros del constructor

Cuando la página requiere parámetros de navegación, **debe** crearse una clase `FeatureNameParams` dentro del mismo archivo que los contenga:

```dart
class LoginParams {
  const LoginParams({
    required this.redirectPath,
    this.isOnboarding = false,
  });

  final String redirectPath;
  final bool isOnboarding;
}

class LoginPage extends StatelessWidget {
  const LoginPage({required this.params, super.key});

  final LoginParams params;
}
```

#### QueryParams

Para parámetros provenientes del query string de la ruta, se **debe** agregar un factory `fromQueryParams` a la clase `Params`:

```dart
class LoginParams {
  const LoginParams({
    required this.redirectPath,
    this.isOnboarding = false,
  });

  final String redirectPath;
  final bool isOnboarding;

  factory LoginParams.fromQueryParams(Map<String, dynamic> queryParams) {
    return LoginParams(
      redirectPath: queryParams['redirect'] ?? '/',
      isOnboarding: queryParams['onboarding'] == 'true',
    );
  }
}
```

## Rutas

Todos los `Pages` **deben** tener sus variables de ruta declaradas, a excepción de los que sean un `Tab` dentro de un `DefaultTabController` o un `Step` dentro de un formulario multipágina.

### Variable `routeName`

Variable estática y constante con el nombre de la ruta en minúsculas. Si tiene varias palabras, se **debe** usar _kebab-case_.

```dart
class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  static const routeName = 'login';
}
```

Si la ruta requiere un identificador:

```dart
class ContractDetailPage extends StatelessWidget {
  const ContractDetailPage({super.key});

  static const routeName = 'contract-detail/:id';
}
```

### Variable `path`

Variable estática y constante con la barra `/` seguida del valor de `routeName`.

```dart
class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  static const routeName = 'login';
  static const path = '/$routeName';
}
```

:::warning
Todos los `Pages` con rutas **deben** tener obligatoriamente las variables `routeName` y `path`.
:::

### Método `buildPath`

Cuando la ruta requiere sustituir parámetros dinámicos, se **debe** crear un método estático `buildPath`:

```dart
class ContractDetailPage extends StatelessWidget {
  const ContractDetailPage({super.key});

  static const routeName = 'contract-detail/:id';
  static const path = '/$routeName';

  static String buildPath(String id) =>
      '/$routeName'.replaceFirst(':id', id);
}
```

## Declaración de `BlocProviders`

El método `build` de la clase `Page` siempre **debe** retornar un `BlocProvider` (o `MultiBlocProvider`), cuyo `child` siempre **debe** ser un `Scaffold`. La única excepción es el uso de `PopScope`.

:::danger
El método `build` de `Page` no **debe** retornar ningún otro widget que no sean los indicados.
:::

### BlocProvider

```dart
class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  static const routeName = 'login';
  static const path = '/$routeName';

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => _LoginBloc(
        loginUseCase: context.read<LoginUseCase>(),
      ),
      child: Scaffold(
        body: _LoginView(),
      ),
    );
  }
}
```

### MultiBlocProvider

Cuando el feature requiere más de un bloc:

```dart
@override
Widget build(BuildContext context) {
  return MultiBlocProvider(
    providers: [
      BlocProvider(
        create: (context) => _LoginBloc(
          loginUseCase: context.read<LoginUseCase>(),
        ),
      ),
      BlocProvider(
        create: (context) => _OtherBloc(),
      ),
    ],
    child: Scaffold(
      body: _LoginView(),
    ),
  );
}
```

### Widget `PopScope`

Si se desea impedir que el usuario regrese a la vista anterior, se **debe** envolver el `BlocProvider` en un `PopScope` con `canPop: false`:

```dart
@override
Widget build(BuildContext context) {
  return PopScope(
    canPop: false,
    child: BlocProvider(
      create: (context) => _LoginBloc(),
      child: Scaffold(
        body: _LoginView(),
      ),
    ),
  );
}
```

## Scaffolding

El `Scaffold` es el widget raíz del feature. Su atributo `body` **debe** ser siempre la clase `_FeatureView`. El resto de propiedades como `appBar`, `floatingActionButton` o `bottomNavigationBar` **pueden** definirse aquí según el diseño del feature.

```dart
child: Scaffold(
  backgroundColor: ColorValues.bgPrimary(context),
  body: _LoginView(),
),
```

:::info
Para más información sobre el widget `Scaffold`, consulta su [documentación oficial](https://api.flutter.dev/flutter/material/Scaffold-class.html).
:::
