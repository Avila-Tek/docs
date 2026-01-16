---
slug: /frontend/architecture/intro
title: Clean Architecture
sidebar_position: 1
---

# 1. Architecture

En esta sección explicamos **el modelo mental único** que usamos para estructurar todo el frontend.

El objetivo no es memorizar carpetas, sino **entender responsabilidades**.

---

## 1.1 Capas

Nuestra arquitectura se organiza en **cuatro capas**, ordenadas de afuera hacia adentro:

# **HACER IMAGEN**

UI (components / pages)

↓

Application (use-cases, queries, mutations)

↓

Domain (entities + domain logic)

↓

Infrastructure (API, DTOs, transforms, services)

Piensa en esto como un **flujo de dependencia**:

- Las capas de abajo **pueden usar** las de arriba
- Las capas de arriba **no saben que existen** las de abajo

**Se propone una arquitectura feature-driven organiza el código alrededor de funcionalidades del producto, no alrededor de tipos técnicos globales.**

En lugar de tener carpetas globales como:

```tsx
components/
services/
hooks/
api/
```

se agrupa todo lo necesario para una funcionalidad concreta dentro de una misma carpeta:

```tsx
features/
    feed/
    user/
    shout/
    media/
```

Cada feature es una unidad vertical completa, que puede contener:

- UI

- lógica de aplicación (use-cases, hooks)

- lógica de dominio

- acceso a datos / infraestructura

Esto permite entender, modificar y escalar una funcionalidad sin tener que navegar todo el proyecto.

### Ejemplo de folder stucture

Para mayor contexto esta aplicación es una plataforma social tipo feed (estilo micro-blogging) donde los usuarios pueden:

- Ver un feed de publicaciones (shouts) con usuarios e imágenes relacionadas

- Visitar perfiles de usuario por handle

- Crear publicaciones y responder a otras publicaciones

- Subir imágenes asociadas a publicaciones o respuestas

```text
src/
  app/
    layout.tsx
    globals.css
    error.tsx
    ...
    not-found.tsx
    (routes)/
      feed/
        page.tsx                  # solo route entry
      users/
          page.tsx
      shouts/
        [shoutId]/
          reply/
            page.tsx
  features/
    feed/
      ui/
        pages/
          FeedPage.tsx            # composición de UI para /feed (page-level)
        widgets/
          FeedWidget.tsx          # bloque grande reutilizable (ej: feed completo)
        components/
          FeedHeader.tsx
          FeedFilters.tsx
      application/
        queries/
          useFeed.query.ts
      domain/
        feed.model.ts
        feed.logic.ts
      infrastructure/
        feed.dto.ts
        feed.transform.ts
        feed.api.ts
        feed.repository.ts

    user/
      ui/
        pages/
          UserProfilePage.tsx     # composición de UI para /users/[handle]
        widgets/
          UserProfileWidget.tsx
        components/
          UserAvatar.tsx
          UserStats.tsx
      application/
        queries/
          useUser.query.ts
          useMe.query.ts
      domain/
        user.model.ts
        user.logic.ts
        user.logic.test.ts
      infrastructure/
        user.dto.ts
        user.transform.ts
        user.api.ts
        user.repository.ts

    shout/
      ui/
        pages/
          ReplyPage.tsx           # composición de UI para /shouts/[id]/reply
        widgets/
          ShoutThreadWidget.tsx
          ReplyComposerWidget.tsx
        components/
          ShoutCard.tsx
          ShoutList.tsx
          ReplyDialog.tsx
      application/
        use-cases/
          replyToShout.usecase.ts
          replyToShout.errors.ts
        hooks/
          useReplyToShout.ts      # compone queries+mutations (React Query)
        mutations/
          useCreateShout.mutation.ts
          useCreateReply.mutation.ts
      domain/
        shout.model.ts
        shout.logic.ts
      infrastructure/
        shout.dto.ts
        shout.transform.ts
        shout.api.ts
        shout.repository.ts

    media/
      application/
        mutations/
          useSaveImage.mutation.ts
      domain/
        media.model.ts
        media.logic.ts
      infrastructure/
        media.dto.ts
        media.transform.ts
        media.api.ts
        media.repository.ts
 shared/
    ui/
      primitives/                 # componentes base cross-feature (Button, Dialog, etc.)
        Button.tsx
        Dialog.tsx
        Input.tsx
      feedback/
        LoadingSpinner.tsx
        EmptyState.tsx
    infra/
      http/
        apiClient.ts              # wrapper fetch/axios (baseUrl, auth, errors)
        http.errors.ts
    lib/
      format.ts
      assert.ts
    test/
      factories/
        createMockFile.ts
```

## Application — Use-cases, Queries & Mutations

### Responsabilidad

La capa de Application es el cerebro operativo del frontend.

Aquí vive el código que:

- orquesta flujos

- decide qué hacer y en qué orden

- maneja reglas de negocio de alto nivel

- conecta UI con Domain e Infrastructure

### Qué vive aquí

- Use-cases (acciones del sistema: “crear”, “actualizar”, “enviar”)

- React Query hooks (useQuery, useMutation)

- Manejo de errores de negocio (no técnicos)

**_Ejemplo: Use-case_**

```tsx
// application/use-cases/updateUserEmail.ts
export async function updateUserEmail(input: {
  userId: string;
  email: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();

  if (!normalizedEmail.includes('@')) {
    return { ok: false as const, reason: 'INVALID_EMAIL' as const };
  }

  await userRepository.updateEmail({
    userId: input.userId,
    email: normalizedEmail,
  });

  return { ok: true as const };
}
```

📌 Claves:

- No hay JSX

- No hay estado visual

- El resultado es explícito (ok / error)

## Domain — Entities & Domain Logic

### Responsabilidad

El Domain representa las reglas del negocio, independientes de:

React

Next.js

APIs

librerías externas

Aquí se define qué es válido y qué no en el sistema.

- Qué vive aquí

- Entidades del dominio (User, Order, Request, etc.)

- Funciones puras que operan sobre esas entidades

- Reglas e invariantes del negocio

Ejemplo;

```tsx
// domain/user/user.ts
export type User = {
  id: string;
  status: 'ACTIVE' | 'BLOCKED';
  dailyRequests: number;
};

export function isBlocked(user: User) {
  return user.status === 'BLOCKED';
}

export function hasExceededDailyLimit(user: User) {
  return user.dailyRequests >= 100;
}
```

📌 Características del Domain:

- Funciones puras

- Sin efectos secundarios

- Fácil de testear sin mocks

## Infrastructure — API, DTOs, Transforms & Services

### Responsabilidad

Infrastructure es la única capa que habla con el mundo externo.

Se encarga de:

consumir APIs

definir DTOs (Data Transfer Objects)

transformar datos del backend al dominio

ocultar detalles técnicos al resto del sistema

Qué vive aquí

- api.ts → requests puros de terceros que no esten en package services

- dto.ts → contratos del backend

- transform.ts → mapping DTO → Domain

- services o repositories si aplica

Ejemplo

```tsx
// infrastructure/user/dto.ts
export type UserDto = {
  id: string;
  status: 'active' | 'blocked';
  daily_requests: number;
};

// infrastructure/user/transform.ts
import type { UserDto } from './dto';
import type { User } from '@/domain/user/user';

export function userFromDto(dto: UserDto): User {
  return {
    id: dto.id,
    status: dto.status === 'active' ? 'ACTIVE' : 'BLOCKED',
    dailyRequests: dto.daily_requests,
  };
}

// infrastructure/user/index.ts
import { fetchUser } from './api';
import { userFromDto } from './transform';

export async function getUser(userId: string) {
  const dto = await fetchUser(userId);
  return userFromDto(dto);
}
```

📌 Resultado:

- La UI nunca ve daily_requests

- El dominio nunca ve active / blocked

- Los cambios del backend quedan aislados aquí
