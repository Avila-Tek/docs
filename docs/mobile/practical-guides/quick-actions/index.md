---
sidebar_position: 9
---

# Acciones rápidas (Quick Actions)

:::warning
Esta guía fue redactada usando la versión 3.24.0 de `flutter`
:::

El paquete `quick_actions` de Flutter proporciona una forma sencilla de implementar accesos directos (shortcuts) en la pantalla de inicio de dispositivos móviles.

![Quick Actions](/img/quick-actions.png)

## Setup

Comienza importando al proyecto el paquete de `quick_actions`.

```yaml
quick_actions: ^1.1.0
```

## Implementación

Comienza ubicando una sección en la aplicación donde tus servicios ya se hayan inicializado (por lo general este lugar es el index de la aplicación).
Para efectos de esta práctica, usaremos el archivo `index.dart` para implementar las acciones rápidas.

Es importante que la clase sea Stateful y se le debe agregar el Mixin `WidgetsBindingObserver` para poder detectar los cambios en el ciclo de vida de la aplicación con el método `didChangeAppLifecycleState`.

Implementa la siguiente función para inicializar las acciones rápidas y definir las acciones que debe ejecutar según sea la ocasión.

```dart
Future<void> initializeQuickActions({required bool isAuth}) async {
    await Future.delayed(const Duration(seconds: 1), () {
        if (isAuth) {
        const QuickActions()
            ..initialize((String shortcut) {
            switch (shortcut) {
                case 'action_1':
                context.go(AppShellBranch.policies.path);
                return;
                case 'action_2':
                context.go(AppShellBranch.cases.path);
                return;
                default:
                return;
            }
            })
            ..setShortcutItems([
            const ShortcutItem(
                type: 'action_1',
                localizedTitle: 'Action 1',
            ),
            const ShortcutItem(
                type: 'action_2',
                localizedTitle: 'Action 2',
            ),
            ...
            ]);
        }
    });
}
```

En la inicialización se definen los `ShortcutItem`, a los cuales se le da como valores un tipo (que sirve para identificar cual acción rápida se ejecutó), un título y un icono (opcional).

A su vez se definen las acciones a ejecutar, que en este caso consisten en redirigir al usuario a distintas secciones de la aplicación. Es importante señalar que esta función recibe el parámetro isAuth, ya que las vistas a las que se realiza la redirección requieren que el usuario esté autenticado para poder acceder.

Por último, esta función se va a llamar en dos lugares:

- En la función `initState()` para que se ejecute apenas se instancie la vista.

```dart
@override
void initState() {
    super.initState();

    final isAuth = context.read<UserBloc>().state.isAuthenticated;

    initializeQuickActions(isAuth: isAuth);

    WidgetsBinding.instance.addObserver(this);
}
```

- En la función `didChangeAppLifecycleState()`, de forma que si la aplicación pasa a segundo plano y luego se reanuda , vuelva a inicializar las acciones rápidas y pueda ejecutar la acción.

```dart
@override
void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
        final isAuth = context.read<UserBloc>().state.isAuthenticated;

        initializeQuickActions(isAuth: isAuth);
    }

    super.didChangeAppLifecycleState(state);
}
```

:::warning
Definir la función en el método `didChangeAppLifecycleState()` es crucial para asegurarse de que las acciones rápidas se ejecuten siempre que la aplicación cambia de estado. De no ser así, solo se ejecutarían la primera vez que la aplicación se abre desde el estado “terminado”.
:::
