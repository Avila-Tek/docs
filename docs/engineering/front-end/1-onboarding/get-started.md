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
