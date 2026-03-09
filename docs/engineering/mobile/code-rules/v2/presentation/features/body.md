---
sidebar_position: 4
---

# Body

Este capítulo describe todo lo necesario para elaborar correctamente la clase `Body`, dentro del archivo `base/feature_body.dart`.

## Nombrado

El nombre de la clase `Body` de un feature **debe** estar compuesto por el nombre de éste último, seguido del sufijo `Body`, escrito en _PascalCase_, y **debe** ser **privado** (prefijo `_`).

```dart
class _LoginBody extends StatelessWidget {}
class _ProfileBody extends StatelessWidget {}
class _ContractDetailBody extends StatelessWidget {}
```

:::info
El nombrado y la visibilidad privada de esta clase son generados automáticamente por el `feature_brick_plus`.
:::

## Extensión

El `Body` **debe** extender de `StatelessWidget` siempre que sea posible. Si se requiere el uso de mixins como `AutomaticKeepAliveClientMixin`, `TickerProviderStateMixin` o similares, puede extender de `StatefulWidget`.

## Constructor

El constructor de la clase `Body` **debe** ser constante y no **debe** recibir parámetros.

```dart
class _LoginBody extends StatelessWidget {
  const _LoginBody();
}
```

:::info
A diferencia del v1, en v2 el `Body` no necesita parámetros en el constructor porque al ser parte de la misma librería que el bloc, puede acceder al `BuildContext` para leer el estado directamente.
:::

## Ubicación

La clase `_FeatureBody` se declara en `base/feature_body.dart`, que es una parte de `base/feature_page.dart`. Al ser privada, solo es accesible dentro de la librería del feature.

## Lectura de estado

Al formar parte de la misma librería del bloc, el `Body` puede leer el estado directamente mediante `BlocBuilder`:

```dart
class _LoginBody extends StatelessWidget {
  const _LoginBody();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<_LoginBloc, _LoginState>(
      buildWhen: (previous, current) =>
          previous.status != current.status,
      builder: (context, state) {
        // Construir la UI según el estado.
        return const SizedBox.shrink();
      },
    );
  }
}
```

## Widgets adicionales

Cuando la complejidad del feature lo requiere, los elementos de la interfaz **pueden** separarse en archivos adicionales dentro de la carpeta `widgets/`. Cada archivo **debe** declararse como parte del archivo raíz:

```dart
// widgets/login_form.dart
part of 'package:myapp/src/presentation/login/base/login_page.dart';

class _LoginForm extends StatelessWidget {
  const _LoginForm();

  @override
  Widget build(BuildContext context) { ... }
}
```

Y declararse en el archivo raíz:

```dart
// base/login_page.dart
part '../widgets/login_form.dart';
```

:::warning
Antes de crear un widget en la carpeta `widgets/` del feature, evalúa si puede ser reutilizado en otro feature. Si la respuesta es sí, **debe** crearse en `core/widgets/` en su lugar.
:::
