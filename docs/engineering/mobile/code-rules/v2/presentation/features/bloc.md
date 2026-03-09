---
sidebar_position: 5
---

# Bloc

Este capítulo describe cómo estructurar y desarrollar los blocs dentro de un feature en v2.

## Generalidades

En v2 los blocs de los features son siempre **privados** (prefijo `_`) y están declarados como partes de `base/feature_page.dart`. Son inyectados al árbol de widgets exclusivamente desde la clase `Page`.

A diferencia del v1, en v2 los blocs de los features **no siempre definen sus propios eventos y estados**. Dependiendo del tipo de operación que el feature realiza, el bloc extiende de una de las clases abstractas provistas por el paquete `avilatek_bloc` de la FCL, las cuales ya incluyen todos los eventos y estados necesarios.

## Tipos de Bloc

| Tipo | Cuándo usarlo |
|---|---|
| `Bloc<_Event, _State>` | Estado de UI puro, sin operaciones de red |
| `SendDataBloc<T>` | Enviar o mutar datos (POST, PUT, DELETE) |
| `RemoteDataBloc<T>` | Obtener un único recurso remoto |
| `PagedRemoteDataBloc<T>` | Obtener listas paginadas |

---

## Bloc personalizado (`Bloc<_Event, _State>`)

Se usa cuando el feature necesita definir su propio flujo de eventos y estado: formularios, flujos de múltiples pasos, UI con múltiples operaciones independientes, etc.

Este es el único caso en que los archivos `feature_event.dart` y `feature_state.dart` son necesarios.

### Estado: `FetchAsyncState`, `SendAsyncState`, `ReloadAsyncState`

En v2 el estado **no usa un enum de estado propio** (`initial`, `loading`, `success`…). En su lugar, los campos del estado son instancias de los tipos async del core, que encapsulan tanto el valor como el estado de la operación:

| Campo del estado | Tipo | Cuándo usarlo |
|---|---|---|
| Lectura de un recurso | `FetchAsyncState<T, E>` | Fetch one-shot sin pull-to-refresh |
| Envío / mutación | `SendAsyncState<T, E>` | POST, PUT, DELETE, o submit de formulario |
| Lectura con refresh | `ReloadAsyncState<T, E>` | Fetch que soporta pull-to-refresh |

:::danger
**No definir** un enum `_FeatureStatus` manual. El status está embebido en los tipos async y se accede con los getters `.isWaiting`, `.isLoaded`, `.isSent`, `.isFailure`, `.isReloading`.
:::

### Archivo `bloc/feature_state.dart`

Define únicamente la clase de estado inmutable. **No tiene enum de status**.

```dart
part of 'package:myapp/src/presentation/login/base/login_page.dart';

class _LoginState extends Equatable {
  const _LoginState({
    this.submit = const SendAsyncState(value: null),
  });

  /// Estado de la operación de envío del formulario de login.
  final SendAsyncState<void, AppError> submit;

  @override
  List<Object?> get props => [submit];

  _LoginState copyWith({
    SendAsyncState<void, AppError>? submit,
  }) {
    return _LoginState(
      submit: submit ?? this.submit,
    );
  }
}
```

Cuando el feature carga un recurso al entrar a la vista, usa `FetchAsyncState`:

```dart
class _ProfileState extends Equatable {
  const _ProfileState({
    this.profile = const FetchAsyncState(
      value: SkeletonDomainValue.profile,
    ),
  });

  /// Estado de la operación de carga del perfil del usuario.
  final FetchAsyncState<UserProfile, AppError> profile;

  @override
  List<Object?> get props => [profile];

  _ProfileState copyWith({
    FetchAsyncState<UserProfile, AppError>? profile,
  }) {
    return _ProfileState(
      profile: profile ?? this.profile,
    );
  }
}
```

:::info
El `value` inicial **nunca puede ser `null`**. Usa `[]` para listas, `0` para números, o un objeto skeleton del dominio (`SkeletonDomainValue.*`) para entidades.
:::

### Archivo `bloc/feature_event.dart`

Sin cambios respecto al v1. Define los eventos del bloc; todos **deben** ser privados y usar `sealed` o `abstract`:

```dart
part of 'package:myapp/src/presentation/login/base/login_page.dart';

sealed class _LoginEvent extends Equatable {
  const _LoginEvent();

  @override
  List<Object?> get props => [];
}

class _LoginSubmitted extends _LoginEvent {
  const _LoginSubmitted({required this.email, required this.password});

  final String email;
  final String password;

  @override
  List<Object?> get props => [email, password];
}
```

### Archivo `bloc/feature_bloc.dart`

Los event handlers emiten transiciones de estado llamando a los métodos del tipo async sobre el campo correspondiente:

| Transición | Llamada |
|---|---|
| Inicio de operación | `state.myField.waiting()` |
| Éxito de lectura | `state.myField.loaded(data)` |
| Éxito de escritura | `state.myField.sent()` |
| Fallo | `state.myField.failed(error)` |
| Recargando (con datos visibles) | `state.myField.reloading()` |

```dart
part of 'package:myapp/src/presentation/login/base/login_page.dart';

class _LoginBloc extends Bloc<_LoginEvent, _LoginState> {
  _LoginBloc({required LoginUseCase loginUseCase})
      : _loginUseCase = loginUseCase,
        super(const _LoginState()) {
    on<_LoginSubmitted>(_onSubmitted);
  }

  final LoginUseCase _loginUseCase;

  Future<void> _onSubmitted(
    _LoginSubmitted event,
    Emitter<_LoginState> emit,
  ) async {
    emit(state.copyWith(submit: state.submit.waiting()));

    final result = await _loginUseCase.execute(
      LoginParams(email: event.email, password: event.password),
    );

    result.resolve(
      (_) => emit(state.copyWith(submit: state.submit.sent())),
      (error) => emit(state.copyWith(submit: state.submit.failed(error))),
    );
  }
}
```

### Cómo reaccionar a los estados en el `View`

Usa los getters del tipo async en el `listenWhen` y el `listener`:

```dart
BlocListener<_LoginBloc, _LoginState>(
  listenWhen: (previous, current) =>
      previous.submit != current.submit,
  listener: (context, state) {
    if (state.submit.isWaiting) LoadingDialog.show(context);
    if (state.submit.isFailure) {
      LoadingDialog.hide(context);
      // Mostrar error al usuario.
    }
    if (state.submit.isSent) {
      LoadingDialog.hide(context);
      context.go(HomePage.path);
    }
  },
  child: const _LoginBody(),
),
```

### Cómo leer el estado en el `Body`

```dart
BlocBuilder<_LoginBloc, _LoginState>(
  buildWhen: (previous, current) =>
      previous.profile != current.profile,
  builder: (context, state) {
    if (state.profile.isWaiting) return const _ProfileSkeleton();
    if (state.profile.isFailure) return _ProfileError(error: state.profile.error);
    if (state.profile.isLoaded) return _ProfileContent(profile: state.profile.value);
    return const SizedBox.shrink();
  },
),
```

---

## `SendDataBloc<T>`

Se usa cuando el feature realiza una operación de escritura: crear, actualizar o eliminar un recurso. El tipo genérico `T` es el dato que se retorna al completarse la operación (usualmente `void` si no hay retorno).

**No requiere** archivos `feature_event.dart` ni `feature_state.dart`, ya que los eventos (`DataSent<T>`) y estados (`SendDataReady`, `SendDataLoading`, `SendDataSuccess<T>`, `SendDataFailure<T>`) son provistos por `avilatek_bloc`.

### Archivo `bloc/feature_bloc.dart`

Solo requiere implementar el método `sendData()`:

```dart
part of 'package:myapp/src/presentation/delete_account/base/delete_account_page.dart';

class _DeleteAccountBloc extends SendDataBloc<void> {
  _DeleteAccountBloc({required DeleteAccountUseCase useCase})
      : _useCase = useCase;

  final DeleteAccountUseCase _useCase;

  @override
  Future<void> sendData(
    SendDataState oldState,
    DataSent<void> event,
  ) async {
    final result = await _useCase.execute();

    if (result is Success) {
      return event.data;
    } else {
      throw result as Failure;
    }
  }
}
```

### Cómo disparar el evento

Desde el `Body` o cualquier widget del feature se dispara el evento `DataSent<T>`:

```dart
context.read<_DeleteAccountBloc>().add(const DataSent(null));
```

### Cómo reaccionar a los estados

En el `View`, con un `BlocListener`:

```dart
BlocListener<_DeleteAccountBloc, SendDataState>(
  listenWhen: (previous, current) =>
      previous.runtimeType != current.runtimeType,
  listener: (context, state) {
    if (state.isLoading) LoadingDialog.show(context);
    if (state.isFailure) {
      LoadingDialog.hide(context);
      // Mostrar error.
    }
    if (state.isSuccess) {
      LoadingDialog.hide(context);
      context.go(HomePage.path);
    }
  },
  child: const _DeleteAccountBody(),
),
```

---

## `RemoteDataBloc<T>`

Se usa cuando el feature necesita obtener un único recurso remoto. El tipo genérico `T` es el tipo del dato a obtener.

**No requiere** archivos `feature_event.dart` ni `feature_state.dart`. Los eventos (`FetchRemoteData`, `RemoteDataRestarted`) y estados son provistos por `avilatek_bloc`.

### Ciclo de estados

```
RemoteDataUninitialized
  → RemoteDataInitialFetching
    → RemoteDataFetched              ← éxito
    → RemoteDataInitialFetchingFailure ← fallo
  (una vez inicializado)
  → RemoteDataRefetching
    → RemoteDataFetched              ← éxito
    → RemoteDataRefetchingFailure    ← fallo (mantiene dato anterior)
```

### Archivo `bloc/feature_bloc.dart`

Solo requiere implementar `fetchAndParseData()`:

```dart
part of 'package:myapp/src/presentation/profile/base/profile_page.dart';

class _ProfileBloc extends RemoteDataBloc<User> {
  _ProfileBloc({required GetProfileUseCase useCase}) : _useCase = useCase {
    add(const FetchRemoteData());
  }

  final GetProfileUseCase _useCase;

  @override
  Future<User> fetchAndParseData(
    RemoteDataState<User> oldState,
    FetchRemoteData event,
  ) async {
    final result = await _useCase.execute();

    return result.when(
      success: (user) => user,
      failure: (e) => throw e,
    );
  }

  @override
  User get data => getDataFromState(state) ?? User.empty();
}
```

### Cómo reaccionar a los estados

```dart
BlocBuilder<_ProfileBloc, RemoteDataState<User>>(
  builder: (context, state) {
    if (state.isInitialFetching) return const _ProfileSkeleton();
    if (state.isFailure) return const _ProfileError();
    if (state is RemoteDataFetched<User>) {
      return _ProfileContent(user: state.data);
    }
    return const SizedBox.shrink();
  },
),
```

---

## `PagedRemoteDataBloc<T>`

Se usa cuando el feature muestra una lista paginada de elementos. El tipo genérico `T` es el tipo de los elementos de la lista.

**No requiere** archivos `feature_event.dart` ni `feature_state.dart`. Los eventos (`PagedRemoteDataFetchNextPage`, `PagedRemoteDataRestarted`, `PagedRemoteDataRetryFetchNextPage`, `PagedRemoteDataLocallyUpdated<T>`) y estados son provistos por `avilatek_bloc`.

### Ciclo de estados

```
PagedRemoteDataUninitialized
  → PagedRemoteDataFirstPageFetching
    → PagedRemoteDataNextPageFetched     ← éxito, hay más páginas
    → PagedRemoteDataLastPageFetched     ← éxito, última página
    → PagedRemoteDataFirstPageFetchingFailure ← fallo
  (una vez inicializado)
  → PagedRemoteDataNextPageFetching
    → PagedRemoteDataNextPageFetched     ← éxito, hay más páginas
    → PagedRemoteDataLastPageFetched     ← éxito, última página
    → PagedRemoteDataNextPageFetchingFailure ← fallo (mantiene datos anteriores)
```

### Archivo `bloc/feature_bloc.dart`

Solo requiere implementar `fetchAndParseNextPage()`. Este método **debe** retornar únicamente los elementos de la nueva página (no acumular con páginas anteriores — el bloc lo hace automáticamente):

```dart
part of 'package:myapp/src/presentation/notifications/base/notifications_page.dart';

class _NotificationsBloc extends PagedRemoteDataBloc<Notification> {
  _NotificationsBloc({required GetNotificationsUseCase useCase})
      : _useCase = useCase;

  final GetNotificationsUseCase _useCase;

  @override
  Future<(List<Notification>, bool)> fetchAndParseNextPage(
    PagedRemoteDataState<Notification> oldState,
    PagedRemoteDataFetchNextPage event,
  ) async {
    // Calcular el número de página actual en base al estado anterior.
    final currentPage = oldState is PagedRemoteDataInitialized<Notification>
        ? (oldState.data.length ~/ 10) + 1
        : 1;

    final result = await _useCase.execute(
      GetNotificationsParams(page: currentPage, limit: 10),
    );

    return result.when(
      success: (page) => (page.items, page.isLastPage),
      failure: (e) => throw e,
    );
  }
}
```

### Cómo disparar eventos

```dart
// Cargar la siguiente página (normalmente al llegar al final de la lista):
context.read<_NotificationsBloc>().add(const PagedRemoteDataFetchNextPage());

// Reiniciar la lista desde cero (p. ej., al hacer pull-to-refresh):
context.read<_NotificationsBloc>().add(const PagedRemoteDataRestarted());

// Actualizar un elemento localmente sin refetch:
context.read<_NotificationsBloc>().add(
  PagedRemoteDataLocallyUpdated(updatedList),
);
```

### Cómo reaccionar a los estados

```dart
BlocBuilder<_NotificationsBloc, PagedRemoteDataState<Notification>>(
  builder: (context, state) {
    if (state.isFetchingFirstPage) return const _NotificationsSkeleton();
    if (state.isFetchingFirstPageError) return const _NotificationsError();

    if (state is PagedRemoteDataInitialized<Notification>) {
      return _NotificationsList(
        notifications: state.data,
        isLoadingNextPage: state.isFetchingNextPage,
        hasReachedEnd: state.isLastPageFetched,
      );
    }

    return const SizedBox.shrink();
  },
),
```

---

## Archivos `feature_event.dart` y `feature_state.dart`

| Tipo de bloc | ¿Necesita `feature_event.dart`? | ¿Necesita `feature_state.dart`? |
|---|---|---|
| `Bloc<_Event, _State>` | Sí | Sí — con campos `FetchAsyncState`/`SendAsyncState`/`ReloadAsyncState` |
| `SendDataBloc<T>` | No | No |
| `RemoteDataBloc<T>` | No | No |
| `PagedRemoteDataBloc<T>` | No | No |

Cuando no se necesitan, el brick `feature_brick_plus` igualmente los genera vacíos. En ese caso **deben** eliminarse:

```dart
// bloc/feature_event.dart — eliminar si no hay eventos personalizados
part of 'package:myapp/src/presentation/delete_account/base/delete_account_page.dart';

// bloc/feature_state.dart — eliminar si no hay estado personalizado
part of 'package:myapp/src/presentation/delete_account/base/delete_account_page.dart';
```

:::info
Recuerda también eliminar las declaraciones `part` correspondientes en `base/feature_page.dart` si decides suprimir estos archivos.
:::

:::tip
Para profundizar en `FetchAsyncState`, `SendAsyncState` y `ReloadAsyncState` — su API completa, reglas y patrones de uso — consulta [Core › Types](../../core/types.md).
:::
