---
slug: /frontend/onboarding
title: 🥳 Welcome aboard
sidebar_position: 1
---

**Bienvenido al onboarding de frontend**

Esta documentación está pensada para leerse **en orden**, empecemos por el stack y conozcamos el turbo repo, para luego ver como construimos aplicaciones en producción, para ello seguimos el siguiente orden:
primero entendemos **cómo llegan los datos**, luego **cómo construimos piezas individuales (componentes)**, con los datos y componentes
**cómo ensamblamos todo como un sistema mantenible (Arquitectura)**, por último, **nuestros estandares de coding y calidad**.

## Stack principal

Usamos un stack **moderno y probado en producción**:

- **[Next.js][nextjs_doc]** <br/>
  Framework base para routing, rendering y optimizaciones (SSR / RSC cuando aplique).

- **[React][react_doc]**  
  UI basada en componentes, composición y estado explícito.

- **[TypeScript][typescript_doc]**  
  Tipado estricto como primera línea de defensa contra errores.

- **[React Hook Form][react_hook_form_doc]**  
  Manejo de formularios de forma performante y declarativa.

- **[React Query (@tanstack/react-query)][tasntack_query_doc]**  
  Capa de acceso a datos remotos (queries, mutations, cache, retries).

- **[shadcn/ui][shadcn_doc]**  
  Librería de componentes base, accesibles y extensibles, integrada con Tailwind.

- **[Algolia][algolia_doc]**  
  Librería para implementar buscadores rápidos, escalables y optimizados para grandes volúmenes de datos.

- **[Better auth][better_auth_doc]**  
  Librería para manejar autenticación y autorización de forma segura y centralizada.

- **[Vitest][vitest_doc]**  
  Framework para realizar pruebas unitarias.

- **[Cypress][cypress_doc]**  
  Framework para realizar puebas end to end a los features del sistema.

---

## 1️⃣ Fundamentos de como hacer fetch: cómo llegan los datos a la aplicación

Antes de escribir componentes, necesitamos entender **cómo nos integramos con APIs** y cómo aislamos la UI de los cambios del backend.

Aquí aprenderás:

- Cómo integramos una API
- Cómo llegan los datos a la aplicación
- Cómo usamos queries, mutations y transformaciones
- Por qué la UI nunca consume respuestas crudas

<!-- 👉 **Ir a:** [Cómo integramos una API](/frontend/onboarding/api-integration) -->

---

## 2️⃣ Componentes: cómo construimos UI

Con los datos claros, pasamos a la unidad básica del frontend: **el componente**.

Aquí aprenderás:

- Cómo escribimos componentes
- Qué responsabilidades tiene (y cuáles no)
- Cómo mantener componentes simples y reutilizables

<!-- 👉 **Ir a:** [Cómo escribimos componentes](/frontend/onboarding/components) -->

---

## 3️⃣ Nuestra esencia: arquitectura, estándares y calidad

Cuando sabemos traer datos y construir componentes, es momento de **ensamblarlos bajo reglas claras**.

Aquí aprenderás:

- Nuestra arquitectura frontend
- Nuestros estándares de código
- Prácticas de calidad, testing y manejo de errores
- Cómo mantenemos coherencia y escalabilidad en el tiempo

<!-- 👉 **Ir a:** [Arquitectura](/frontend/onboarding/architecture)   -->
<!-- 👉 **Ir a:** [Nuestros estándares](/frontend/onboarding/standards)   -->
<!-- 👉 **Ir a:** [Calidad](/frontend/onboarding/quality) -->

---
[nextjs_doc]: https://nextjs.org
[react_doc]: https://es.react.dev
[typescript_doc]: https://www.typescriptlang.org
[react_hook_form_doc]: https://react-hook-form.com
[tasntack_query_doc]: https://tanstack.com/query/latest
[shadcn_doc]: https://ui.shadcn.com
[algolia_doc]: https://www.algolia.com/doc
[better_auth_doc]: https://www.better-auth.com/docs/introduction
[vitest_doc]: https://vitest.dev
[cypress_doc]: https://docs.cypress.io/app/get-started/why-cypress