---
sidebar_position: 6
label: Variantes
---

# Variantes

El `feature_brick_plus` ofrece tres variantes de generación según el tipo de interfaz que se va a construir. Cada variante produce una estructura de archivos distinta y define comportamientos específicos en el `Body`, el `Bloc` y la organización de los pasos o tabs.

Los elementos comunes a todas las variantes (`Page`, `View`, `Body`, `Bloc`) están documentados en sus respectivas páginas de esta sección.

## Comparativa

| Aspecto | [Default](./default.md) | [Stepper](./stepper.md) | Tabbed |
|---|---|---|---|
| `FeatureView` | Privada (`_FeatureView`) | Pública (`FeatureView`) | — |
| Body `const` | Sí | No | — |
| Archivo extra en `bloc/` | — | `feature_step.dart` | — |
| Subestructura | — | `steps/` | — |
| Archivos `part` | Solo el feature | Feature + todos los steps | — |
| Navegación interna | Router | Eventos `NextStep`/`PreviousStep` | — |
| Cuándo usarlo | Vista estándar | Flujo multipaso | Secciones con tabs |

## Variantes disponibles

- **[Default](./default.md)** — Vista estándar. La más común. Una sola pantalla sin pasos ni pestañas.
- **[Stepper](./stepper.md)** — Flujo multipaso controlado mediante un `PageView` de navegación programática.
- **Tabbed** — Vista con pestañas mediante `TabBar`. *(Próximamente)*
