
# Bloc

El **Componente de Lógica Empresarial (BLoC)** es uno de los varios manejadores de estados que tiene Flutter para separar la lógica de negocio de la interfaz de usuario. Su implementación permite desarrollar componentes reusables y aplicaciones escalables y testeables.

:::warning
Bloc es el único manejador de estados permitido en la capa de presentación.
:::

:::info
Para mayor información sobre el uso y funcionamiento de los Blocs, referirse a la documentacion de Bloc en https://bloclibrary.dev.
:::

## Clases

### Nombrado de clases

Las clases **deben** nombrarse según la funcionalidad que se va a desarrollar o la acción específica que el Bloc se encargará de manejar y **deben** incluir el sufijo `Bloc`.

```dart
class LoginBloc extends ... {}

class SplashBloc extends ... {}
```

### Extensiones

#### A. Bloc

Es la extensión base. En este caso la clase **debe** extender de la clase abstracta `Bloc` (proporcionado por el paquete de pub `flutter_bloc`), definiendo el evento y estado base.

```dart 
class LoginBloc extends Bloc<LoginEvent, LoginState> {}

class SplashBloc extends Bloc<SplashEvent, SplashState> {}
```

#### B. SendDataBloc
Si la lógica que va a gestionar el Bloc del feature implica la necesidad de enviar datos al servidor, se **debe** utilizar la extensión [SendDataBloc](https://github.com/Avila-Tek/flutter_common_lib/blob/master/packages/avilatek_bloc/README.md#senddatabloc) definida en el paquete de Avila Tek Flutter Common Library (FCL).

```dart
class FeatureBloc extends SendDataBloc<E> {
  FeatureBloc();

  @override
  Future<E> sendData(
    SendDataState oldState,
    DataSent<E> event,
  ) async {
    ... /// 👈 Implementación de la llamada al backend para enviar la respectiva data.

    return response; /// 👈 Retorno de la respuesta recibidad desde el backend.
  }
}
```

#### C. RemoteDataFetchBloc
Si la lógica que va a gestionar el Bloc del feature implica la necesidad de recibir datos desde el servidor (no paginados), se **debe** utilizar la extensión [RemoteDataFetchBloc](https://github.com/Avila-Tek/flutter_common_lib/blob/master/packages/avilatek_bloc/README.md#remotedatabloc) definida en el paquete de Avila Tek Flutter Common Library (FCL). 

```dart
class FeatureBloc extends RemoteDataBloc<E> {
  FeatureBloc({
    super.initialData,
  }) {
    add(const FetchRemoteData());
  }

  @override
  Future<E> fetchAndParseData(
    RemoteDataState<E> oldState,
    FetchRemoteData event,
  ) async {
    final data = await requestDataFunction() /// 👈 Implementación de la llamada al backend para recibir la respectiva data.

    return data 
  }
}
```
#### D. PagedRemoteDataFetchBloc
Si la lógica que va a gestionar el Bloc del feature implica la necesidad de recibir datos paginados desde el servidor, se **debe** utilizar la extensión [PagedRemoteDataFetchBloc](https://github.com/Avila-Tek/flutter_common_lib/blob/master/packages/avilatek_bloc/README.md#pagedremotedatabloc) definida en el paquete de Avila Tek Flutter Common Library (FCL). 

:::note
Las extensiones de Bloc que se encuentran en el **Avila Tek Flutter Common Library** han sido diseñadas específicamente para facilitar la comunicación entre la aplicación y el servidor, evitando la necesidad de replicar el mismo código varias veces, simplificando así la logica del Bloc y la complejidad del proyecto.
:::


## Constructor

### Parámetros
Los atributos requeridos por el Bloc se **deben** pasar como parámetros nombrados. Estos parámetros normalmente son entidades, variables o casos de usos.

#### A. Asignación de parámetro como variable del Bloc
En este caso el parámetro recibido en el constructor se guarda directamente cuando se instancia el estado base del Bloc en el método `super()`.

```dart
class ProductDetaiBloc extends Bloc<ProductDetaiEvent, ProductDetaiState> {
    const ProductDetailBloc({
        required Product initialData; // 👈 Se recibe la variable como parámetro nombrado.
    }) : super(
            ProductDetaiState(
                initialData: initialData, // 👈 Se guarda en el estado del Bloc.
            ),
        );
}
```

#### B. Asignación de parámetro como valor del estado del Bloc
En este caso el parámetro recibido en el constructor se guarda en un atributo `final` definido en el Bloc. Dicho atributo puede ser definido como público o privado, dependiendo de su utilidad y uso fuera del Bloc. De ser este el caso podemos acceder a estas variables por medio del contexto.

```dart
class ProductDetaiBloc extends Bloc<ProductDetaiEvent, ProductDetaiState> {
    const ProductDetailBloc({
        required String productId; // 👈 Se recibe la variable como parámetro nombrado.
        required int otherVar;
    }) : productId = productId, // 👈 Se guarda en un atributo privado que solo puede acceder el Bloc internamente.
        _otherVar = otherVar, // 👈 Se guarda en un atributo público y se accede con context.read fuera del Bloc.
        super(ProductDetaiState());

    final String productId;
    final int _otherVar;
}
```


### Principio de inversión de dependencias

Los Blocs solo **deben** recibir [Casos de Uso](/docs/code-rules/domain/use-cases.md) para manejar la logica de negocio del feature, y **deben** ser asignados obligatoriamente a atributos privados dentro del Bloc.

:::danger
 **Está prohibida la interdependencia de Blocs** (paso de un Bloc a otro por parámetro). La comunicación entre Blocs **debe** hacerse desde fuera; por ejemplo, mediante la emisión de eventos como respuesta del cambio de estado de otro Bloc con el uso de `BlocListeners`, o accediendo a la instancia de los blocs por contexto con los métodos `context.read`, `context.watch` o `context.select`.
:::

### Registro de manejadores de eventos
El constructor de la clase registra varios manejadores de eventos utilizando el método `on<Event>`
```dart 
on<Event>(FutureOr<void> Function(E, Emitter<State>) handler, {Stream<E> Function(Stream<E>, Stream<E> Function(E))? transformer})
```
Este método es el encargado de vincular un tipo de evento específico con su respectivo manejador.

- `Event` hace referencia al nombre del evento.
- `handler` hace referencia al [manejador del evento](#manejadores-de-eventos). Siempre **debe** ser privado y solo se **debe** referenciar en el constructor. El cuerpo de la función **debe** ser definido dentro de la clase, no del constructor.

#### Transformadores
Los transformadores son funciones opcionales que se pueden aplicar para controlar cómo se gestionan las emisiones de eventos, antes de que lleguen al manejador del evento. Para esto, **se puede** utilizar los proporcionados por el paquete `bloc_concurrency` o desarrollar manejadores específicos que se adapte mejor a la lógica del negocio.


### Registro de Stream Listeners
Los Stream listeners **deben** registrarse en el constructor de Bloc en caso de ser necesario escuchar los eventos que emite el Stream. Para ello, **se debe** almacenar la suscripción al Stream en una variable privada y, posteriormente, inicializar el listener del Bloc con la lógica correspondiente (por ejemplo, emitir un evento del Bloc cuando el Stream emita una señal).

```dart
class UserBloc extends Bloc<UserEvent, UserState> {
    UserBloc({
        required UserUseCase userUseCase,
    })  : _userUseCase = userUseCase,
            super(const UserState()) {
            on<UserChanged>(_onUserChanged);

            _streamSubscription = _userUseCase.user.listen((user) {  // 👈 Inicialización del listener y guardado en la variable declarada.
                add(UserChanged(user: user)); // 👈 Llamado a evento cuando el stream emite data nueva.
            });
        }

    StreamSubscription<User>? _streamSubscription; // 👈 Declaración de variable de tipo StreamSubscription.

    @override
    Future<void> close() {
        _streamSubscription?.cancel(); // 👈 Cancelación del listener
        return super.close();
    }
}
```

:::warning
    Todo listener de un Stream **debe** cancelarse en el método `close()` de los Blocs para evitar fugas de memoria y problemas de rendimiento.
:::

## Manejadores de eventos
Los manejadores de eventos permiten realizar operaciones asíncronas o síncronas y emitir nuevos estados según sea necesario.

### Nombrado
Los manejadores de eventos **deben** nombrarse como el evento, agregando el prefijo on. Además, **se debe** declarar de manera privada.

```dart
on<Event>(_onEvent);
```

### Implementación
La implementación de un manejador de evento, utilizando el patrón Bloc, **debe** seguir la siguiente estructura:

```dart
FutureOr<void> _onEvent(
    Event event,
    Emitter<State> emit,
) async {
    // 👈 Lógica a implementar
}
```
Donde:
1. FutureOr: Indica que la función puede retornar un `Future<void>` o simplemente `void`, dependiendo de si la lógica dentro de la función es asíncrona o síncrona. Esto permite flexibilidad en la implementación, ya que el Bloc puede manejar ambos tipos de operaciones.
2. Event: Representa el evento que desencadena este manejador. En la mayoría de los casos, es una clase de evento definida previamente, como parte de los eventos de Bloc.
3. Emitter: Es la función utilizada para emitir un nuevo estado. A través de emit, se notifica al Bloc el nuevo estado que debe adoptar en respuesta al evento recibido.

#### A. Manejo de errores
Se **debe** usar el bloque `try-catch` para manejar excepciones que puedan ocurrir durante la ejecución del código en el manejador de evento.

```dart
FutureOr<void> _onEvent(
    Event event,
    Emitter<State> emit,
) async {
    try {
        emit(state.copyWith(status: BlocStateStatus.loading)); // 👈 Emisión de estado de carga.

        ... // 👈 Implementación de logica síncrona/asíncrona.

        emit(state.copyWith(status: BlocStateStatus.success)); // 👈 Emisión de estado exitoso.
    } catch (e) {
        emit(
            state.copyWith(
                error: e.message, // 👈 Manejo del mensaje de error.
                status: BlocStateStatus.failure, // 👈 Emisión de estado fallido.
            ),
        );
    }
  }
```