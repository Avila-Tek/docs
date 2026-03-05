---
sidebar_position: 6
---

# Extensiones

`lib/core/extensions/` define métodos de extensión sobre tipos existentes de Dart y Flutter. Su propósito es reducir código repetitivo y mejorar la legibilidad — no contienen lógica de negocio.

## Extensiones disponibles

| Extensión | Tipo extendido | Qué agrega |
|---|---|---|
| `ContextX` | `BuildContext` | Shortcuts de navegación, acceso a media query, tema y BLoCs. |
| `StringX` | `String` | Capitalización, validaciones de formato (email, numérico), limpieza de espacios. |
| `NumberX` | `num` | Formateo de moneda y redondeo. |
| `DateTimeX` | `DateTime` | Formateo de fechas para presentación en la UI. |
| `ColorX` | `Color` | Aclarar, oscurecer y ajustar opacidad de colores. |
| `WidgetX` | `Widget` | Helpers de composición: padding, centrado, expanded. |
| `ValidatorsX` | `String?` | Validaciones encadenables para el campo `validator` de formularios Flutter. |
| `DeviceStorageX` | — | Acceso al storage local sin necesidad de inyectar el adapter manualmente. |
| `AppServiceX` | — | Shortcuts a servicios registrados en el locator. |

## Reglas para agregar una extensión

- **Sobre tipos de Dart/Flutter únicamente**: `String`, `BuildContext`, `Widget`, `DateTime`, `Color`, etc. No extender clases propias del proyecto.
- **Sin lógica de negocio**: si la operación involucra reglas del dominio, pertenece a un caso de uso o a la entidad correspondiente.
- **Nombre de archivo en `snake_case` con sufijo `_x`**: `context_x.dart`, `string_x.dart`.
- **Un archivo por tipo extendido**.

## Estructura de archivos

```
lib/
└── core/
    └── extensions/
        ├── context_x.dart
        ├── string_x.dart
        ├── number_x.dart
        ├── date_time_x.dart
        ├── color_x.dart
        ├── widget_x.dart
        ├── validators_x.dart
        ├── device_storage_x.dart
        ├── app_service_x.dart
        └── extensions.dart     # Barrel file
```

:::note
Las extensiones de Flutter (`ContextX`, `WidgetX`, `ColorX`) se exportan solo a través de `ui.dart`. Las extensiones de Dart puro (`StringX`, `NumberX`, `DateTimeX`) también se exportan a través de `foundation.dart`.
:::
