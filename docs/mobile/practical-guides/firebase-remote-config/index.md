---
sidebar_position: 2
---

# Firebase Remote Config
:::warning
Esta guía fue redactada usando la versión 3.24.0 de `flutter`
:::

## Setup

Empieza agregando las dependencias [`firebase_core`](https://pub.dev/packages/firebase_core), [`firebase_remote_config`](https://pub.dev/packages/firebase_remote_config) y [`firebase_analytics`](https://pub.dev/packages/firebase_analytics) al proyecto de flutter en el archivo `pubspec.yaml`.

```yaml
dependencies:
  firebase_core: ^3.1.1
  firebase_remote_config: ^5.1.3
  firebase_analytics: ^11.1.0
```

:::note
Para el funcionamiento de la dependencia de firebase remote config es necesario que previamente se haya [**configurado Firebase**](/docs/practical-guides/firebase-config/index.md) para cada ambiente de la aplicación.
:::

## Implementación

### Capa de datos - RemoteConfigApi

La clase `RemoteConfigApi` que se encarga de gestionar la configuración remota de la aplicación usando Firebase Remote Config. Configura los tiempos de obtención de los datos, intenta obtener y activar la configuración, y convierte esos datos en un modelo para ser usados en la aplicación.

```dart
import 'package:firebase_remote_config/firebase_remote_config.dart';

class RemoteConfigApi {
  const RemoteConfigApi(FirebaseRemoteConfig firebaseRemoteConfig)
      : _remoteConfig = firebaseRemoteConfig;

  final FirebaseRemoteConfig _remoteConfig;

  Future<RemoteConfigValuesModel> getRemoteConfigValues() async {
    try {
      await _remoteConfig.setConfigSettings(
        RemoteConfigSettings(
          fetchTimeout: const Duration(minutes: 1),
          minimumFetchInterval: const Duration(hours: 1),
        ),
      );

      await _remoteConfig.fetchAndActivate();

      return RemoteConfigValuesModel.fromFirebaseValues(_remoteConfig);
    } catch (e) {
      throw Exception( 
        message: 'Error fetching remote config values $e',
      );
    }
  }
}
```

Esta función regresa un modelo `RemoteConfigValuesModel` donde se mapearán las variables que regresa Remote Config.

- La función `setConfigSettings` se encarga de configurar la instancia de Remote Config, estableciendo el tiempo de timeout para recibir los valores desde el servidor y el intervalo de tiempo para obtener los valores.

:::danger
El valor de `minimumFetchInterval` no debe ser demasiado pequeño en producción, ya que podría agotar la cuota disponible.
::: 

- La función `fetchAndActivate` realiza la obtención de los valores de remote config.

Luego tendremos el modelo `RemoteConfigValuesModel`, donde vamos a definir todas las variables que obtendremos de Firebase Remote Config y el cual debería tener la siguiente estructura: 

```dart 
import 'package:firebase_remote_config/firebase_remote_config.dart';

class RemoteConfigValuesModel {
  const RemoteConfigValuesModel({
    required this.remoteConfigVar1,
    required this.remoteConfigVar2,
  });

  factory RemoteConfigValuesModel.fromFirebaseValues(
    FirebaseRemoteConfig config,
  ) {
    return RemoteConfigValuesModel(
      remoteConfigVar1: config.getBool('remoteConfigVar1'),
      remoteConfigVar2: config.getString('remoteConfigVar2'),
    );
  }

  RemoteConfigValues toEntity() {
    return RemoteConfigValues(
      remoteConfigVar1: remoteConfigVar1,
      remoteConfigVar2: remoteConfigVar2,
    );
  }

  final bool remoteConfigVar1;
  final String remoteConfigVar2;
}
```

- El factory `fromFirebaseValues` recibe como parámetro `FirebaseRemoteConfig`. Esto es para usar las funciones de la dependencia que nos permiten obtener los valores: `getAll`, `getBool`, `getDouble`, `getInt`, `getString` y `getValue`. 

- La función `toEntity()` transforma el modelo en entidad, para ser usado en la capa de dominio.

### Capa de dominio

En la capa de dominio debes referenciar el `RemoteConfigApi` en algún repositorio, puede ser uno propio o formar parte de otro (posiblemente alguno que contenga las funcionalidades core de la aplicación).

En el caso de esta guía, lo utilizaremos en un repositorio llamado `RemoteConfigRepository`.

La clase abstracta `IRemoteConfigRepository` quedaría de la siguiente manera:

```dart
import 'package:project/src/domain/entities/entities.dart';

abstract class IRemoteConfigRepository {
  const IRemoteConfigRepository();

  Future<RemoteConfigValues> getRemoteConfigValues();
}
```

La implementación `RemoteConfigRepository` de la clase abstracta quedaría de la siguiente manera:

```dart
import 'dart:developer';

import 'package:project/src/data/data_sources/data_sources.dart';
import 'package:project/src/domain/entities/entities.dart';
import 'package:project/src/domain/repositories/repositories.dart';

class RemoteConfigRepository extends IRemoteConfigRepository {
  RemoteConfigRepository({
    required this.remoteConfigApi,
  });

  final RemoteConfigApi remoteConfigApi;

  static const String _source = 'CoreRepository';

  @override
  Future<RemoteConfigValues> getRemoteConfigValues() async {
    try {
      log(
        '📡 Getting remote config values',
        name: '$_source.getRemoteConfigValues()',
      );

      final values = await remoteConfigApi.getRemoteConfigValues();

      log(
        '✅ Successfully collected remote config values',
        name: '$_source.getRemoteConfigValues()',
      );

      return values.toEntity();
    } catch (e, s) {
      log(
        '❌ Error fetching remote config values. Using default values.',
        name: '$_source.getRemoteConfigValues()',
        stackTrace: s,
      );
      rethrow;
    }
  }
}
```

La clase `RemoteConfigUseCase` quedaría de la siguiente manera:

```dart
import 'package:project/src/domain/entities/entities.dart';
import 'package:project/src/domain/repositories/repositories.dart';

class RemoteConfigUseCase {
  RemoteConfigUseCase({
    required IRemoteConfigRepository remoteConfigRepository,
  }) : _remoteConfigRepository = remoteConfigRepository;

  final IRemoteConfigRepository _remoteConfigRepository;

  Future<RemoteConfigValues> getRemoteConfigValues() async {
    return _remoteConfigRepository.getRemoteConfigValues();
  }
}
```

La entidad `RemoteConfigValues` quedaría de la siguiente manera:

```dart
import 'package:equatable/equatable.dart';

class RemoteConfigValues extends Equatable {
  const RemoteConfigValues({
    required this.remoteConfigVar1;
    required this.remoteConfigVar2;
  });

  
  final bool remoteConfigVar1;
  final String remoteConfigVar2;

  @override
  List<Object?> get props => [
        remoteConfigVar1,
        remoteConfigVar2,
      ];

  static const empty = RemoteConfigValues(
    remoteConfigVar1: false,
    remoteConfigVar2: '',
  );
}
```

### Capa de presentación

En la capa de presentación debes crear un bloc, el cual se encargará de manejar la lógica de la obtención de los valores y guardarlos en el estado, para después acceder a estos mediante el contexto de la aplicación.

El estado que maneja el bloc sería el siguiente:

```dart
part of 'remote_config_bloc.dart';

enum RemoteConfigStatus {
  initial,
  loading,
  success,
  failure;

  bool get isLoading => this == RemoteConfigStatus.loading;
  bool get isSuccess => this == RemoteConfigStatus.success;
  bool get isFailure => this == RemoteConfigStatus.failure;
  bool get isInitial => this == RemoteConfigStatus.initial;
}

class RemoteConfigState extends Equatable {
  const RemoteConfigState({
    this.remoteConfigValues = RemoteConfigValues.empty,
    this.status = RemoteConfigStatus.initial,
  });

  final RemoteConfigValues remoteConfigValues;
  final RemoteConfigStatus status;

  @override
  List<Object> get props => [remoteConfigValues, status];

  bool get remoteConfigVar1 => remoteConfigValues.remoteConfigVar1;
  bool get remoteConfigVar2 => remoteConfigValues.remoteConfigVar1;

  RemoteConfigState copyWith({
    RemoteConfigValues? remoteConfigValues,
    RemoteConfigStatus? status,
  }) {
    return RemoteConfigState(
      remoteConfigValues: remoteConfigValues ?? this.remoteConfigValues,
      status: status ?? this.status,
    );
  }
}
```

1. La variable `status` guarda el estado de la obtención de los valores, cambia cuando se realiza la petición a `loading`. Si la petición se completa con éxito cambia a `success`, de otro modo pasa a ser `failure`.
2. La variable `remoteConfigValues` guarda los valores obtenidos desde Firebase Remote Config.

Adicional a esto, podemos definir unos getters por cada variable obtenida para facilitar su acceso a través del contexto.

Los eventos del bloc `RemoteConfigBloc` serían los siguientes:

```dart
part of 'remote_config_bloc.dart';

sealed class RemoteConfigEvent extends Equatable {
  const RemoteConfigEvent();

  @override
  List<Object> get props => [];
}

class RemoteConfigFetch extends RemoteConfigEvent {
  const RemoteConfigFetch();
}
```

Donde `RemoteConfigFetch` se encarga de obtener los valores desde Firebase Remote Config.

El bloc `RemoteConfigBloc` quedaría de la siguiente manera:

```dart
import 'dart:async';
import 'dart:developer';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:mercantilseguros/src/domain/entities/remote_config_values.dart';
import 'package:mercantilseguros/src/domain/use_cases/remote_config_use_case.dart';

part 'remote_config_event.dart';
part 'remote_config_state.dart';

class RemoteConfigBloc extends Bloc<RemoteConfigEvent, RemoteConfigState> {
  RemoteConfigBloc({
    required RemoteConfigUseCase remoteConfigUseCase,
  })  : _remoteConfigUseCase = remoteConfigUseCase,
        super(const RemoteConfigState()) {
    on<RemoteConfigFetch>(_onStarted);

    add(const RemoteConfigFetch());
  }

  final RemoteConfigUseCase _remoteConfigUseCase;

  FutureOr<void> _onStarted(
    RemoteConfigFetch event,
    Emitter<RemoteConfigState> emit,
  ) async {
    try {
      log('🔥 Fetching remote config values');

      emit(state.copyWith(status: RemoteConfigStatus.loading));

      final values = await _remoteConfigUseCase.getRemoteConfigValues();

      log('🔥 Remote config values $values', name: 'RemoteConfigBloc');

      emit(
        state.copyWith(
          status: RemoteConfigStatus.success,
          remoteConfigValues: values,
        ),
      );
    } catch (e) {
      emit(
        state.copyWith(
          status: RemoteConfigStatus.failure,
        ),
      );
    }
  }

  @override
  Future<void> close() {
    return super.close();
  }
}
```

Este Bloc lo vamos a instanciar en como un `BlocProvider` en el archivo `app.dart`, dentro del `MultiBlocProvider`, agregando el parámetro lazy: false, para que se ejecute el evento inicial a penas se instancie, y asi obtener la configuración de Remote Config.

```dart
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:project/src/domain/repositories/repositories.dart';
import 'package:project/src/core/blocs/remote_config/remote_config_bloc.dart';

class App extends StatelessWidget {
  const App({
    required this.router,
    required this.remoteConfigRepository,
    super.key,
  });

  final GoRouter router;
  final IRemoteConfigRepository remoteConfigRepository;

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(
          value: remoteConfigRepository,
        ),
        BlocProvider(
          lazy: false,
          create: (context) => RemoteConfigBloc(
            remoteConfigUseCase: RemoteConfigUseCase(
              coreRepository: coreRepository,
            ),
          ),
        ),
      ],
      child: MaterialApp.router(
        routerConfig: router,
        builder: (context, child) {
          final mediaQueryData = MediaQuery.of(context);

          final constrainedTextScaleFactor = mediaQueryData.textScaler.clamp(
            maxScaleFactor: 1,
          );

          return MediaQuery(
            data: mediaQueryData.copyWith(
              textScaler: constrainedTextScaleFactor,
            ),
            child: GestureDetector(
                child: child,
                onTap: () {
                  FocusManager.instance.primaryFocus?.unfocus();
                },
              ),
          );
        },
        theme: CustomTheme.theme(context),
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: const [
          Locale('es'),
        ],
      ),
    );
  }
}
```

Por último, para acceder al atributo necesario, lo realizamos a través del contexto:

```dart
context.read<RemoteConfigBloc>.state.remoteConfigVar1;
```