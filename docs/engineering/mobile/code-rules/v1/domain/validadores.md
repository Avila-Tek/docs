# Validadores

## Clases

### Nombrado de validadores y errores de validación

#### A. Nombrado de Validadores

Los validadores **deben** iniciar con el nombre del campo a validar seguido de sufijo `Field`.

```dart
class EmailField {} //Nombrado para validación de campo Email

class PasswordField {} //Nombrado para validación de campo Password
```

#### B. Nombrado de Errores de Validación

Las clases utilizadas para representar los errores de validación **deben** iniciar con el nombre del
campo a validar seguido de sufijo `ValidationFailure`.

```dart
class EmailValidationFailure {} //Nombrado para el error de validación de el campo Email

class PasswordValidationFailure {} //Nombrado para el error de validación de el campo Password
```

### Extensión de `FormField`

Los validadores **deben** extender de la superclase `FormField<T, E extends FieldValidationFailure>`.

```dart
class EmailField extends FormField<String, EmailValidationFailure>

class PasswordField extends FormField<String, PasswordValidationFailure>

class PriceField extends FormField<double, PriceValidationFailure>

```

### Extensión de `FieldValidationFailure`

Los errores de validación **deben** extender de la clase `FieldValidationFailure`. Se **debe**
establecer una jerarquía de clases donde se declare una `sealed class` para definir una clase base
de todos los errores de validación.

```dart
//Sealed class que engloba todos los errores de validación para el campo Password
sealed class PasswordValidationFailure extends FieldValidationFailure {}

//Enum class que representa los posibles errores "generales" del campo Password
enum BasicPasswordValidationFailure implements PasswordValidationFailure {
  empty,
  format,
  containsUppercase
}

//Clase que representa un error específico
class MinLengthPasswordValidationFailure extends PasswordValidationFailure {
  final int minLength;

  MinLengthPasswordError({required this.minLength});
}
```

## Constructores

Las clases que extiendad de `FormField` **deben** implementar 2 constructores nombrados, estos 
representan el estado del campo a validar.

### Constructor `Pure`.

Representa el estado inicial de un campo sin modificaciones del usuario. Este constructor se **debe**
utilizar para dar una instancia inicial del campo a validar.

El constructor por defecto se implementa con un parámetro obligatorio pero en caso de ser necesario
**puede** implementarse con un parámetro opcional.

```dart
class EmailField extends FormField<String, EmailValidationFailure> {

  const EmailField.pure(super.value) : super.pure(); //Constructor Pure con un parámetro obligatorio

  const EmailField.pure([String? initialValue])
      : super.pure(initialValue ?? ''); //Constructor Pure con un parámetro opcional
}
```

### Constructor `Dirty`.

Representa el estado de un campo ya modificado por el usuario. Este constructor se **debe** utilizar
al momento de realizar modificaciones sobre el campo.

El constructor por defecto se implementa con un parámetro obligatorio y no se **pueden** realizar 
modificaciones sobre el constructor para convertir este parámetro en opcional.

```dart
class EmailField extends FormField<String, EmailValidationFailure> {

  const EmailField.dirty(super.value) : super.dirty(); //Constructor Dirty con un parámetro obligatorio
}
```

## Métodos

### Método `Validator`.

La clase `FormField` obliga a todas las clases que extiendad de ella a implementar un método 
`E? validator(T value)`. En este método se **deben** realizar las validaciones necesarias, cada
validación **debe** retornar un objeto de tipo `E`. Si todas las validaciones se cumplen 
correctamente se **debe** retornar `null`. 


```dart
class EmailField extends FormField<String, EmailValidationFailure> {

  @override
  EmailError? validator(String value) {
    //Valida si el campo se encuentra vacío.
    if (value.isEmpty) return EmailError.empty; //En caso de estar vacío retornar un error.
    //Valida si el formato cumple con las características de un email.
    if (!_emailRegExp.hasMatch(value)) return EmailError.isNotEmail; //En caso de no cumplir con el formato retorna un error.
    //Si todas las validaciones se cumplen retorna null representando que el campo se encuentra correctamente validado.
    return null;
  }
}
```
