---
sidebar_position: 1
title: Versión 2
description: Reglamento de estilo de código del equipo móvil — segunda versión.
last_update:
  date: 01/08/2024
  author: Erick Ortega
---

# Reglamento v2

El Reglamento v2 establece las convenciones, patrones y herramientas que el equipo móvil de Avila Tek usa para escribir código Flutter consistente, mantenible y escalable.

## Principios

- **Privacidad por defecto** — Solo expone lo estrictamente necesario. Cada feature es una librería privada gracias al sistema `part`/`part of` de Dart.
- **Errores explícitos** — Ninguna capa lanza excepciones como mecanismo de control de flujo. Toda operación retorna `Result<T, E>` (éxito o fallo) para forzar el manejo en el sitio de llamada.
- **Estado sin enums** — El estado asíncrono se representa con `FetchAsyncState<T, E>`, `SendAsyncState<T, E>` y `ReloadAsyncState<T, E>` en lugar de enums `initial/loading/success/failure`.
- **Generación con bricks** — La estructura base de cada feature se genera con el brick de Mason `feature_brick_plus`, evitando código de boilerplate escrito a mano.

## Arquitectura

El proyecto sigue una arquitectura en capas inspirada en Clean Architecture, con dependencias unidireccionales:

```
┌──────────────────────────────────────────────────┐
│              Capa de Presentación                │
│  (widgets, BLoCs, features, navegación)          │
└───────────────────────┬──────────────────────────┘
                        │ depende de
┌───────────────────────▼──────────────────────────┐
│              Capa de Dominio                     │
│  (entidades, repositorios, casos de uso)         │
└───────────┬───────────────────────────┬──────────┘
            │ implementa                │ consume
┌───────────▼──────────┐   ┌───────────▼──────────┐
│   Capa de Datos      │   │     Core              │
│  (models, APIs,      │   │  (foundation,         │
│   repositories)      │   │   tipos, widgets)     │
└──────────────────────┘   └──────────────────────┘
```

> La capa de **Core** es consumida por todas las demás capas. El **Dominio** no conoce ni a `Data` ni a `Presentación` — solo define contratos. La **Presentación** depende del Dominio a través de repositorios e interfaces.

## Capas

| Capa | Responsabilidad |
|---|---|
| [**Core**](./core/index.md) | Infraestructura compartida: adapters, tipos async, extensiones, widgets base, barrel files `foundation.dart` y `ui.dart`. |
| [**Dominio**](./domain/index.md) | Lógica de negocio pura: entidades, enums, parámetros, interfaces de repositorios y casos de uso. Solo Dart puro — sin Flutter ni SDKs externos. |
| [**Datos**](./data/index.md) | Comunicación con fuentes externas: modelos DTO, Data Sources, repositorios concretos. Todo retorna `Result<T, E>`. |
| [**Presentación**](./presentation/index.md) | UI y estado: features generados con `feature_brick_plus`, BLoCs privados, navegación con `go_router`. |

## Herramientas clave

| Herramienta | Uso |
|---|---|
| [`feature_brick_plus`](./presentation/features/index.md) | Genera la estructura de un feature (`default`, `stepper` o `tabbed`) con todos los archivos y declaraciones `part` necesarios. |
| [`afp`](https://github.com/Avila-Tek/flutter_common_lib/tree/main/packages/afp) | Provee `Result<T, E>`, `FetchAsyncState`, `SendAsyncState`, `ReloadAsyncState`, `RemoteDataBloc`, `SendDataBloc` y `PagedRemoteDataBloc`. |
| `go_router` | Sistema de navegación declarativa. Los features exponen `routeName` y `path` como constantes estáticas en la clase `Page`. |
| `flutter_bloc` | Gestión de estado. Toda lógica de UI vive en un `Bloc` privado (`_FeatureBloc`) accesible solo dentro del feature. |
