---
sidebar_position: 13
---

# Utils

`lib/core/utils/` contiene utilidades stateless organizadas por categoría. Todo lo que sea una función pura, un helper sin estado, o una configuración transversal que no encaje en las otras carpetas del core pertenece aquí.

## Categorías

| Carpeta | Qué colocar aquí |
|---|---|
| `http/` | Cliente HTTP, interceptors de autenticación y reporte de errores. |
| `formatters/` | `TextInputFormatter` para campos de texto: teléfono, montos, email. |
| `colors/` | Funciones para manipular colores: mezcla, opacidad, contraste. |
| `theme/` | Helpers para acceder al tema activo sin repetir lógica de `BuildContext`. |
| `string/` | Funciones de transformación de strings que no aplican como extensiones: enmascaramiento, truncado, formateo de nombres. |
| `animations/` | Wrappers de animaciones estándar del design system sobre `flutter_animate`. |
| `skeletons/` | Valores placeholder con la estructura correcta para usarlos con `skeletonizer` durante la carga. |
| `general/` | Todo lo que no encaje en las categorías anteriores: transiciones de página, captura de widgets, helpers de archivos. |

## Cuándo agregar algo a `utils/`

Una utilidad pertenece a `utils/` si cumple todos estos criterios:

- **Sin estado**: es una función pura o una clase sin instancia que almacene datos mutables.
- **Sin dominio**: no importa nada de `lib/src/[feature]/`. Opera sobre tipos primitivos, tipos de Flutter/Dart, o entidades genéricas.
- **Reutilizable**: es usada (o podría usarse) desde al menos dos lugares distintos de la app.
- **No encaja en otra carpeta del core**: no es un adapter, extensión, validador, enum ni typedef.

Si la utilidad tiene estado o necesita ser inyectada, probablemente pertenece a `adapters/` o `blocs/` en su lugar.

## Estructura de archivos

```
lib/
└── core/
    └── utils/
        ├── http/
        ├── formatters/
        ├── colors/
        ├── theme/
        ├── string/
        ├── animations/
        ├── skeletons/
        └── general/
```
