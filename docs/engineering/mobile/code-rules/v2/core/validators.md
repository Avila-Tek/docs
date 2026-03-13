---
sidebar_position: 7
---

# Validadores

Los validadores de campos de formulario viven en `lib/core/validators/`. Todos extienden `FormField<T, Result<void, E>>` y encapsulan la lógica de validación de un campo específico, separándola del widget.

## Contrato base

Todos los validadores extienden la interfaz `FormField<T, Result<void, E>>`:

```dart title="lib/core/interfaces/form_field.dart"
abstract class FormField<T, Result> {
  const FormField.pure(T value)
      : _value = value,
        _isPure = true;

  const FormField.dirty(T value)
      : _value = value,
        _isPure = false;

  final T _value;
  final bool _isPure;

  T get value => _value;

  /// Returns true if the field has not been interacted with yet.
  bool get isPure => _isPure;

  /// Returns the validation result. Always valid when [isPure] is true.
  Result get validator;

  /// Returns true if the field value is invalid and the field is dirty.
  bool get isNotValid;
}
```

## Constructores `pure()` y `dirty()`

Cada validador tiene dos constructores:

| Constructor | Cuándo usar |
|---|---|
| `FieldName.pure(value)` | Estado inicial del campo — no muestra error aunque el valor sea inválido |
| `FieldName.dirty(value)` | El usuario ha interactuado con el campo — valida y puede mostrar error |

```dart
// Al inicializar el estado del BLoC
final email = EmailField.pure('');     // no valida — campo intacto

// Al recibir un evento de cambio de campo
final email = EmailField.dirty(event.email);  // valida — el usuario escribió algo

// Al hacer submit — marcar todos los campos como dirty
final email = EmailField.dirty(state.email.value);
```

## Validadores disponibles

### `EmailField`

Valida formato de email según RFC básico.

```dart title="lib/core/validators/email_field.dart"
class EmailField extends FormField<String, Result<void, EmailFieldError>> {
  const EmailField.pure([super.value = '']) : super.pure();
  const EmailField.dirty(super.value) : super.dirty();

  @override
  Result<void, EmailFieldError> get validator {
    if (isPure) return const Result.success(null);
    if (value.isEmpty) return Result.failure(EmailFieldError.empty);
    if (!value.isEmail) return Result.failure(EmailFieldError.invalidFormat);
    return const Result.success(null);
  }

  @override
  bool get isNotValid => !isPure && validator.isFailure;
}

enum EmailFieldError { empty, invalidFormat }
```

### `PhoneField`

Valida número de teléfono con prefijo y longitud correctos.

```dart
class PhoneField extends FormField<String, Result<void, PhoneFieldError>> {
  const PhoneField.pure([super.value = '']) : super.pure();
  const PhoneField.dirty(super.value) : super.dirty();

  @override
  Result<void, PhoneFieldError> get validator { ... }
}

enum PhoneFieldError { empty, invalidFormat, tooShort }
```

### `AmountField`

Valida montos y valores monetarios: positivo, sin exceder límites.

```dart
class AmountField extends FormField<String, Result<void, AmountFieldError>> {
  const AmountField.pure([super.value = '']) : super.pure();
  const AmountField.dirty(super.value) : super.dirty();
}

enum AmountFieldError { empty, zero, negative, exceedsLimit, invalidFormat }
```

### `UsernameField`

Valida nombre de usuario: longitud mínima, caracteres permitidos.

## Patrón de uso en un BLoC

```dart title="lib/src/auth/presentation/blocs/login/login_bloc.dart"
class LoginBloc extends Bloc<LoginEvent, LoginState> {
  LoginBloc() : super(LoginState.initial()) {
    on<EmailChanged>(_onEmailChanged);
    on<PasswordChanged>(_onPasswordChanged);
    on<LoginSubmitted>(_onLoginSubmitted);
  }

  void _onEmailChanged(EmailChanged event, Emitter<LoginState> emit) {
    final email = EmailField.dirty(event.email);
    emit(state.copyWith(
      email: email,
      status: SendAsyncStatus.initial,
    ));
  }

  Future<void> _onLoginSubmitted(
    LoginSubmitted event,
    Emitter<LoginState> emit,
  ) async {
    // Mark all fields dirty on submit to show all errors at once
    final email = EmailField.dirty(state.email.value);
    final password = SecurityCredentialField.dirty(state.password.value);

    if (email.isNotValid || password.isNotValid) {
      emit(state.copyWith(email: email, password: password));
      return;
    }

    emit(state.copyWith(status: SendAsyncStatus.waiting));
    final result = await _loginUseCase.execute(
      LoginParams(email: email.value, password: password.value),
    );
    result.when(
      success: (_) => emit(state.copyWith(status: SendAsyncStatus.sent)),
      failure: (error) => emit(state.copyWith(
        status: SendAsyncStatus.failure,
        error: error,
      )),
    );
  }
}
```

## Patrón de uso en la UI

```dart title="lib/src/auth/presentation/screens/login_screen.dart"
BlocBuilder<LoginBloc, LoginState>(
  builder: (context, state) {
    return TextFormField(
      onChanged: (value) =>
          context.read<LoginBloc>().add(EmailChanged(email: value)),
      decoration: InputDecoration(
        errorText: state.email.isNotValid
            ? _emailErrorMessage(state.email.validator.failure)
            : null,
      ),
    );
  },
)

String? _emailErrorMessage(EmailFieldError? error) => switch (error) {
  EmailFieldError.empty => 'El correo es requerido',
  EmailFieldError.invalidFormat => 'Formato de correo inválido',
  null => null,
};
```

## Reglas

### Crear un nuevo validador cuando el campo tiene reglas de negocio

Si la validación de un campo es solo "no vacío", puede hacerse inline. Si tiene reglas específicas del dominio (formato de teléfono, rango de montos, longitud de PIN), **debe** encapsularse en un `FormField`.

### Un validador por tipo de campo

No crear validadores duplicados. Si `EmailField` ya existe, todos los campos de email en toda la app usan ese validador. Si las reglas cambian, solo se modifica en un lugar.

### Los errores son enums tipados

El tipo de error del `Result` **siempre** es un `enum`, nunca un `String`. Esto garantiza que la UI maneje todos los casos posibles en tiempo de compilación.

```dart
// ✅ Correcto — error tipado como enum
Result<void, EmailFieldError>

// ❌ Incorrecto — mensaje de error como String
Result<void, String>
```

## Estructura de archivos

```
lib/
└── core/
    └── validators/
        ├── email_field.dart
        ├── phone_field.dart
        ├── amount_field.dart
        ├── username_field.dart
        └── validators.dart               # Barrel file
```

```dart title="lib/core/validators/validators.dart"
export 'email_field.dart';
export 'phone_field.dart';
export 'amount_field.dart';
export 'username_field.dart';
export 'security_answer_field.dart';
export 'security_credential_field.dart';
```
