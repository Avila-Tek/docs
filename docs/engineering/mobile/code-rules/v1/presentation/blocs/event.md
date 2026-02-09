# Event

Los **eventos** del Bloc representan acciones o intenciones que desencadenan una actualización en el estado de la aplicación. Es la forma en que el sistema notifica al Bloc que algo ha sucedido y, en respuesta, este debe tomar medidas. El Bloc escucha los eventos que se envían desde la UI u otros componentes, y, en base a ellos, ejecuta la lógica de negocio para producir un nuevo estado.

## Clases

### Nombrado de clases

#### A. Eventos base
Los nombres de los eventos base **deben** incluir el nombre de la funcionalidad seguido del sufijo `Event`. Además, **deben** definirse con el modificador de clase [sealed](https://dart.dev/language/class-modifiers#sealed) y extender de `Equatable`.

```dart
sealed class LoginEvent extends Equatable {
  ... /// 👈 Implementación del evento.
}
```

#### B. Eventos heredados
Los nombres de los eventos que heredan del evento base **deben** incluir un verbo en pasado que describa la acción realizada. **Pueden** incorporar el nombre de la funcionalidad, a menos que esto genere un nombre excesivamente largo. En tal caso, el desarrollador **puede** ajustar el nombre, siempre y cuando mantenga coherencia con la funcionalidad.

```dart
class LoginStarted extends LoginEvent {
  ... /// 👈 Implementación del evento.
}
```

## Constructor 
Los constructores de los eventos de un Bloc **deben** ser definidos como constante aún asi estos no contengan parámetros.

```dart
class LoginStarted extends LoginEvent {
  const LoginStarted();  /// 👈 Definición del constructor constante.
}
```
De contener parámetros, estos **deben** ser definidos como parámetros nombrados. Esta regla no aplica cuando el evento tiene un solo parámetro, en este caso **puede** no ser parámetro nombrado.

```dart
class LoginStarted extends LoginEvent {
  const LoginStarted({
    required this.email,
    required this.password,
  });

  final String email;
  final String password;

  ...
}

class DropdownValueSelected extends LoginEvent {
  const DropdownValueSelected(this.value);

  final String value;
  
  ...
}
```

## Método `props`

### Definición props por defecto en el evento base

Al extender de `Equatable` los eventos bases, se **debe** definir el metodo `props` en dicho evento.

```dart
class LoginEvent extends Equatable {
  const LoginEvent();

   @override
  List<Object> get props => [];
}
```

:::warning
No se **debe** definir el método `props` para clases a menos que sus propiedades cambien con respecto a la clase padre.
:::