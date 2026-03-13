---
title: Pruebas
sidebar_position: 3
slug: /frontend/quality/testing
---

# Pruebas

En esta sección se presenta una forma práctica de hacer testing en frontend 🚀: no como un paso final, sino como una práctica continua que acompaña el desarrollo desde el diseño del código hasta la validación de flujos reales de usuario.

La idea es construir una base sólida con fundamentos de testabilidad (DI/IoC), aplicar pruebas unitarias según la responsabilidad de cada capa y, finalmente, cubrir recorridos completos con pruebas E2E.

## 📚 Índice

1. [Fundamentos (DI/IoC)](/docs/frontend/quality/testing/fundamentals)  
   Principios que hacen posible escribir pruebas mantenibles, aisladas y confiables.
2. [Pruebas unitarias por capas](/docs/frontend/quality/testing/testing-by-layer)  
   Estrategia general para testear dominio, infraestructura, aplicación y UI respetando responsabilidades.
3. [Pruebas E2E con Cypress](/docs/frontend/quality/testing/e2e-testing)  
   Guía para validar escenarios de negocio de punta a punta con convenciones y buenas prácticas.

## ⚡ Acceso rápido por capa

- [Domain layer](/docs/frontend/quality/testing/testing-by-layer/domain-test): lógica de negocio pura y reglas.
- [Infrastructure layer](/docs/frontend/quality/testing/testing-by-layer/infrastructure-test): servicios, APIs y transformaciones.
- [Application layer](/docs/frontend/quality/testing/testing-by-layer/application-test): casos de uso, orquestación y hooks.
- [UI layer](/docs/frontend/quality/testing/testing-by-layer/ui-test): interacción, renderizado y estados visuales.
