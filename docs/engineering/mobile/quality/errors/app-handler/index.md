---
sidebar_position: 2
---

# App ErrorHandler

Hasta ahora construimos un sistema robusto de mapeo de errores, capaz de transformar las respuestas del backend (o errores internos) en objetos AppError tipados y fáciles de manejar.

Ahora daremos el siguiente paso: **crear un manejador de errores sencillo que, basándose en los distintos errores definidos en la Parte 1, ejecute acciones específicas dentro de la aplicación.**

El objetivo de esta parte es:
- Centralizar el manejo de errores en un único punto.
- Ejecutar acciones automáticas dependiendo del tipo o código del error.
- Establecer un patrón claro y escalable para que todo el equipo lo siga.

## Clase ErrorHandler

Esta clase actúa como punto centralizado para manejar cualquier AppError que se produzca en la aplicación (una gran aportación de @Carlos Doffiny S-V , que lo implementó en UCAB app).

El método estático handle recibe el BuildContext (para interactuar con la UI) y el AppError a procesar, y decide qué acción ejecutar en función del tipo de error.

```dart
import 'app_error.dart';
import 'types/types.dart';

abstract class ErrorHandler {
  static void handle(BuildContext context, AppError error) {
    return switch (error) {
      NoOpError() => null, // Do nothing
      UserNotFoundError() => _handleSessionInvalid(), // Logs out user
      AuthenticationError() => _handleSessionInvalid(), // Logs out user
      AuthorizationError() => _redirectToLogin(), // Redirect to login
      AppError() => FailureSnackBar(
        context: context,
        text: error.message,
      ).show(context), // Show snackbar with error message
      // ...
      // ...
    };
  }
}
```

Es importante que, cada vez que se cree una nueva subclase de AppError, se agregue su correspondiente caso dentro del ErrorHandler. De esta manera se asegura que todas las acciones específicas (cerrar sesión, mostrar un modal, redirigir a login, mostrar un mensaje más descriptivo, etc.) queden centralizadas y sean fáciles de mantener.

### Dónde se usa este método?

El método ErrorHandler.handle(context, error) se utiliza en cualquier punto de la aplicación donde necesites reaccionar ante un error y ejecutar la acción correspondiente.

En la práctica, los lugares más comunes son:

- Dentro de BlocListener o BlocConsumer: cuando tu Bloc emite un estado de error, allí puedes llamar al manejador para que ejecute la acción definida.
```dart
BlocListener<Bloc, State>(
    listenWhen: (previous, current) => previous.status != current.status,
    listener: (context, state) {
        if(state.status.isFailure) {
            ErrorHandler.handle(context, state.error)
        }
    }
);
```
- En middlewares o interceptores: si centralizas el manejo de respuestas de red.

## Conclusión

Como pueden ver, este es un manejador muy sencillo que centraliza la lógica de manejo de cualquier error definido en la aplicación en un solo lugar.

Vean estas dos guías como una sola, ya que es necesario que se implemente en conjunto. Para ver mejor el funcionamiento, definimos el siguiente flujo:
1. Se produce un error en la app → se construye un AppError (o subclase).
2. Se llama a ErrorHandler.handle(context, error).
3. El switch revisa el tipo de error.
4. Según el tipo de error, se ejecuta la acción definida, ejemplo:
  - NoOpError → no hace nada.
  - UserNotFoundError / AuthenticationError → cierra sesión.
  - AuthorizationError → redirige al login.
  - AppError genérico → muestra snackbar.
5. Acción ejecutada → la UI o lógica de la app responde al usuario.