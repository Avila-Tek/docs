---
slug: /frontend/onboarding
title: 🥳 Onboarding
sidebar_position: 1
---

## Stack principal

Usamos un stack **moderno, opinionado y probado en producción**:

- **Turborepo**  
  Monorepo para gestionar múltiples aplicaciones y paquetes.

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

## Clean Architecture adaptada a React

Cada capa tiene una responsabilidad clara.

La idea central es simple:

> **El código que renderiza UI no debe saber cómo funciona el backend ni contener reglas de negocio.**

Esto nos permite:

- cambiar el backend sin romper la UI
- testear lógica sin montar React
- evitar componentes gigantes y frágiles

Más adelante la arquitectura se explica en detalle **[aquí](/docs/frontend/architecture)**, pero desde ya es importante entender **la intención**.

### Testabilidad

El código importante debe poder **testearse sin React, sin DOM y sin mocks complejos**.

Por eso:

- la lógica vive fuera de los componentes
- las funciones del dominio son puras
- los use-cases pueden testearse como funciones normales

**Regla práctica**

> Si algo es difícil de testear, probablemente está en la capa incorrecta.

---

### Resiliencia a cambios del backend

Asumimos que:

- el backend cambia
- los contratos evolucionan
- los nombres de campos no son estables

Por eso:

- la UI **nunca consume respuestas crudas**
- usamos DTOs y transformaciones
- el dominio no depende del formato del API

**Resultado:**  
Un cambio en el backend suele impactar solo en `infrastructure/`, no en toda la app.

---

## Qué debes llevarte de esta sección

Antes de seguir leyendo, quédate con esto:

- No todo va en el componente
- No todo va en un hook “random”
- No todo va en `utils.ts`
