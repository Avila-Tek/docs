---
slug: /frontend/architecture/intro
title: Feature Sliced
sidebar_position: 1
---

# Arquitectura por Capas

## Feature Sliced architecture

Esta documentación describe la estructura de carpetas y los principios de organización del proyecto,
basada en capas de responsabilidad, slices funcionales y segmentos internos.
Puede consultar la documentación oficial de [FSD](https://feature-sliced.github.io/documentation/docs/get-started/overview).

![feature sliced](/img/frontend/architecture/feature-sliced.png)

### De acuerdo a la documentación oficial:

Pictured above: three pillars, labeled left to right as "Layers", "Slices", and "Segments" respectively.

The "Layers" pillar contains seven divisions arranged top to bottom and labeled "app", "processes", "pages", "widgets", "features", "entities", and "shared". The "processes" division is crossed out. The "entities" division is connected to the second pillar "Slices" in a way that conveys that the second pillar is the content of "entities".

The "Slices" pillar contains three divisions arranged top to bottom and labeled "user", "post", and "comment". The "post" division is connected to the third pillar "Segments" in the same way such that it's the content of "post".

The "Segments" pillar contains three divisions, arranged top to bottom and labeled "ui", "model", and "api".

:::info
La capa Processes esta deprecada
:::

---

## Layers (Capas)

Las capas representan niveles de abstracción y responsabilidad dentro del sistema.
Cada capa tiene un propósito claro y reglas implícitas de dependencia.

En este proyecto utilizamos las siguientes capas:

### app

- Composición por rutas (Next.js)
- Wiring general de la aplicación
- Providers globales
- Glue code (integración entre capas)

Nota: esta capa no contiene lógica de negocio.

### widgets

- Bloques de UI grandes y reutilizables
- Ensamblan múltiples features y/o entities
- Representan secciones completas de la interfaz


### features

- Acciones del usuario / casos de uso
- Lógica orientada a comportamiento
- Representan qué puede hacer el usuario

Ejemplos:

- Login
- Agregar al carrito
- Actualizar perfil

### entities

- Modelos del dominio
- UI, estado y lógica asociada a una entidad
- Representan qué es el sistema

Ejemplos:

- User
- Product
- Order

### shared

- Código reutilizable y agnóstico al dominio
- No depende de otras capas

Incluye:

- UI base
- Utilidades
- Configuración
- Tipos
- Helpers

---

## Slices

Dentro de cada layer, el código se organiza por slices,
que representan un tema u objeto específico del dominio o del producto.

Ejemplos:

- features/auth/login
- entities/user
- widgets/header

Principio clave:
Una slice debería ser idealmente removible sin romper otras slices,
salvo aquellas que dependen explícitamente de su API pública.

---

## Segments

Dentro de una slice, el código se separa por tipo de responsabilidad,
usando segmentos bien definidos.

Segmentos estándar:

- ui  
  Componentes de renderizado (React components)

- model  
  Estado, lógica de negocio, hooks, schemas

- api  
  Contratos, tipos y llamadas a APIs

- lib  
  Helpers internos de la slice

- index.ts  
  API pública de la slice (único punto de exportación)

---

## Ejemplo de Slice con Segments

```txt
features/
  auth/
    login/
      ui/
        LoginForm.tsx
      model/
        schema.ts
        useLoginForm.ts
      api/
        login.ts
        types.ts
      lib/
        mapError.ts
      index.ts
```
