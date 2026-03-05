---
sidebar_position: 14
---

# Types

`lib/core/types/` contiene las implementaciones concretas de las interfaces de estado async definidas en `lib/core/interfaces/`. Son los tipos que los BLoCs del proyecto instancian directamente en sus estados.

Ver [Interfaces](./interfaces.md) para los contratos base y [Enums](./enums.md) para los valores de `FetchAsyncStatus` y `SendAsyncStatus`.

## `FetchAsyncState<T, E>`

Implementación concreta de `IFetchAsyncState`. Se usa como tipo de los campos del estado de un BLoC que representa una operación de lectura.

```dart title="lib/core/types/async_states.dart"
class FetchAsyncState<T, E extends BaseError> extends IFetchAsyncState<T, E> {
  const FetchAsyncState({required super.value, super.status, super.error});

  @override
  FetchAsyncState<T, E> waiting([T? newPlaceholder]) => FetchAsyncState(
    value: newPlaceholder ?? value,
    status: FetchAsyncStatus.waiting,
  );

  @override
  FetchAsyncState<T, E> loaded(T data) =>
      FetchAsyncState(value: data, status: FetchAsyncStatus.loaded);

  @override
  FetchAsyncState<T, E> failed(E error) => FetchAsyncState(
    value: value,
    status: FetchAsyncStatus.failure,
    error: error,
  );
}
```

## `SendAsyncState<T, E>`

Implementación concreta de `ISendAsyncState`. Se usa para operaciones de escritura (crear, actualizar, eliminar).

```dart title="lib/core/types/async_states.dart"
class SendAsyncState<T, E extends BaseError> extends ISendAsyncState<T, E> {
  const SendAsyncState({required super.value, super.status, super.error});

  @override
  SendAsyncState<T, E> waiting([T? newPlaceholder]) => SendAsyncState(
    value: newPlaceholder ?? value,
    status: SendAsyncStatus.waiting,
  );

  @override
  SendAsyncState<T, E> sent([T? data]) =>
      SendAsyncState(value: data ?? value, status: SendAsyncStatus.sent);

  @override
  SendAsyncState<T, E> failed(E error) => SendAsyncState(
    value: value,
    status: SendAsyncStatus.failure,
    error: error,
  );
}
```

## `ReloadAsyncState<T, E>`

Implementación concreta de `IReloadAsyncState`. Extiende `FetchAsyncState` con soporte para recarga y actualización parcial en background.

```dart title="lib/core/types/async_states.dart"
class ReloadAsyncState<T, E extends BaseError>
    extends IReloadAsyncState<T, E> {
  const ReloadAsyncState({required super.value, super.status, super.error});

  @override
  ReloadAsyncState<T, E> waiting([T? newPlaceholder]) => ReloadAsyncState(
    value: newPlaceholder ?? value,
    status: FetchAsyncStatus.waiting,
  );

  @override
  ReloadAsyncState<T, E> loaded(T data) =>
      ReloadAsyncState(value: data, status: FetchAsyncStatus.loaded);

  @override
  ReloadAsyncState<T, E> failed(E error) => ReloadAsyncState(
    value: value,
    status: FetchAsyncStatus.failure,
    error: error,
  );

  @override
  ReloadAsyncState<T, E> reloading([T? newPlaceholder]) => ReloadAsyncState(
    value: newPlaceholder ?? value,
    status: FetchAsyncStatus.reloading,
  );

  @override
  ReloadAsyncState<T, E> updating([T? newPlaceholder]) => ReloadAsyncState(
    value: newPlaceholder ?? value,
    status: FetchAsyncStatus.updating,
  );
}
```

## Patrón de uso en un BLoC

### Estado del BLoC

Cada campo del estado es un `FetchAsyncState` o `SendAsyncState` tipado. El valor inicial se establece con un placeholder (valor skeleton) para que la UI pueda renderizar desde el primer frame.

```dart title="lib/core/blocs/[feature]/[feature]_state.dart"
class ExampleState extends Equatable {
  const ExampleState({
    // FetchAsyncState para lecturas
    this.items = const FetchAsyncState(value: []),
    this.detail = const FetchAsyncState(
      value: SkeletonDomainValue.exampleDetail,
    ),
    // SendAsyncState para escrituras
    this.submitParams = const SendAsyncState(
      value: SkeletonDomainValue.submitParams,
    ),
  });

  final FetchAsyncState<List<Item>, AppError> items;
  final FetchAsyncState<ItemDetail, AppError> detail;
  final SendAsyncState<SubmitParams, AppError> submitParams;

  @override
  List<Object?> get props => [items, detail, submitParams];

  ExampleState copyWith({
    FetchAsyncState<List<Item>, AppError>? items,
    FetchAsyncState<ItemDetail, AppError>? detail,
    SendAsyncState<SubmitParams, AppError>? submitParams,
  }) => ExampleState(
    items: items ?? this.items,
    detail: detail ?? this.detail,
    submitParams: submitParams ?? this.submitParams,
  );
}
```

### Transiciones en el BLoC

Los métodos `.waiting()`, `.loaded()`, `.failed()` y `.sent()` crean nuevas instancias del estado — nunca mutaciones. Se llaman sobre el campo actual del estado para producir el siguiente.

```dart title="lib/core/blocs/[feature]/[feature]_bloc.dart"
Future<void> _onItemsRequested(
  ItemsRequested event,
  Emitter<ExampleState> emit,
) async {
  // 1. Transition to waiting — request in flight
  emit(state.copyWith(items: state.items.waiting()));

  // 2. Execute the use case
  final result = await _getItemsUseCase.execute();

  // 3. Resolve the result
  result.resolve(
    (data) => emit(state.copyWith(items: state.items.loaded(data))),
    (error) => emit(state.copyWith(items: state.items.failed(error))),
  );
}

Future<void> _onItemSubmitted(
  ItemSubmitted event,
  Emitter<ExampleState> emit,
) async {
  emit(state.copyWith(submitParams: state.submitParams.waiting()));

  final result = await _submitUseCase.execute(
    SubmitParams(id: event.id, value: event.value),
  );

  result.resolve(
    (_) => emit(state.copyWith(submitParams: state.submitParams.sent())),
    (error) => emit(state.copyWith(
      submitParams: state.submitParams.failed(error),
    )),
  );
}
```

:::note
`result.resolve(onSuccess, onFailure)` es el método del tipo `Result` que despacha al callback correspondiente según si la operación fue exitosa o fallida.
:::

### Lectura del estado en la UI

```dart
BlocBuilder<ExampleBloc, ExampleState>(
  builder: (context, state) {
    // Usando los getters del IFetchAsyncState
    if (state.items.isWaiting) return const LoadingWidget();
    if (state.items.isFailure) return OnErrorWidget(error: state.items.error);
    if (state.items.isLoaded) return ItemList(items: state.items.value);
    return const SizedBox.shrink();
  },
)
```

## Reglas

### Un campo por operación independiente

Si una pantalla carga dos recursos independientes (e.g., el detalle de un ítem Y su historial de movimientos), usa **dos campos** `FetchAsyncState` separados. Esto permite que cada uno transite a `loaded`/`failure` de forma independiente.

```dart
// ✅ Correcto — dos campos independientes
final FetchAsyncState<ItemDetail, AppError> detail;
final FetchAsyncState<List<Movement>, AppError> movements;

// ❌ Incorrecto — un status para dos recursos
final FetchAsyncStatus status;
final ItemDetail? detail;
final List<Movement>? movements;
```

### El placeholder no puede ser `null` para tipos non-nullable

El campo `value` de `IAsyncState` es siempre non-nullable. El valor inicial debe ser un placeholder válido: una lista vacía `[]`, un `0`, o un objeto skeleton del dominio.

```dart
// ✅ Correcto
const FetchAsyncState<List<Item>, AppError>(value: [])
const FetchAsyncState<double, AppError>(value: 0)
const FetchAsyncState<UserProfile, AppError>(value: SkeletonDomainValue.userProfile)

// ❌ Incorrecto — null no es válido para el value
FetchAsyncState<UserProfile?, AppError>(value: null)
```

### Usar `ReloadAsyncState` solo cuando la pantalla muestra datos durante el refresh

`ReloadAsyncState` está diseñado para pull-to-refresh o actualizaciones silenciosas donde los datos anteriores permanecen visibles. Si el fetch siempre borra la pantalla y muestra un skeleton, `FetchAsyncState` es suficiente.

## Estructura de archivos

```
lib/
└── core/
    └── types/
        ├── async_states.dart
        └── types.dart           # Barrel file
```

```dart title="lib/core/types/types.dart"
export 'async_states.dart';
```
