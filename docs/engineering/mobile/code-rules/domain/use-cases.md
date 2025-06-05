# Casos de uso

## Clases

### Nombrado de la clase

El nombre de la clase de un caso de uso **debe** reflejar claramente la funcionalidad que gestiona, acompañado del sufijo `UseCase`. **Debe** estar en singular, y en caso de ser compuesto por más de una palabra, estar en _PascalCase_.

```dart
    /// Para un caso de uso que gestiona la autenticación
    class AuthUseCase { }

    /// Para un caso de uso que gestiona las notificaciones push de la aplicación
    class PushNotificationUseCase { }

    /// Para un caso de uso que gestiona la configuración remota de la aplicación
    class RemoteConfigUseCase { }
```

## Constructor

### Inyección de dependencias

Los casos de uso **deben** recibir las dependencias necesarias a través de su constructor. Estos parámetros nombrados se declaran como `required` y **deben** ser interfaces, **no** implementaciones concretas.

```dart
    class AuthUseCase {
      const AuthUseCase({
        required IAuthRepository authRepository,
      });
    }
```

### Almacenamiento de dependencias

Las dependencias **deben** ser almacenadas en variables privadas de la clase, para que solo estén disponibles dentro del caso de uso. Estas se declaran como `final` para asegurar que no se puedan modificar una vez asignadas en el constructor.

La implementación completa del constructor con las dependencias de la clase se vería de la siguiente manera:

```dart
    class AuthUseCase {
      const AuthUseCase({
        required IAuthRepository authRepository,
      }) : _authRepository = authRepository;

      final IAuthRepository _authRepository;

    }
```

## Métodos

### Implementación de métodos

#### A. Nombrado de métodos

Los métodos de un caso de uso **deben** tener el mismo nombre que los métodos correspondientes en la interfaz del repositorio que implementan. Esto facilita la comprensión y el mantenimiento del código.

```dart
  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    final user = await _authRepository.signIn(email, password);
    // Resto del código...
  }
```

#### B. Características

Los métodos de un caso de uso **deben** ser públicos y **deben** devolver un `Future` con el tipo de dato que corresponda al resultado de la operación que realiza. En caso de no devolver ningún valor, **debe** devolver un `Future<void>`.

```dart
  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    // Resto del código...
  }

  Future<User> getCurrentUser() async {
    // Resto del código...
  }
```

### Documentación de métodos

El código, por regla general, **debe** ser autoexplicativo. Los métodos no son una excepción, y si bien no es necesario documentar cada línea de código, se **deben** documentar todos aquellos métodos que realicen operaciones complejas o que reciban parámetros, con el objetivo de facilitar su comprensión y uso para otros desarrolladores.

Esta documentación **debe** incluir una descripción clara y concisa de la funcionalidad del método, así como la descripción de los parámetros y el valor de retorno.

```dart
  /// Authenticates the user with the provided credentials.
  /// Receives the user's [email] and [password] as parameters.
  /// Returns a [User] object with the user's information.
  Future<User> signIn({
    required String email,
    required String password,
  }) async {
    // Resto del código...
  }
```

### Streams

En los casos de uso, los `Streams` **deben** crearse a partir del mismo dato que se espera recibir. **Deben** ser declarados como `getter` e inicializados desde el repositorio al que pertenecen.

```dart
  Stream<bool> get refreshProfile => _profileRepository.refreshPoliciesStream;
```

### Manejo de excepciones

Los casos de uso **deben** manejar las excepciones que puedan surgir durante su ejecución. Para ello, **deben** utilizar bloques `try-catch` para capturar las excepciones y devolverlas a capas superiores de manera controlada.

Si se espera que el método devuelva una excepción particular que deba ser gestionada de manera diferente (por ejemplo, una llamada a un repositorio), se **debe** utilizar un bloque `catch` específico para esa excepción.

```dart
  Future<User> getCurrentUser() async {
    try {

      final user = await _authRepository.getCurrentUser();
      return user;

    } on NotAuthorizedException catch (e) {
      // Manejo de excepción específica
      rethrow;
    } catch (e) {
      rethrow;
    }
  }
```

:::info
Es importante manejar todas las llamadas a repositorios de manera asíncrona. Asimismo, se **debe** hacer la llamada en una variable que posteriormente se devuelva, para facilitar la captura de excepciones.
:::
