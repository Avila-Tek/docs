# View

Este capítulo describe todo lo necesario para elaborar correctamente la clase `View`, dentro del archivo `view/feature_page.dart`.

## Nombrado

El nombre de la clase `View` de un `feature` **debe** estar compuesto por el nombre de éste último, seguido del sufijo `View`, escrito con el estilo _PascalCase_.

```dart
/// Para el feature de iniciar sesión.
class LoginView {}

/// Para el feature de un perfil.
class ProfileView {}

/// Para el feature del detalle de un contrato.
class ContractDetailView {}
```

:::info
El nombrado de ésta clase es generado automáticamente por el `feature_brick`.
:::

## Extensión

La clase `View` **debe** extender de la clase abstracta `StatelesWidget`.

```dart
/// Para cualquier feature.
class FeatureNameView extends StatelessWidget {}
```

## Constructor

El constructor de la clase `View` **debe** ser constante, y no **debe** recibir ningún parámetro.

```dart
class FeatureNameView extends StatelessWidget {
    const FeatureNameView({super.key});
}
```

## Declaración de `BlocListeners`

El método `build` de la clase `View` sólo **puede** retornar dos widgets: el `Body` del `feature` o un `BlocListener`. Éste último tiene la finalidad de servir como puente de comunicación entre diferentes `blocs`, de reaccionar a los cambios de estado del `feature` y de navegar hacia otras vistas.

:::warning
Todos los `BlocListeners` **deben** cumplir un principio de singularidad, en donde cada `Listener` está a la escucha de una única propiedad del `State` a la vez. Por ésta razón se **debe** implementar la propiedad `listenWhen`, verificando los cambios de la propiedad a escuchar. Ésto significa que si se quieren escuchar múltiples propiedades al mismo tiempo y en la cual cada una responde en su accionar de distanta forma, éstas deben estar en `BlocListeners` separados.
:::

### BlocListener

Cuando se necesita únicamente un `Listener`, se **debe** declarar un `BlocListener`, con su `listenWhen` y las respectivas acciones a implementar en el `listener`.

```dart
/// Para el feature de Login.
class LoginView extends StatelessWidget {
    const LoginView({super.key});

    @override
    Widget build(BuildContext context) {
        /// Se retorna un BlocListener en métod build del View.
        return BlocListener<LoginBloc, LoginState>(
            /// Se declara un listenWhen que sólo responde ante los
            /// cambios del status del LoginState.
            listenWhen: (previous, current) => previous.status != current.status,
            /// En el listener se definen todas las acciones a realizar
            /// cada vez que el status sea modificado.
            listener: (context, state) {
                /// Aquí se hacen todas las implementaciones necesarias
                /// como manejo de estados, loaders, dialogs, snackbars, navegaciones,
                /// comunicaciones entre blocs, entre otros.
            },
            /// El child siempre debe ser el Body del feature.
            child: const LoginBody(),
            );
    }
}
```

<details>
  <summary>Ejemplo más detallado</summary>

```dart
/// Para el feature de Login.
class LoginView extends StatelessWidget {
    const LoginView({super.key});

    @override
    Widget build(BuildContext context) {
        /// Se retorna un BlocListener en métod build del View.
        return BlocListener<LoginBloc, LoginState>(
            /// Se declara un listenWhen que sólo responde ante los
            /// cambios del status del LoginState.
            listenWhen: (previous, current) => previous.status != current.status,
            /// En el listener se definen todas las acciones a realizar
            /// cada vez que el status sea modificado.
            listener: (context, state) {
                if (state.status.isLoading) {
                    /// Si el status es loading, entonces muestra un loader
                    LoadingDialog.show(context);
                }
                if (state.status.isFailure) {
                    /// Si ocurre un fallo, oculta el loader y muestra un
                    /// un dialog indicándole al usuario la falla ocurrida.
                    LoadingDialog.hide(context);

                    showDialog(
                        context: context,
                        builder: (context) => CustomDialog(
                        type: DialogType.warning,
                        title: Text(S.of(context).appName),
                        content: Text(state.errorMessage),
                        actions: [
                            DialogAction(
                            isPrimaryAction: true,
                            child: Text(S.of(context).acceptButton),
                            ),
                        ],
                        ),
                    );
                }
                if (state.status.isSuccess) {
                    /// Si el status es exitoso, oculta el loader y
                    /// navega hacia el home de la app.
                    LoadingDialog.hide(context);
                    context.goNamed(HomePage.routeName);
                }
            },
            /// El child siempre debe ser el Body del feature.
            child: const LoginBody(),
            );
    }
}
```

</details>

### MultiBlocListener

Cuando se necesitan múltiples `Listener`, se **debe** hacer uso de un `MultiBlocListener`, cuya propiedad `listeners` contendrá la lista de los `BlocListeners` con sus respectivas implementaciones.

```dart
class LoginView extends StatelessWidget {
  const LoginView({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocListener(
      listeners: [
        BlocListener<LoginBloc, LoginState>(
          listenWhen: (previous, current) =>
              previous.submitStatus != current.submitStatus,
          listener: (context, state) {
            /// Acciones a implementar.
          },
        ),
        /// Un mismo Bloc puede tener múltiples BlocListener.
        BlocListener<LoginBloc, LoginState>(
          listenWhen: (previous, current) =>
              previous.requestStatus != current.requestStatus,
          listener: (context, state) {
          },
        ),
        /// Y pueden haber otros Blocs que no sean el mismo del feature.
        BlocListener<OtherBloc, OtherState>(
          listenWhen: (previous, current) =>
              previous.status != current.status,
          listener: (context, state) {
            /// Acciones a implementar.
          },
        ),
      ],
      child: const LoginBody(),
    );
  }
}
```

### Body

La propidad `child` del `BlocListener` siempre **debe** retornar el `Body` del `feature`.

### Comunicación entre `Blocs`

Existen casos en los que un evento de un `Bloc` es generado únicamente luego de que un envento de otro `Bloc` diferente se ejecuta retornando un valor en específico. En estos casos el puente de conexión entre éstos **debe** ser un `BlocListener`.

```dart
class LoginView extends StatelessWidget {
    const LoginView({super.key});

    @override
    Widget build(BuildContext context) {
        return BlocListener<LoginBloc, LoginState>(
            listenWhen: (previous, current) => previous.status != current.status,
            listener: (context, state) {

              if (state.status.isSuccess) {
                /// Solo en caso de que el status del LoginState sea
                /// exitoso, es cuando se llamará al evento del otro bloc.
                context.read<OtherBloc>().add(const OtherBlocEven());
              }
            },
            child: const LoginBody(),
            );
    }
}
```

## Layouts Responsivos

En el caso de que la aplicación móvil también sea usada en tabletas, en donde las pantallas son más grandes y por ende el diseño de una vista puede variar mucho, se **debe** hacer uso del widget `LayoutBuilder` en la clase `View` del `feature`. Ésto permitirá que según el ancho de la pantalla del dispositivo en el que se está ejecutando la aplicación, se ejecute un `Body` para aplicaciones o uno para tabletas.

```dart
class LoginView extends StatelessWidget {
    const LoginView({super.key});

    @override
    Widget build(BuildContext context) {
        return BlocListener<LoginBloc, LoginState>(
            listenWhen: (previous, current) => previous.status != current.status,
            listener: (context, state) {
                 /// Acciones a implementar.
            },
            child: LayoutBuilder(
                builder: (context, constraints) {
                    /// Aquí se define el ancho que hará de frontera entre una vista y otra.
                    if (constraints.maxWidth >= 600) {
                        return const LoginTabletBody();
                    } else {
                        return const LoginMobileBody();
                    }
                },
            ),
        );
    }
}
```
