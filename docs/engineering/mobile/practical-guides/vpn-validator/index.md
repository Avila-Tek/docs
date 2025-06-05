---
sidebar_position: 8
---

# Validador VPN

:::warning
Esta guía fue redactada usando la versión 3.24.0 de `flutter`
:::

Algunas aplicaciones bloquean o limitan las acciones de los usuarios cuando detectan que están usando una VPN. Esta guía te muestra cómo implementar un sistema que detecte cuando un usuario tiene la VPN activada en su teléfono y, en ese caso, evite que interactúe con la aplicación hasta que apague la VPN.

## Setup

Comienza importando al proyecto el paquete de `vpn_check`.

```yaml
vpn_check: ^0.3.0
```

## Implementación

### Capa de datos

La clase `DeviceConnectivityApi` que se encarga de gestionar el estado de la VPN del dispositivo. Contiene métodos para verificar si la VPN está activa y para escuchar cambios en el estado de la VPN (activado o desactivado).

```dart
import 'dart:developer';

import 'package:project/src/data/data_sources/data_sources.dart';

class DeviceConnectivityApi {
  DeviceConnectivityApi({
    BaseVpnCheckerWrapper? vpn,
  }) : _vpn = vpn ?? VpnCheckerWrapper();

  final String apiHost;

  final BaseVpnCheckerWrapper _vpn;

  Future<bool> isVpnActive() async {
    try {
      final result = await _vpn.isVPNEnabled();
      return result;
    } catch (e) {
      log('Error checking VPN connection', error: e);
      rethrow;
    }
  }

  Stream<bool> listenToVpnConnection() => _vpn.vpnActivityStream;
}
```

#### Constructor y atributos

El constructor recibe un parámetro opcional de tipo `BaseVpnCheckerWrapper`. Este actúa de interfaz para interactuar con el paquete de `vpn_check` (la razón de definir esta interfaz es para poder hacer el `DeviceConnectivityApi` testeable).

```dart
abstract class BaseVpnCheckerWrapper {
  Future<bool> isVPNEnabled();

  Stream<bool> get vpnActivityStream => VPNChecker().vpnActivityStream;
}

class VpnCheckerWrapper implements BaseVpnCheckerWrapper {
  VpnCheckerWrapper();

  @override
  Future<bool> isVPNEnabled() => VPNChecker().isVPNEnabled();

  @override
  Stream<bool> get vpnActivityStream => VPNChecker().vpnActivityStream;
}
```

#### Métodos

- La función `isVpnActive` verifica si la VPN está activa o no.

- El stream `listenToVpnConnection` devuelve un `Stream<bool>`, lo que significa que cualquier cambio en el estado de la VPN (activada o desactivada) será emitido como un valor booleano.


### Capa de dominio

#### Repositorio

Empieza creando la clase abstracta `IDeviceConnectivityRepository`, que servirá como el repositorio encargado de gestionar las funciones relacionadas a la conectividad del dispositivo.

```dart
abstract class IDeviceConnectivityRepository {
  Future<bool> isVpnActive();

  Stream<bool> listenToVpnConnection();
}
```

Luego realiza la implementación de un repositorio llamado `DeviceConnectivityRepository` que extiende la interfaz `IDeviceConnectivityRepository`. Este repositorio sirve como intermediario para interactuar con dos API: `DeviceConnectivityApi` y `IErrorRadarApi`.

```dart
import 'dart:developer';

import 'package:project/src/data/data_sources/data_sources.dart';
import 'package:project/src/domain/repositories/repositories.dart';

class DeviceConnectivityRepository extends IConnectivityRepository {
  DeviceConnectivityRepository({
    required this.connectivityApi,
    required this.errorRadarApi,
  });

  final DeviceConnectivityApi connectivityApi;
  final IErrorRadarApi errorRadarApi;

  static const String _source = 'DeviceConnectivityRepository';

  @override
  Stream<bool> listenToVpnConnection() =>
      connectivityApi.listenToVpnConnection();

  @override
  Future<bool> isVpnActive() async {
    try {
      final isVpnActive = connectivityApi.isVpnActive();

      return isVpnActive;
    } catch (e, str) {
      log(
        '❌ Error checking VPN connection',
        name: '$_source.isVpnActive()',
        error: e,
        stackTrace: str,
      );

      await errorRadarApi.captureException(e, str);

      rethrow;
    }
  }
}
```

#### Caso de uso

`DeviceConnectivityUseCase` es un caso de uso que encapsula la lógica para interactuar con el repositorio de conectividad del dispositivo. 

Consta de un stream `listenToVpnConnection` que va a permitir escuchar los cambios del estado de la VPN en la capa de presentación y el método `isVpnActive` el cual permitirá obtener un valor inicial del estado de conexión de la VPN.

```dart
import 'package:mercantilseguros/src/domain/repositories/repositories.dart';

class DeviceConnectivityUseCase {
  DeviceConnectivityUseCase({
    required IDeviceConnectivityRepository connectivityRepository,
  }) : _connectivityRepository = connectivityRepository;

  final IDeviceConnectivityRepository _connectivityRepository;

  Stream<bool> listenToVpnConnection() =>
      _connectivityRepository.listenToVpnConnection();

  Future<bool> isVpnActive() => _connectivityRepository.isVpnActive();
}
```

### Capa de presentación

#### DeviceConnectivityBloc

Procede a crear un Bloc llamado `InternetConnectionBloc` en la carpeta core del proyecto, ya que este será un Bloc global. Este Bloc debe ser instanciado 
como `BlocProvider` en el nivel más alto posible de la aplicación (por lo general, en el archivo `app.dart`).

Comienza definiendo el estado del `InternetConnectionBloc`, el cual va a guardar el estado de la conexión de la VPN.

El archivo `internet_connection_state.dart` debería verse de la siguiente manera:

```dart
part of 'internet_connection_bloc.dart';

class InternetConnectionState extends Equatable {
  const InternetConnectionState({
    this.isVPNActive = false,
  });

  final bool isVPNActive;

  @override
  List<Object> get props => [isVPNActive];

  InternetConnectionState copyWith({
    bool? isVPNActive,
  }) {
    return InternetConnectionState(
      isVPNActive: isVPNActive ?? this.isVPNActive,
    );
  }
}
```

El archivo `internet_connection_event.dart` debería verse de la siguiente manera:

```dart
part of 'internet_connection_bloc.dart';

sealed class InternetConnectionEvent extends Equatable {
  const InternetConnectionEvent();

  @override
  List<Object> get props => [];
}

class InternetConnectionStarted extends InternetConnectionEvent {}

class InternetConnectionChanged extends InternetConnectionEvent {
  const InternetConnectionChanged({required this.isVpnActive});

  final bool isVpnActive;

  @override
  List<Object> get props => [isVpnActive];
}

class InternetConnectionRefreshed extends InternetConnectionEvent {}
```

En este archivo podemos ver cuatro eventos clave:
1. `DeviceConnectivityStarted`: Este evento se emite cuando la aplicación comienza y se encarga de obtener el estado inicial de la conectividad, particularmente si la VPN está activa o no.
2. `DeviceConnectivityChanged`: se emite cuando el estado de la conexión cambia, en este caso, cuando cambia el estado de la VPN.
3. `DeviceConnectivityRefreshed`: este evento se utiliza para refrescar el estado de la conectividad, por ejemplo, después de un cambio de red o de VPN. Resetea el estado del Bloc, generalmente volviendo a obtener el estado inicial de la conectividad.

El archivo `internet_connection_bloc.dart` debería quedar de la siguiente manera:

```dart
import 'dart:async';
import 'dart:developer';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:project/src/domain/use_cases/use_cases.dart';

part 'internet_connection_event.dart';
part 'internet_connection_state.dart';

class InternetConnectionBloc
    extends Bloc<InternetConnectionEvent, InternetConnectionState> {
  InternetConnectionBloc({
    required DeviceConnectivityUseCase connectivityUseCase,
  })  : _connectivityUseCase = connectivityUseCase,
        super(const InternetConnectionState()) {
    on<InternetConnectionStarted>(_onInternetConnectionStarted);
    on<InternetConnectionChanged>(_onInternetConnectionChanged);
    on<InternetConnectionRefreshed>(_onInternetConnectionRefreshed);

    _vpnConnectionSubscription =
        _connectivityUseCase.listenToVpnConnection().listen(
      (event) {
        add(InternetConnectionChanged(isVpnActive: event));
      },
      cancelOnError: false,
    );

    add(InternetConnectionStarted());
  }

  final DeviceConnectivityUseCase _connectivityUseCase;
  StreamSubscription<bool>? _vpnConnectionSubscription;

  FutureOr<void> _onInternetConnectionStarted(
    InternetConnectionStarted event,
    Emitter<InternetConnectionState> emit,
  ) async {
    final connectivityResult = await _connectivityUseCase.isVpnActive();

    emit(state.copyWith(isVPNActive: event.isVpnActive));    
  }

  FutureOr<void> _onInternetConnectionChanged(
    InternetConnectionChanged event,
    Emitter<InternetConnectionState> emit,
  ) {
    emit(
      state.copyWith(
        isVPNActive: event.isVpnActive,
      ),
    );
  }

  FutureOr<void> _onInternetConnectionRefreshed(
    InternetConnectionRefreshed event,
    Emitter<InternetConnectionState> emit,
  ) async {
    emit(state.copyWith(isVPNActive: false));

    add(InternetConnectionStarted());
  }

  @override
  Future<void> close() {
    _vpnConnectionSubscription?.cancel();
    return super.close();
  }
}
```

### Funcionamiento

Define una instancia de `DeviceConnectivityRepository` y declárala como un `RepositoryProvider` en el archivo `app.dart`. 

```dart
class App extends StatelessWidget {
  const App({
    required this.deviceConnectivityRepository,
    super.key,
  });

  ...

  final IDeviceConnectivityRepository deviceConnectivityRepository;

  ...
}
```

Luego, pasa esta instancia como parámetro a `App` dentro de main.

```dart
await bootstrap(
  environment: 'development',
  useSentry: false,
  sentryDsn: sentryDns,
  builder: () async {
    ...
    return App(
      ...
      deviceConnectivityRepository: DeviceConnectivityRepository(
        errorRadarApi: SentryApi(),
        connectivityApi: DeviceConnectivityApi(
          apiHost: apiHost,
        ),
      ),
      ...
    );
  }
);
```

#### BlocListener

Define un `BlocListener` para el `DeviceConnectivityBloc`. Lo ideal es que esté en la parte más alta posible de la aplicación, por lo tanto, lo definiremos en el archivo `app.dart`.

Este `BlocListener` evalua si ha havido un cambio en el valor de `isVPNActive`. En caso de ser este valor `true` se procede a mostrar un dialogo el usuario de advertencia indicando que debe desactivar la VPN para continuar.

Cuando el usuario desactive la VPN, el valor de `isVPNActive` cambiará a `false`. Al presionar “Reintentar”, el diálogo se cerrará y la aplicación permitirá continuar con la navegación normalmente.

```dart
return BlocListener<InternetConnectionBloc, InternetConnectionState>(
        listenWhen: (previous, current) =>
            previous.isVPNActive != current.isVPNActive,
        listener: (_, state) async {
          if (state.isVPNActive ) {
            try {
              await showCustomBottomSheet<void>(
                router.configuration.navigatorKey.currentContext ??
                    context,
                title: 'Parece que estás usando una VPN',
                message: 'Por favor, desactívala para continuar',
                confirmText: 'Reintentar',
                isDismissible: false,
                onConfirm: () {
                  context.read<InternetConnectionBloc>().add(
                        InternetConnectionRefreshed(),
                      );
                },
              );
            } catch (e) {
              log(e.toString());
            }
          }
        },
        child: App(
          ...
          deviceConnectivityRepository: DeviceConnectivityRepository(
            errorRadarApi: SentryApi(),
            connectivityApi: DeviceConnectivityApi(
              apiHost: apiHost,
            ),
          ),
          ...
        );
      );
```

:::note
El método `showCustomBottomSheet` no es un método nativo de Flutter sino una adaptación customizada de `showModalBottomSheet`.
:::