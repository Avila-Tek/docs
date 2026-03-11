---
title: Mobile
sidebar_position: 3
---

# Desarrollo Móvil

El equipo móvil de Avila Tek construye aplicaciones multiplataforma con **Flutter**, siguiendo una arquitectura en capas inspirada en Clean Architecture y utilizando **BLoC** como manejador de estados.

Esta sección reúne toda la documentación técnica del equipo: desde el proceso de onboarding hasta las reglas de código, guías prácticas, calidad y CI/CD.

## Stack principal

| Tecnología | Rol |
|---|---|
| [Flutter](https://flutter.dev) | Framework de desarrollo multiplataforma (iOS, Android) |
| [BLoC / Cubit](https://bloclibrary.dev) | Manejador de estados |
| [Mason](https://pub.dev/packages/mason_cli) | Generador de estructura de features (`feature_brick_plus`) |
| [Very Good CLI](https://pub.dev/packages/very_good_cli) | Scaffolding inicial de proyectos con flavors y linter |
| [Melos](https://melos.invertase.dev) | Gestión de mono-repos |

## Secciones

| Sección | Descripción |
|---|---|
| [Onboarding](/docs/engineering/mobile/onboarding) | Guía de bienvenida para desarrolladores nuevos en el equipo o en Flutter |
| [Code Rules](/docs/engineering/mobile/code-rules) | Convenciones, patrones y arquitectura del equipo (v1 y v2) |
| [Practical Guides](/docs/engineering/mobile/practical-guides) | Guías paso a paso para integraciones comunes (Firebase, deep links, etc.) |
| [Quality](/docs/engineering/mobile/quality) | Manejo de errores, logging y Sentry |
| [CI/CD](/docs/engineering/mobile/ci-cd) | Configuración de Codemagic y provisioning profiles |
