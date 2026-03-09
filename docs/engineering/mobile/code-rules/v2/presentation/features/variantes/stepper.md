---
sidebar_position: 2
---

# Stepper

La variante `stepper` del `feature_brick_plus` genera la estructura necesaria para flujos de múltiples pasos controlados mediante un `PageView` de navegación programática. Es ideal para procesos de registro, onboarding, checkout u otros flujos secuenciales.

## Cuándo usar esta variante

Usa `stepper` cuando el feature presente al usuario una secuencia de pantallas ordenadas con avance y retroceso, donde cada paso puede tener su propio estado y validaciones independientes.

## Estructura de archivos

```
feature/
├── base/
│   ├── feature_page.dart      ← FeaturePage (public) + FeatureView (public) + todas las declaraciones part
│   └── feature_body.dart      ← _FeatureBody (no const — tiene PageController + ScrollController)
├── bloc/
│   ├── feature_bloc.dart      ← _FeatureBloc: maneja NextStep y PreviousStep
│   ├── feature_event.dart     ← eventos de navegación + eventos personalizados
│   ├── feature_state.dart     ← _FeatureState: step + currentPageIndex + campos async
│   └── feature_step.dart      ← _FeatureStep enum + _FeatureStepX extension
├── steps/
│   ├── first_step/
│   │   ├── base/
│   │   │   ├── first_step_page.dart   ← _FirstStepPage + _FirstStepView
│   │   │   └── first_step_body.dart   ← _FirstStepBody
│   │   ├── bloc/
│   │   │   ├── first_step_bloc.dart
│   │   │   ├── first_step_event.dart
│   │   │   └── first_step_state.dart
│   │   └── widgets/
│   ├── second_step/            (estructura idéntica a first_step)
│   └── third_step/             (estructura idéntica a first_step)
├── widgets/
│   └── widgets.dart            ← placeholder; eliminar si no hay widgets compartidos
└── feature.dart                ← export 'base/feature_page.dart';
```

:::info
Los nombres que contienen `feature`, `first_step`, `second_step`, etc. **deben** ser reemplazados por el nombre real del feature y de cada step al generar con el brick.
:::

## Sistema `part`/`part of`

Al igual que en la variante default, todos los archivos son partes de `base/feature_page.dart`. La diferencia es que aquí también se incluyen **todos los archivos de cada step**, formando una única librería Dart:

```dart
// base/register_page.dart — archivo raíz
import 'package:myapp/core/foundation.dart';
import 'package:myapp/core/ui.dart';

// Archivos del feature raíz
part 'package:myapp/src/presentation/register/base/register_body.dart';
part 'package:myapp/src/presentation/register/bloc/register_bloc.dart';
part 'package:myapp/src/presentation/register/bloc/register_event.dart';
part 'package:myapp/src/presentation/register/bloc/register_state.dart';
part 'package:myapp/src/presentation/register/bloc/register_step.dart';

// Archivos del primer step
part 'package:myapp/src/presentation/register/steps/personal_info/base/personal_info_page.dart';
part 'package:myapp/src/presentation/register/steps/personal_info/base/personal_info_body.dart';
part 'package:myapp/src/presentation/register/steps/personal_info/bloc/personal_info_bloc.dart';
part 'package:myapp/src/presentation/register/steps/personal_info/bloc/personal_info_event.dart';
part 'package:myapp/src/presentation/register/steps/personal_info/bloc/personal_info_state.dart';

// Archivos del segundo step
part 'package:myapp/src/presentation/register/steps/credentials/base/credentials_page.dart';
// ...

// Widgets adicionales del step (si existen)
// part '../steps/personal_info/widgets/personal_info_form.dart';
```

:::warning
Cada vez que se agreguen archivos de widgets dentro de un step, se **debe** añadir su declaración `part` correspondiente en el archivo raíz.
:::

---

## `bloc/feature_step.dart`

Archivo exclusivo de la variante stepper. Define el enum de los pasos disponibles y una extensión con la lógica de navegación entre ellos.

```dart
part of 'package:myapp/src/presentation/register/base/register_page.dart';

enum _RegisterStep {
  personalInfo('personalInfo'),
  credentials('credentials'),
  confirmation('confirmation');

  const _RegisterStep(this.value);

  final String value;

  static Map<String, _RegisterStep> _byValue = {};

  static _RegisterStep getByValue(String value) {
    if (_byValue.isEmpty) {
      for (final step in _RegisterStep.values) {
        _byValue[step.value] = step;
      }
    }
    return _byValue[value] ?? _RegisterStep.personalInfo;
  }
}

extension _RegisterStepX on _RegisterStep {
  bool get isPersonalInfo  => this == _RegisterStep.personalInfo;
  bool get isCredentials   => this == _RegisterStep.credentials;
  bool get isConfirmation  => this == _RegisterStep.confirmation;

  /// Retorna el siguiente step, o `null` si este es el último.
  _RegisterStep? get nextStep =>
      (index + 1 == _RegisterStep.values.length)
          ? null
          : _RegisterStep.values[index + 1];

  /// Retorna el step anterior, o `null` si este es el primero.
  _RegisterStep? get previousStep =>
      (index - 1 < 0) ? null : _RegisterStep.values[index - 1];

  /// Índice de la página en el PageView.
  int? get page => index;
}
```

---

## `bloc/feature_state.dart`

El estado del stepper tiene dos tipos de campos diferenciados:

- **Campos de navegación** (`step`, `currentPageIndex`): estado de UI puro que controla qué paso es visible. Se mantienen como plain fields — no usan tipos async.
- **Campos async** (`FetchAsyncState`/`SendAsyncState`): para operaciones de red del feature raíz, igual que en la variante default.

:::danger
El brick genera un `_FeatureStatus` enum (`initial`, `loading`, `success`, `failure`) tanto en `feature_state.dart` como en cada `step_state.dart`. Este enum **debe eliminarse** y reemplazarse con campos `FetchAsyncState`/`SendAsyncState` cuando el feature o el step realicen operaciones asíncronas. Ver [Bloc › Bloc personalizado](../bloc.md#bloc-personalizado-bloc_event-_state).
:::

```dart
part of 'package:myapp/src/presentation/register/base/register_page.dart';

class _RegisterState extends Equatable {
  const _RegisterState({
    this.step = _RegisterStep.personalInfo,
    this.currentPageIndex = 0,
    // Agregar campos FetchAsyncState/SendAsyncState según las operaciones del feature raíz.
    // Ejemplo: this.submit = const SendAsyncState(value: null),
  });

  /// Step actualmente activo.
  final _RegisterStep step;

  /// Índice de la página visible en el PageView.
  final int currentPageIndex;

  @override
  List<Object?> get props => [step, currentPageIndex];

  _RegisterState copyWith({
    _RegisterStep? step,
    int? currentPageIndex,
  }) {
    return _RegisterState(
      step: step ?? this.step,
      currentPageIndex: currentPageIndex ?? this.currentPageIndex,
    );
  }
}
```

---

## `bloc/feature_event.dart`

Contiene los eventos de navegación generados por el brick más cualquier evento personalizado del feature:

```dart
part of 'package:myapp/src/presentation/register/base/register_page.dart';

sealed class _RegisterEvent extends Equatable {
  const _RegisterEvent();

  @override
  List<Object?> get props => [];
}

/// Avanza al siguiente step. Opcionalmente permite saltar a un step específico.
class _RegisterNextStep extends _RegisterEvent {
  const _RegisterNextStep({this.nextStep});

  final _RegisterStep? nextStep;

  @override
  List<Object?> get props => [nextStep];
}

/// Retrocede al step anterior.
class _RegisterPreviousStep extends _RegisterEvent {
  const _RegisterPreviousStep();
}

// Agrega aquí los eventos propios del feature raíz (p. ej. _RegisterSubmitted).
```

---

## `bloc/feature_bloc.dart`

Maneja los eventos de navegación actualizando `step` y `currentPageIndex` en el estado:

```dart
part of 'package:myapp/src/presentation/register/base/register_page.dart';

class _RegisterBloc extends Bloc<_RegisterEvent, _RegisterState> {
  _RegisterBloc() : super(const _RegisterState()) {
    on<_RegisterNextStep>(_onNextStep);
    on<_RegisterPreviousStep>(_onPreviousStep);
  }

  void _onNextStep(
    _RegisterNextStep event,
    Emitter<_RegisterState> emit,
  ) {
    final nextStep = event.nextStep ?? state.step.nextStep;
    if (nextStep == null) return; // Ya estamos en el último step.

    emit(state.copyWith(
      step: nextStep,
      currentPageIndex: state.currentPageIndex + 1,
    ));
  }

  void _onPreviousStep(
    _RegisterPreviousStep event,
    Emitter<_RegisterState> emit,
  ) {
    if (state.currentPageIndex == 0) return; // Ya estamos en el primer step.

    emit(state.copyWith(
      step: state.step.previousStep ?? state.step,
      currentPageIndex: state.currentPageIndex - 1,
    ));
  }
}
```

---

## `base/feature_body.dart`

El body del stepper **no puede ser `const`** porque instancia los controladores como campos de la clase. Contiene el `PageView` que renderiza cada step.

```dart
part of 'package:myapp/src/presentation/register/base/register_page.dart';

class _RegisterBody extends StatelessWidget {
  _RegisterBody({Key? key}) : super(key: key);

  final PageController controller = PageController();
  final ScrollController scrollController = ScrollController(keepScrollOffset: false);

  int get totalSteps => _RegisterStep.values.length - 1;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<_RegisterBloc, _RegisterState>(
      buildWhen: (previous, current) =>
          previous.currentPageIndex != current.currentPageIndex,
      builder: (context, state) {
        // Animar al PageView cuando cambia el índice.
        WidgetsBinding.instance.addPostFrameCallback((_) {
          controller.animateToPage(
            state.currentPageIndex,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
          );
        });

        return NestedScrollView(
          controller: scrollController,
          headerSliverBuilder: (context, innerBoxIsScrolled) {
            return [
              // Agregar SliverAppBar u otros slivers aquí.
            ];
          },
          body: PageView(
            controller: controller,
            physics: const NeverScrollableScrollPhysics(),
            children: const [
              _PersonalInfoStepPage(),
              _CredentialsStepPage(),
              _ConfirmationStepPage(),
            ],
          ),
        );
      },
    );
  }
}
```

:::info
`NeverScrollableScrollPhysics` desactiva el deslizamiento manual entre páginas. Toda la navegación ocurre únicamente a través de los eventos del bloc.
:::

---

## `base/feature_page.dart` — Page y View

A diferencia de la variante default, la clase `FeatureView` en la variante stepper es **pública**:

```dart
class RegisterPage extends StatelessWidget {
  const RegisterPage({super.key});

  static const routeName = 'register';
  static const path = '/$routeName';

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => _RegisterBloc(),
      child: Scaffold(
        body: RegisterView(),
      ),
    );
  }
}

/// View pública del stepper.
class RegisterView extends StatelessWidget {
  const RegisterView({super.key});

  @override
  Widget build(BuildContext context) {
    return _RegisterBody();
  }
}
```

---

## Steps — mini-features

Cada step es una mini-feature autocontenida con su propia clase `Page`, `View`, `Body` y `Bloc`. Todos son privados y no tienen rutas, ya que no son navegables directamente desde el router.

### `_StepPage`

Actúa como el `Page` del step: inyecta el bloc del step y define el `Scaffold`. **No tiene `routeName` ni `path`**.

```dart
part of 'package:myapp/src/presentation/register/base/register_page.dart';

class _PersonalInfoStepPage extends StatelessWidget {
  const _PersonalInfoStepPage();

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => _PersonalInfoStepBloc(),
      child: const Scaffold(
        body: _PersonalInfoStepView(),
      ),
    );
  }
}
```

### `_StepView`

Contiene los `BlocListeners` del step para manejar navegación, dialogs o snackbars:

```dart
class _PersonalInfoStepView extends StatelessWidget {
  const _PersonalInfoStepView();

  @override
  Widget build(BuildContext context) {
    return BlocListener<_PersonalInfoStepBloc, _PersonalInfoStepState>(
      listenWhen: (previous, current) =>
          previous.submit != current.submit,
      listener: (context, state) {
        if (state.submit.isSent) {
          // Avanzar al siguiente step cuando el step es completado.
          context.read<_RegisterBloc>().add(const _RegisterNextStep());
        }
        if (state.submit.isFailure) {
          // Mostrar error de validación.
        }
      },
      child: const _PersonalInfoStepBody(),
    );
  }
}
```

### `_StepBody`

Contiene la UI del step. Lee su propio bloc para construir el contenido:

```dart
class _PersonalInfoStepBody extends StatelessWidget {
  const _PersonalInfoStepBody();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<_PersonalInfoStepBloc, _PersonalInfoStepState>(
      builder: (context, state) {
        return Column(
          children: [
            // Contenido del step...
            ElevatedButton(
              onPressed: () => context
                  .read<_PersonalInfoStepBloc>()
                  .add(const _PersonalInfoStepSubmitted()),
              child: const Text('Continuar'),
            ),
          ],
        );
      },
    );
  }
}
```

### `_StepBloc`, `_StepEvent`, `_StepState`

Siguen las mismas reglas que el bloc de la variante default:
- El brick genera `_StepStatus` enum que **debe eliminarse** si hay operaciones async
- Usar `FetchAsyncState`/`SendAsyncState` para las operaciones del step
- Los campos de validación de formulario **pueden** ser plain fields

---

## Navegación entre steps

La navegación siempre pasa por el bloc raíz del feature, **nunca** directamente entre steps. El step body despacha el evento al bloc raíz mediante `context.read<_FeatureBloc>()`:

```dart
// Avanzar al siguiente step (secuencial):
context.read<_RegisterBloc>().add(const _RegisterNextStep());

// Retroceder al step anterior:
context.read<_RegisterBloc>().add(const _RegisterPreviousStep());

// Saltar a un step específico (no secuencial):
context.read<_RegisterBloc>().add(
  _RegisterNextStep(nextStep: _RegisterStep.confirmation),
);
```

:::warning
El `context.read<_FeatureBloc>()` funciona desde los steps porque todos son partes de la misma librería y el `_FeatureBloc` es un ancestro en el árbol de widgets (inyectado en `FeaturePage`).
:::
