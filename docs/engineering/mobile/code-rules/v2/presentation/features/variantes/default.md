---
sidebar_position: 1
---

# Default

La variante `default` del `feature_brick_plus` es la más común. Genera la estructura base para cualquier vista estándar: una sola pantalla con scroll, sin pasos ni pestañas.

## Cuándo usar esta variante

Usa `default` cuando el feature sea una pantalla única sin flujo multipaso ni contenido organizado en tabs. Es el punto de partida para la gran mayoría de vistas de la aplicación.

## Estructura de archivos

```
feature/
├── base/
│   ├── feature_page.dart      ← FeaturePage (public) + _FeatureView (private) + declaraciones part
│   └── feature_body.dart      ← _FeatureBody (private, const)
├── bloc/
│   ├── feature_bloc.dart      ← _FeatureBloc
│   ├── feature_event.dart     ← _FeatureEvent (solo si el bloc es Bloc<_Event, _State>)
│   └── feature_state.dart     ← _FeatureState (solo si el bloc es Bloc<_Event, _State>)
├── widgets/
│   └── (archivos adicionales de widgets, cada uno declarado como part)
└── feature.dart               ← export 'base/feature_page.dart';
```

## Características clave

| Aspecto | Comportamiento |
|---|---|
| `FeaturePage` | Pública — punto de entrada al feature |
| `_FeatureView` | **Privada** — solo accesible dentro del feature |
| `_FeatureBody` | **Privada** y **const** |
| Controladores | Ninguno — el Body no instancia controladores |
| Subestructura | Solo la carpeta `widgets/` opcional |
| Archivos `part` | Únicamente los archivos del propio feature |

## Comparativa entre variantes

| Aspecto | Default | Stepper | Tabbed |
|---|---|---|---|
| `_FeatureView` | Privada | Pública | — |
| Body const | Sí | No | — |
| Archivo extra | — | `feature_step.dart` | — |
| Subestructura | — | `steps/` | — |
| Archivos `part` | Feature files | Feature + todos los steps | — |
| Navegación | Router | Eventos `NextStep`/`PreviousStep` | — |

:::info
Para la documentación completa de cada clase (`Page`, `View`, `Body`, `Bloc`), consulta sus respectivas páginas en esta sección, que aplican a todas las variantes salvo las excepciones indicadas en cada variante.
:::
