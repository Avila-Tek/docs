---
slug: /frontend/architecture
title: 🏗️ Arquitectura
sidebar_position: 4
---

# 🏗️ Arquitectura

La arquitectura del proyecto define cómo estructuramos el código, cómo se relacionan las capas y cómo evitamos el acoplamiento innecesario entre funcionalidades.

Adoptamos un enfoque basado en **Clean Architecture** y **organización feature-driven**, donde cada funcionalidad es una unidad vertical independiente y las dependencias siguen reglas claras y predecibles.

El objetivo es construir un sistema:

- Escalable
- Mantenible
- Testeable
- Fácil de refactorizar

Esta sección describe el modelo que guía todas las decisiones estructurales del frontend.

## 📚 Índice

1. [Introducción y modelo mental](/docs/frontend/architecture/intro)  
   Clean Architecture aplicada al frontend y enfoque feature-driven.
2. [Infrastructure layer](/docs/frontend/architecture/infrastructure)  
   Integración con APIs, DTOs, transforms, interfaces y services.
3. [Domain layer](/docs/frontend/architecture/domain)  
   Modelos y reglas de negocio puras.
4. [Application layer](/docs/frontend/architecture/application)  
   Orquestación de flujos con queries, mutations y use-cases.
5. [UI layer](/docs/frontend/architecture/ui)  
   Pages, widgets y componentes enfocados en experiencia de usuario.
6. [Imports y boundaries](/docs/frontend/architecture/shared)  
   Reglas de imports, uso de `shared` y límites entre módulos.

## 🧭 Reglas generales

- Cada capa tiene responsabilidades claras. 
- Cuando respetamos esos límites, el código se vuelve más testeable, predecible y simple de evolucionar.