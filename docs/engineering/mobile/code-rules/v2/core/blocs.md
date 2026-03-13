---
sidebar_position: 11
---

# BLoCs compartidos

`lib/core/blocs/` contiene los BLoCs de **estado global**: se inyectan en el árbol raíz de widgets y están disponibles para cualquier feature sin necesidad de inyección local.


## Cuándo un BLoC pertenece al core

Un BLoC debe vivir en `lib/core/blocs/` si cumple **al menos uno** de estos criterios:

### 1. Varios features lo consumen simultáneamente

Si dos o más features independientes leen o modifican el mismo estado, ese estado debe ser global.

```dart
// UserBloc es consumido por: perfil, pagos, wallet, header, notificaciones...
// → Pertenece al core
context.read<UserBloc>().state.user;
```

### 2. El estado debe persistir entre navegaciones

Si el estado no debe reiniciarse al salir de una pantalla (el árbol de widgets del feature se destruye), debe estar en el árbol raíz.

```dart
// WalletBloc: el saldo debe estar disponible en cualquier pantalla
// sin hacer una nueva petición al navegar
// → Pertenece al core
```

### 3. Es infraestructura transversal

Si el BLoC gestiona funcionalidad de sistema (permisos, tema, notificaciones, sesión), es transversal por definición.

```dart
// PermissionsBloc, ThemeBloc, PushNotificationsBloc
// → Pertenecen al core
```

## Cuándo un BLoC NO pertenece al core

Un BLoC **debe vivir en el feature** (`lib/src/[feature]/presentation/blocs/`) si:

- Solo lo usa un feature.
- Puede reiniciarse al salir de la pantalla.
- Gestiona estado efímero de formularios o flows locales.

```dart
// El BLoC de "crear producto" solo lo usa el feature de productos
// y puede reiniciarse al salir de la pantalla de creación
// → lib/src/products/presentation/blocs/create_product/
```

## Reglas para agregar un nuevo BLoC al core

### 1. Verificar que no existe ya

Revisar la lista de BLoCs existentes antes de crear uno nuevo. Es posible que el estado ya esté gestionado por un BLoC existente.

### 2. Estructura de carpeta obligatoria

```
lib/
└── core/
    └── blocs/
        └── [nombre_del_bloc]/
            ├── [nombre_del_bloc].dart         # Barrel file
            ├── [nombre_del_bloc]_bloc.dart    # BLoC
            ├── [nombre_del_bloc]_event.dart   # Eventos
            └── [nombre_del_bloc]_state.dart   # Estado
```

### 3. Inyectar en el árbol raíz

El nuevo BLoC **debe** agregarse a la lista de `MultiBlocProvider` del widget raíz de la app para que esté disponible globalmente.

```dart title="lib/src/app/app.dart"
MultiBlocProvider(
  providers: [
    BlocProvider(create: (_) => UserBloc()),
    BlocProvider(create: (_) => WalletBloc()),
    BlocProvider(create: (_) => NewCoreBloc()), // ← nuevo
    // ...
  ],
  child: MaterialApp.router(...),
)
```