---
sidebar_position: 6
label: Variantes
---

# Variantes

El `feature_brick_plus` ofrece tres variantes de generación según el tipo de interfaz que se va a construir. Cada variante produce una estructura de archivos distinta y define comportamientos específicos en el `Body`, el `Bloc` y la organización de los pasos o tabs.

Los elementos comunes a todas las variantes (`Page`, `View`, `Body`, `Bloc`) están documentados en sus respectivas páginas de esta sección.

## Comparativa

| Aspecto | [Default](./default.md) | [Stepper](./stepper.md) | [Tabbed](./tabbed.md) |
|---|---|---|---|
| `FeaturePage` base | `StatelessWidget` | `StatelessWidget` | `StatefulWidget` |
| Mixin | — | — | `SingleTickerProviderStateMixin` |
| `_FeatureView` | Privada | Pública | Privada (recibe `TabController`) |
| Body `const` | Sí | No | Sí (usualmente) |
| Archivo extra en `bloc/` | — | `feature_step.dart` | — |
| Subestructura | — | `steps/` | `tabs/` |
| Archivos `part` | Solo el feature | Feature + todos los steps | Feature + todos los tabs |
| Widget de navegación | — | `PageView` | `TabBarView` |
| Navegación interna | Router | Eventos Bloc (`NextStep`/`PreviousStep`) | Usuario (tap en `TabBar`) |
| Cuándo usarlo | Vista estándar | Flujo multipaso | Secciones paralelas |

## Variantes disponibles

- **[Default](./default.md)** — Vista estándar. La más común. Una sola pantalla sin pasos ni pestañas.
- **[Stepper](./stepper.md)** — Flujo multipaso controlado mediante un `PageView` de navegación programática.
- **[Tabbed](./tabbed.md)** — Vista con pestañas mediante `TabBar`. Navegación libre entre secciones paralelas.
