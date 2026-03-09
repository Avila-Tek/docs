---
sidebar_position: 3
---

# View

Este capítulo describe todo lo necesario para elaborar correctamente la clase `View`, dentro del archivo `base/feature_page.dart`.

## Nombrado

El nombre de la clase `View` de un feature **debe** estar compuesto por el nombre de éste último, seguido del sufijo `View`, escrito en _PascalCase_, y **debe** ser **privado** (prefijo `_`).

```dart
class _LoginView extends StatelessWidget {}
class _ProfileView extends StatelessWidget {}
class _ContractDetailView extends StatelessWidget {}
```

:::info
El nombrado y la visibilidad privada de esta clase son generados automáticamente por el `feature_brick_plus`.
:::

## Extensión

La clase `View` **debe** extender de `StatelessWidget`.

```dart
class _LoginView extends StatelessWidget {}
```

## Constructor

El constructor de la clase `View` **debe** ser constante y no **debe** recibir parámetros.

```dart
class _LoginView extends StatelessWidget {
  const _LoginView();
}
```

## Ubicación

La clase `_FeatureView` se declara en el mismo archivo que la clase `FeaturePage`: `base/feature_page.dart`. Al ser privada, solo es accesible dentro de la librería del feature.

## Declaración de `BlocListeners`

El método `build` de la clase `View` solo **puede** retornar dos widgets: el `_Body` del feature o un `BlocListener`.

El `BlocListener` tiene la finalidad de:
- Reaccionar a cambios de estado del feature (mostrar loaders, dialogs, snackbars).
- Navegar hacia otras vistas.
- Comunicar eventos entre blocs.

:::warning
Cada `BlocListener` **debe** escuchar una única propiedad del `State` a la vez. Por ello, se **debe** implementar siempre la propiedad `listenWhen`, verificando los cambios de esa propiedad. Si se necesitan escuchar múltiples propiedades con acciones distintas, cada una **debe** tener su propio `BlocListener`.
:::

### BlocListener

```dart
class _LoginView extends StatelessWidget {
  const _LoginView();

  @override
  Widget build(BuildContext context) {
    return BlocListener<_LoginBloc, _LoginState>(
      listenWhen: (previous, current) =>
          previous.status != current.status,
      listener: (context, state) {
        if (state.status.isLoading) {
          LoadingDialog.show(context);
        }
        if (state.status.isFailure) {
          LoadingDialog.hide(context);
          // Mostrar error al usuario.
        }
        if (state.status.isSuccess) {
          LoadingDialog.hide(context);
          context.go(HomePage.path);
        }
      },
      child: const _LoginBody(),
    );
  }
}
```

### MultiBlocListener

Cuando se necesitan escuchar múltiples propiedades o blocs al mismo tiempo:

```dart
class _LoginView extends StatelessWidget {
  const _LoginView();

  @override
  Widget build(BuildContext context) {
    return MultiBlocListener(
      listeners: [
        BlocListener<_LoginBloc, _LoginState>(
          listenWhen: (previous, current) =>
              previous.submitStatus != current.submitStatus,
          listener: (context, state) {
            // Acciones para el estado de envío.
          },
        ),
        BlocListener<_LoginBloc, _LoginState>(
          listenWhen: (previous, current) =>
              previous.validationStatus != current.validationStatus,
          listener: (context, state) {
            // Acciones para el estado de validación.
          },
        ),
      ],
      child: const _LoginBody(),
    );
  }
}
```

### Body

La propiedad `child` del `BlocListener` siempre **debe** ser el `_Body` del feature.

## Comunicación entre Blocs

Cuando un evento de un bloc debe dispararse como consecuencia del estado de otro bloc, el puente de conexión **debe** ser un `BlocListener` en el `View`:

```dart
BlocListener<_LoginBloc, _LoginState>(
  listenWhen: (previous, current) =>
      previous.status != current.status,
  listener: (context, state) {
    if (state.status.isSuccess) {
      context.read<UserBloc>().add(const UserSessionStarted());
    }
  },
  child: const _LoginBody(),
),
```

## Layouts responsivos

Si la aplicación se ejecuta en tablets y el diseño varía según el tamaño de pantalla, se **debe** usar un `LayoutBuilder` como `child` del `BlocListener`:

```dart
child: LayoutBuilder(
  builder: (context, constraints) {
    if (constraints.maxWidth >= 600) {
      return const _LoginTabletBody();
    }
    return const _LoginBody();
  },
),
```
