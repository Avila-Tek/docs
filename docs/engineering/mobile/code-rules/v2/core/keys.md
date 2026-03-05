---
sidebar_position: 9
---

# Keys

`lib/core/keys/` centraliza todas las constantes de tipo clave (strings usados como identificadores) de la app. El objetivo es eliminar los _magic strings_: no debe existir ningún string literal suelto para acceder a variables de entorno o al storage local.

## `EnvKey`

Constantes para los nombres de las variables de entorno. Se usan para leer la configuración de la app al iniciar (flavor, URLs de API, DSN de Sentry, etc.).

```dart title="lib/core/keys/env_key.dart"
class EnvKey {
  EnvKey._();

  static const String devApiUrl = 'DEV_API_URL';
  static const String stagingApiUrl = 'STAGING_API_URL';
  static const String prodApiUrl = 'PROD_API_URL';
}
```

**Uso:**

```dart
// ✅ Correcto — usando la constante
final apiUrl = const String.fromEnvironment(EnvKey.devApiUrl);

// ❌ Incorrecto — string literal suelto
final apiUrl = const String.fromEnvironment('DEV_API_URL');
```

## `DeviceStorageKeys`

Constantes para las claves del `SharedPreferences` (almacenamiento local persistente). Garantizan que el mismo string se use consistentemente en todas las lecturas y escrituras.

```dart title="lib/core/keys/device_storage_keys.dart"
class DeviceStorageKeys {
  DeviceStorageKeys._();

  // Authentication and security keys are defined here but their
  // exact names are internal to the project.

  // App settings
  static const String themeMode = 'theme_mode';
  static const String onboardingCompleted = 'onboarding_completed';
}
```

:::note
Las claves de autenticación y seguridad (tokens, credenciales locales) existen en esta clase pero sus nombres son internos al proyecto. Consúltalas directamente en el código fuente.
:::

**Uso:**

```dart
// ✅ Correcto — usando la constante
final themeMode = await _storage.getString(DeviceStorageKeys.themeMode);
await _storage.setString(DeviceStorageKeys.themeMode, 'dark');

// ❌ Incorrecto — string literal suelto
final themeMode = await _storage.getString('theme_mode');
```

## Reglas

### No duplicar claves

Cada clave **debe** definirse una sola vez en `DeviceStorageKeys` o `EnvKey`. Si dos partes de la app necesitan acceder al mismo valor, ambas usan la misma constante.

### No crear claves fuera del core

Las claves de storage y de entorno **nunca** se definen en los features. Si un feature necesita persistir un nuevo valor, la clave se agrega a `DeviceStorageKeys` en el core.

### Prefijo por dominio (cuando el volumen crece)

Si la cantidad de claves crece, se recomienda agruparlas con prefijos para evitar colisiones accidentales entre módulos:

```dart
// Settings
static const String settingsThemeMode = 'settings.theme_mode';
static const String settingsLanguage = 'settings.language';

// Onboarding
static const String onboardingCompleted = 'onboarding.completed';
static const String onboardingStep = 'onboarding.step';
```

## Estructura de archivos

```
lib/
└── core/
    └── keys/
        ├── env_key.dart
        ├── device_storage_keys.dart
        └── keys.dart               # Barrel file
```

```dart title="lib/core/keys/keys.dart"
export 'env_key.dart';
export 'device_storage_keys.dart';
```
