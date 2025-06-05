---
sidebar_position: 10
---

# Manejo de sesión del usuario

En las aplicaciones, es fundamental gestionar la sesión del usuario para determinar si está autenticado o no. Esta gestión permite, entre otras cosas, mostrar u ocultar secciones de la app, restringir la navegación y adaptar la experiencia del usuario según su estado de autenticación.

En el contexto de Flutter, el manejo de la sesión del usuario puede realizarse de manera eficiente usando un UserBloc. Este Bloc se encarga de gestionar el estado de autenticación del usuario, realizar la gestión de sesión y manejar eventos relacionados con el inicio, cierre de sesión y actualización de la información del usuario. A continuación, te explico cómo funciona cada parte del código:

## Consideraciones iniciales

Antes de comenzar la implementación del **`UserBloc`**, asegúrate de que los siguientes componentes estén listos:

### APIs
Las APIs necesarias para autenticar al usuario y obtener los datos del usuario autenticado deben estar implementadas y funcionando correctamente (idealmente plantear dos: `AuthApi` y `UserApi`). 

El `AuthApi` puede incluir:
- Autenticación (Login/Logout/Registro)
- Verificación de estado de sesión (si el usuario sigue autenticado o no).

El `UserApi` puede incluir:
- Obtención de datos del usuario.

### Repositorios
Debes tener los repositorios que interactúen con las APIs mencionadas. El `UserRepository` debería exponer un `Stream<User>` para poder suscribirse a los cambios del usuario.

### Casos de Uso
- `UserUseCase`: Obtiene y maneja la información del usuario.
- `AuthUseCase`: Gestiona el inicio y cierre de sesión.

## Implementación

Comienza creando un **`UserBloc`** en la carpeta core de la aplicación y define los eventos y estados para manejar adecuadamente los flujos de usuario.


### UserEvent

Contiene los eventos que se pueden emitir en el UserBloc, tales como cuando la sesión comienza, cuando el usuario cambia, y cuando se solicita el cierre de sesión.

```dart
part of 'user_bloc.dart';

abstract class UserEvent extends Equatable {
  const UserEvent();

  @override
  List<Object> get props => [];
}

class UserStarted extends UserEvent {
  const UserStarted();
}

class UserChanged extends UserEvent {
  const UserChanged({required this.user});

  final User user;

  @override
  List<Object> get props => [user];
}

class UserLogoutRequested extends UserEvent {
  const UserLogoutRequested();
}
```

### UserState

El **`UserState`** contiene el estado actual de la sesión del usuario, como la información del usuario y el estado de autenticación.

Tiene dos propiedades principales:
- `user`: Representa al usuario actual, que puede ser un objeto User o User.empty si el usuario no está autenticado.
- `status`: El estado actual de la sesión, que puede ser uno de los valores del enum UserStatus.

**`UserStatus`** maneja los siguientes estados:

- `unknown`: Estado inicial o desconocido (aún no se sabe si el usuario está autenticado).
- `loading`: indica que los datos del usuario están siendo cargados.
- `authenticated`: el usuario está autenticado.
- `unauthenticated`: El usuario no está autenticado.
- `failure`: El estado cuando ocurre un error en la autenticación o en la obtención de los datos.

```dart
part of 'user_bloc.dart';

enum UserStatus {
  unknown,
  loading,
  authenticated,
  unauthenticated,
  failure;

  bool get isUnknown => this == unknown;
  bool get isLoading => this == loading;
  bool get isAuthenticated => this == authenticated;
  bool get isUnauthenticated => this == unauthenticated;
  bool get isFailure => this == failure;
}

class UserState extends Equatable {
  const UserState({
    this.user = User.empty,
    this.status = UserStatus.unknown,
  });

  final User user;
  final UserStatus status;

  bool get isAuthenticated => user != User.empty;


  UserState copyWith({
    User? user,
    UserStatus? status,
  }) {
    return UserState(
      user: user ?? this.user,
      status: status ?? this.status,
    );
  }

  @override
  List<Object?> get props => [user, status];
}
```

### UserBloc

Gestiona los eventos y actualiza el estado del Bloc de acuerdo a los cambios en la autenticación del usuario.

```dart
import 'dart:async';
import 'dart:developer';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:project/src/domain/entities/entities.dart';
import 'package:project/src/domain/use_cases/use_cases.dart';

part 'user_event.dart';
part 'user_state.dart';

class UserBloc extends Bloc<UserEvent, UserState> {
  UserBloc({
    required UserUseCase userUseCase,
    required AuthUseCase authUseCase,
  })  : _userUseCase = userUseCase,
        _authUseCase = authUseCase,
        super(const UserState()) {
    on<UserStarted>(_onStarted);
    on<UserChanged>(_onChanged);
    on<UserLogoutRequested>(_onLogoutRequested);

    add(const UserStarted());

    _userSubscription = _userUseCase.user.listen((user) {
      add(UserChanged(user: user));
    });

    _signOutSubscription = _authUseCase.onNotAuthorized.listen((value) {
      add(const UserLogoutRequested());
    });
  }

  final UserUseCase _userUseCase;
  final AuthUseCase _authUseCase;

  StreamSubscription<User>? _userSubscription;

  FutureOr<void> _onStarted(
    UserStarted event,
    Emitter<UserState> emit,
  ) async {
    try {
      emit(state.copyWith(status: UserStatus.loading));

      final currentUser = await _userUseCase.currentUser;

      emit(
        state.copyWith(
          user: currentUser,
          status: currentUser == User.empty
              ? UserStatus.unauthenticated
              : UserStatus.authenticated,
        ),
      );
    } catch (e) {
        log(e.toString());
    }
  }

  FutureOr<void> _onChanged(
    UserChanged event,
    Emitter<UserState> emit,
  ) async {
    emit(state.copyWith(user: user));
  }

  FutureOr<void> _onLogoutRequested(
    UserLogoutRequested event,
    Emitter<UserState> emit,
  ) async {
    emit(state.copyWith(status: UserStatus.loading));

    await _authUseCase.signOut();

    emit(
      state.copyWith(
        user: User.empty,
        status: UserStatus.unauthenticated,
      ),
    );
  }


  @override
  Future<void> close() async {
    await _userSubscription?.cancel();
    await _signOutSubscription?.cancel();

    return super.close();
  }
}
```

- `_onStarted`: Este método maneja el evento UserStarted y verifica el estado de autenticación del usuario cuando el Bloc se inicializa. Si el usuario está autenticado, cambia el estado a authenticated; si no, a unauthenticated.
- `_onChanged`: Este método maneja el evento UserChanged y actualiza el estado con los nuevos datos del usuario, siempre que haya un cambio en la información del usuario.
- `_onLogoutRequested`: Este método maneja el evento UserLogoutRequested y realiza el cierre de sesión. Actualiza el estado a unauthenticated y establece el user a User.empty.

### BlocProvider

Instancia el BlocProvider en el archivo `app.dart`, de forma que se pueda acceder a él en cualquier instancia de la aplicación.

```dart
class App extends StatelessWidget {
  
  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        BlocProvider(
          lazy: false,
          create: (context) => UserBloc(
            userUseCase: UserUseCase(),
            authUseCase: AuthUseCase(),
          ),
        ),
        ...
      ],
      child: MaterialApp.router(
        routerConfig: router,
        builder: (context, child) {
          return child;
        },
        theme: CustomTheme.theme(context),
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        // Currently fixed to Spanish. In case of needing English,
        // it should be changed to:
        // supportedLocales: AppLocalizations.supportedLocales,
        supportedLocales: const [
          Locale('es'),
        ],
      ),
    );
  }
}
```

## Usos del UserBloc

Existen dos escenarios comunes respecto a la autenticación y la navegación en una aplicación:
1.	**Aplicaciones que requieren autenticación para acceder al contenido:** En este caso, la pantalla de inicio es un formulario de inicio de sesión. Una vez que el usuario se autentica con éxito, se le redirige al índice principal o la vista principal de la aplicación.
2.	**Aplicaciones que no requieren autenticación para acceder al contenido:** En este tipo de aplicaciones, el usuario puede navegar por el contenido sin necesidad de iniciar sesión. La aplicación permite el acceso a ciertas funcionalidades o vistas sin restricciones, aunque algunas secciones adicionales podrían requerir autenticación.

Para el primer caso, puedes instanciar un `BlocListener` en el `router.dart`, de forma que cuando cambie la autenticación realices un cambio de ruta entre el `LoginPage` y el `IndexPage`.

Para el segundo caso, por medio del contexto puedes acceder al estado de autenticación que guarda el Bloc y en base al valor, mostrar o no ciertas secciones de la app, permitir o no navegar a ciertas vistas, etc.

```dart
context.read<UserBloc>().state.isAuthenticated
```