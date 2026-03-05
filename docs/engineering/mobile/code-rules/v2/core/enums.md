---
sidebar_position: 5
---

# Enums

El core define enumeraciones compartidas por toda la app. Viven en `lib/core/enums/` y representan conceptos transversales: estados de operaciones async, estados de permisos, capacidades del dispositivo, etc.

:::note
Estos son los enums del **core** — usados por la infraestructura y la presentación. Los enums de **dominio** (específicos de cada feature) viven en `lib/src/[feature]/domain/`.
:::

## `FetchAsyncStatus`

Representa los estados posibles de una operación de **lectura** (fetch) asíncrona.

```dart title="lib/core/enums/async_status.dart"
enum FetchAsyncStatus implements AsyncStatus {
  /// No operation has been initiated yet.
  initial,

  /// A request is in flight.
  waiting,

  /// A resource was created successfully (e.g., after a POST that also fetches).
  created,

  /// Data has been loaded successfully.
  loaded,

  /// Data is being refreshed while the previous data is still visible.
  reloading,

  /// Data is being updated (e.g., a partial update while data is still visible).
  updating,

  /// The operation failed. An error payload is available in the state.
  failure;

  bool get isInitial   => this == FetchAsyncStatus.initial;
  bool get isWaiting   => this == FetchAsyncStatus.waiting;
  bool get isCreated   => this == FetchAsyncStatus.created;
  bool get isLoaded    => this == FetchAsyncStatus.loaded;
  bool get isReloading => this == FetchAsyncStatus.reloading;
  bool get isUpdating  => this == FetchAsyncStatus.updating;
  bool get isFailure   => this == FetchAsyncStatus.failure;
}
```

Los getters booleanos están definidos en el enum mismo. Los contratos `IFetchAsyncState` e `IReloadAsyncState` también los re-exponen para que sean accesibles directamente desde el objeto de estado. Ver [Interfaces](./interfaces.md) y [Types](./types.md).

## `SendAsyncStatus`

Representa los estados posibles de una operación de **escritura** (send) asíncrona.

```dart title="lib/core/enums/async_status.dart"
enum SendAsyncStatus implements AsyncStatus {
  /// No operation has been initiated yet.
  initial,

  /// The request is in flight.
  waiting,

  /// The operation completed successfully.
  sent,

  /// The operation failed. An error payload is available in the state.
  failure;

  bool get isInitial => this == SendAsyncStatus.initial;
  bool get isWaiting => this == SendAsyncStatus.waiting;
  bool get isSent    => this == SendAsyncStatus.sent;
  bool get isFailure => this == SendAsyncStatus.failure;
}
```

### Cuándo usar `FetchAsyncStatus` vs `SendAsyncStatus`

| Operación | Estado a usar |
|---|---|
| Cargar datos (GET) | `FetchAsyncStatus` |
| Refrescar datos | `FetchAsyncStatus` (estado `reloading`) |
| Crear, actualizar, eliminar | `SendAsyncStatus` |
| Login, registro | `SendAsyncStatus` |
| Enviar formulario | `SendAsyncStatus` |

## Estructura de archivos

```
lib/
└── core/
    └── enums/
        ├── fetch_async_status.dart
        ├── send_async_status.dart
        ├── ...
        └── enums.dart                 # Barrel file
```