---
sidebar_position: 3
---

# Adapters

Los adapters son abstracciones sobre plugins y dependencias externas. Siguen el **patrón Adapter**: cada plugin tiene una interfaz y una implementación concreta, desacoplando el resto de la app del paquete específico.

```dart title="lib/core/adapters/local_storage/local_storage.dart"
// Interface
abstract class ILocalStorage {
  Future<String?> getString(String key);
  Future<void> setString(String key, String value);
  Future<void> remove(String key);
}

// Implementación
class LocalStorageImpl implements ILocalStorage {
  const LocalStorageImpl(this._prefs);

  final SharedPreferences _prefs;

  @override
  Future<String?> getString(String key) async => _prefs.getString(key);

  @override
  Future<void> setString(String key, String value) async =>
      _prefs.setString(key, value);

  @override
  Future<void> remove(String key) async => _prefs.remove(key);
}
```

:::note
Las capas superiores (dominio, features) dependen siempre de la interfaz (`ILocalStorage`), nunca de la implementación (`LocalStorageImpl`). La implementación se inyecta vía constructor o service locator.
:::

## Reglas para agregar un nuevo adapter

### 1. Todo plugin nuevo va como adapter

Si una feature necesita un paquete externo nuevo (pub.dev), **siempre** se crea un adapter en `lib/core/adapters/` antes de usarlo. Está prohibido importar el paquete directamente desde un feature o repositorio.

```dart
// ✅ Correcto — importar la interfaz del adapter
import 'package:app/core/adapters/url_launcher/url_launcher.dart';

// ❌ Incorrecto — importar el paquete directamente
import 'package:url_launcher/url_launcher.dart';
```

### 2. Estructura de carpeta obligatoria

Cada adapter vive en su propia subcarpeta con la interfaz y la implementación :

```
lib/
└── core/
    └── adapters/
        └── [nombre_del_adapter]/
            ├── [nombre_del_adapter].dart          # Interfaz
            └── [nombre_del_adapter]_impl.dart     # Implementación
```


### 3. Nombrado de archivos y clases

| Elemento | Convención | Ejemplo |
|---|---|---|
| Carpeta | `snake_case` | `url_launcher/` |
| Interfaz | `[nombre].dart` | `url_launcher.dart` |
| Implementación | `[nombre]_impl.dart` | `url_launcher_impl.dart` |
| Clase interfaz | `I[NombreEnPascalCase]` | `IUrlLauncher` |
| Clase implementación | `[NombreEnPascalCase]Impl` | `UrlLauncherImpl` |

### 4. La interfaz define el contrato mínimo

La interfaz **debe** exponer solo los métodos que la app realmente necesita, no toda la API del plugin. Esto facilita el reemplazo del plugin en el futuro sin afectar los consumers.

```dart title="lib/core/adapters/url_launcher/i_url_launcher.dart"
abstract class IUrlLauncher {
  /// Launches the given [url] in the default browser or app handler.
  Future<bool> launch(String url);

  /// Returns true if the [url] can be handled by any installed app.
  Future<bool> canLaunch(String url);
}
```

### 5. La implementación no contiene lógica de negocio

La implementación solo **traduce** llamadas de la interfaz al paquete concreto. Si se necesita lógica adicional (reintentos, caché, etc.), esta va en el repositorio o caso de uso que usa el adapter, no en el adapter mismo.

```dart title="lib/core/adapters/url_launcher/url_launcher_impl.dart"
class UrlLauncherImpl implements IUrlLauncher {
  @override
  Future<bool> launch(String url) =>
      launchUrl(Uri.parse(url)); // delegación directa al paquete

  @override
  Future<bool> canLaunch(String url) =>
      canLaunchUrl(Uri.parse(url));
}
```

### 6. Barrel file del adapter

```dart title="lib/core/adapters/url_launcher/url_launcher.dart"
export 'url_launcher.dart';
export 'url_launcher_impl.dart';
```

