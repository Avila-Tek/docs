---
slug: /frontend/onboarding/get-started
title: Get started!
sidebar_position: 1
---

**Bienvenido al onboarding de frontend**

Esta documentación está pensada para leerse **en orden**, empecemos por el stack y conozcamos el turbo repo, para luego ver como construimos aplicaciones en producción, para ello seguimos el siguiente orden:
primero entendemos **cómo llegan los datos**, luego **cómo construimos piezas individuales (componentes)**, con los datos y componentes
**cómo ensamblamos todo como un sistema mantenible (Arquitectura)**, por último, **nuestros estandares de coding y calidad**.

## Stack principal

Usamos un stack **moderno y probado en producción**:

- **Next.js**  
  Framework base para routing, rendering y optimizaciones (SSR / RSC cuando aplique).

- **React**  
  UI basada en componentes, composición y estado explícito.

- **TypeScript**  
  Tipado estricto como primera línea de defensa contra errores.

- **React Hook Form**  
  Manejo de formularios de forma performante y declarativa.

- **React Query (@tanstack/react-query)**  
  Capa de acceso a datos remotos (queries, mutations, cache, retries).

- **shadcn/ui**  
  Librería de componentes base, accesibles y extensibles, integrada con Tailwind.

- **Algolia**  
  Librería para implementar buscadores rápidos, escalables y optimizados para grandes volúmenes de datos.

- **Better auth**  
  Librería para manejar autenticación y autorización de forma segura y centralizada.

---

## 1️⃣ Como hacer fetch: cómo llegan los datos a la aplicación

Antes de escribir componentes, necesitamos entender **cómo nos integramos con APIs** y cómo aislamos la UI de los cambios del backend.

Aquí aprenderás:

- Cómo integramos una API
- Cómo llegan los datos a la aplicación
- Cómo usamos queries, mutations y transformaciones
- Por qué la UI nunca consume respuestas crudas

👉 **Ir a:** [Cómo integramos una API](/docs/frontend/fetch)

---

## 2️⃣ Componentes: cómo construimos UI

Con los datos claros, pasamos a la unidad básica del frontend: **el componente**.

Aquí aprenderás:

- Cómo escribimos componentes
- Qué responsabilidades tiene (y cuáles no)
- Cómo mantener componentes simples y reutilizables

👉 **Ir a:** [Cómo escribimos componentes](/docs/frontend/components)

---

## 3️⃣ Nuestra esencia: arquitectura, estándares y calidad

Cuando sabemos traer datos y construir componentes, es momento de **ensamblarlos bajo reglas claras**.

Aquí aprenderás:

- Nuestra arquitectura frontend
- Nuestros estándares de código
- Prácticas de calidad, testing y manejo de errores
- Cómo mantenemos coherencia y escalabilidad en el tiempo

👉 **Ir a:** [Arquitectura](/docs/frontend/architecture)  
👉 **Ir a:** [Nuestros estándares](/docs/frontend/standards)  
👉 **Ir a:** [Calidad](/docs/frontend/quality)

---

## 4️⃣ Fundamentos de Diseño: POO y SOLID
 Las aplicaciones deben ser mantenibles, escalables y fáciles de testear. Aplicando conceptos de Programación Orientada a Objetos y principios SOLID para estructurar la lógica de negocio fuera de los componentes es posible.

### Principios Solid

- **S: Single Responsibility**
  Un componente o clase debe tener una sola razón para cambiar.

- **O: Open/Closed**
  El software debe estar abierto a la extensión, pero cerrado a la modificación.

- **L: Liskov Substitution**
  Las subclases o implementaciones deben poder sustituir a sus clases base sin romper la aplicación.

- **I: Interface Segregation**
  Nadie debería ser forzado a depender de métodos que no usa.

- **D: Dependency Inversion**
  Depende de abstracciones, no de implementaciones concretas.

👉 **Ir a:** [Refactoring Guru](https://refactoring.guru) para aprender mas de software escalable.

👉 **Ir a:** [SOLID](https://www.freecodecamp.org/espanol/news/los-principios-solid-explicados-en-espanol/) para aprender mas de los principios SOLID.

### POO
  Es un paradigma de programación que organiza el software alrededor de "objetos" en lugar de acciones.

👉 **Ir a:** [POO](https://ed.team/blog/que-es-la-programacion-orientada-a-objetos-poo) para aprender mas de este paradigma.

---