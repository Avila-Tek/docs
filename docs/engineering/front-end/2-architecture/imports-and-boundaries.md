---
slug: /frontend/architecture/shared
title: "Shared: Imports y boundaries"
sidebar_position: 6
---

## Use Absolute Paths (obligatorio)

**Regla**

- ✅ Importa usando alias `@/` (rutas absolutas).
- ❌ Evita `../../..` fuera de la carpeta local.

**Por qué**

- Mejora refactors, reduce errores, acelera lectura en PR.

**Ejemplos**

```ts
// ✅ bien
import { Button } from '@/shared/ui/button';
import { ProductCard } from '@/entities/product';
import { AddToCartButton } from '@/features/cart/add-to-cart';

// ❌ mal
import { Button } from '../../../shared/ui/button';
```

## Keep Things Close to Where They’re Used

**Regla**

- ✅ Trata de mantener todo cerca donde se usa dentro del feature correspondiente

- ❌ No mover a shared/ “por si acaso”.

## Shared Domain

**Regla clave sobre shared/domain**

Qué va en shared/domain

Solo objetos base del dominio, tal como existen en la base de datos
Ejemplo:

```ts
// shared/domain/post.ts
export type Post = {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
};
```

Estos objetos:

❌ no tienen lógica

❌ no tienen reglas

❌ no dependen de ningún feature

Son el lenguaje común del sistema.

Manipulación del dominio → siempre en el feature
❌ Incorrecto (shared demasiado específico)

```ts
// shared/domain/post.logic.ts ❌
export function canReplyToPost(user: User, post: Post) {
  ...
}
```

Esto depende del feature reply-to-post.

✅ Correcto (lógica en el feature)

```ts
// features/reply-to-post/domain/reply.logic.ts
export function canReplyToPost(user: User, post: Post) {
  return user.id !== post.authorId;
}
```

Aquí:

User y Post vienen de shared/domain

la regla vive en el feature

el feature sigue siendo independiente y borrable

Regla mental final (para que no haya spaghetti)

Shared define “qué es algo”.
El feature define “qué se puede hacer con eso”.

Si algo en shared:

empieza a tener reglas

cambia por un solo feature

“sabe” de flujos o pantallas

👉 está en el lugar equivocado y debe moverse al feature.

## Que pasa cuando un feature es muy general y se usa en varios features o flujos

El ejemplo mas claro es uploadImage que es un flujo completo pero que puede ser usado distitno dentro de cada feature

**Opción 1 (recomendada)**
convertirlo en un shared capability (shared/application + shared/infrastructure)

Si subir imágenes es una capacidad transversal (no una pantalla), trátalo como “infra + lógica reusable”, no como feature UI.

Estructura sugerida:

```text
shared/
  application/
    mutations/
      uploadImage.mutation.ts
  infrastructure/
    media/
      media.api.ts
      media.service.ts   (solo si hay lógica)
      media.transform.ts (si aplica)
```

Uso desde features:

features/create-post usa uploadImage.mutation.ts

features/reply-to-post usa uploadImage.mutation.ts

✅ Ventaja: reutilizas sin acoplar features
✅ Encaja con tu regla de capas (UI → Application → Infrastructure)

**Opción 2**

Mantenerlo como shared UI primitive + feature adapters

Si lo compartido es principalmente UI (un uploader), separa:

un componente genérico en shared (no sabe de posts/replies)

y un “adaptador” en cada feature (decide dónde guardar, qué validar, etc.)

Ejemplo estructura:

```text
shared/ui/
  media/
  ImageUploader.tsx # genérico

features/
  create-post/
    ui/
      components/
        PostImageUploader.tsx # adapta a create-post

features/
  reply-to-post/
    ui/
      components/
        ReplyImageUploader.tsx # adapta a reply-to-post
```

✅ Shared = “motor genérico”
✅ Feature = “adaptación al flujo”

**Opción 3**

cuando es MUY grande → modules/ o capabilities/

Si “media” ya es un bloque grande (upload, crop, preview, limits, retries, provider fallback), puedes darle una carpeta propia que no es un feature de producto, sino una capability.

```text
capabilities/
  media/
  ui/
  application/
  domain/
  infrastructure/
```

Luego los features consumen capabilities/media/\*.

✅ Útil cuando crece mucho
❗ Ojo: sigue aplicando “no importar entre features”; capabilities es otra categoría

## Manage Dependencies Between Modules (avoid spaghetti)

En una arquitectura **feature-driven**, la promesa es:

> **Puedes borrar un feature completo y el resto del sistema sigue funcionando.**

Si eso no se cumple, usualmente es por:

- imports cruzados entre features
- lógica compartida metida “a la fuerza” en un feature
- `shared` convertido en un basurero (god folder)

Esta sección define reglas para evitarlo.

### 1) Regla base: Features no se importan entre sí

**✅ Permitido**

- `feature-a` puede importar:
  - `shared/*`
  - `domain/*`
  - `infrastructure/*` (o `application/*` según convención)
  - capas internas dentro de `feature-a`

**❌ Prohibido**

- `feature-a` importando `feature-b/*`

**Por qué**

- Eso crea dependencia directa entre features
- Si borras `feature-b`, rompes `feature-a`
- Se vuelve imposible refactorizar sin miedo

> Si necesitas algo de otro feature, eso “algo” no es de ese feature.
> Debe moverse a `shared` o a `domain` (según el caso).

### 2) Regla complementaria: Se respetan las reglas de importación entre capas

Además de “no imports entre features”, se deben cumplir las reglas de capas:

**Flujo permitido (dependencias hacia abajo)**

`UI → Application → Domain → Infrastructure`

**En otras palabras**

- **UI** puede importar Application/Domain (según tu convención), pero no Infrastructure directo si tu estándar lo evita.
- **Application** puede usar Domain + Infrastructure.
- **Domain** NO importa ni React, ni Application, ni Infrastructure.
- **Infrastructure** NO importa UI (React) y NO define reglas de negocio.

> Si rompes estas reglas, el acoplamiento sube y aparece spaghetti.

### 3) “¿Dónde pongo esto?” — regla rápida para evitar imports cruzados

Cuando algo se usa en dos features, pregúntate:

**A) ¿Esto es negocio (meaningful domain)?**

Ejemplos:

- `User`, `Money`, `Permission`, `Plan`, `Subscription`
- reglas como `canEdit`, `hasExceededLimit`

✅ Va a `domain/*`

**B) ¿Esto es UI genérico reutilizable?**

Ejemplos:

- `Button`, `Modal`, `EmptyState`, `Skeleton`
- `FormField`, `DataTable` genérico

✅ Va a `shared/ui/*`

**C) ¿Esto es un helper técnico sin “significado de negocio”?**

Ejemplos:

- `formatDate`, `cn()`, `debounce`, `mapKeys`
- `logger`, `env`, `assert`

✅ Va a `shared/lib/*` o `shared/utils/*`

**D) ¿Esto depende de un flujo específico o de una pantalla?**

Ejemplos:

- `useUsersFilters()`
- `mapUsersToRowsForThisTable()`
- “esta validación solo aplica en el wizard X”

✅ Debe quedarse dentro del feature

**4) Cuándo algo debe ser parte de `shared`**

`shared` existe para **cosas transversales** (cross-cutting) que:

1. se usan en múltiples features, y
2. no tienen un “hogar” más correcto (Domain o Infrastructure), y
3. no amarran a un flujo específico

**Ejemplos buenos de `shared`:**

- UI primitives (shadcn wrappers, design system)
- helpers genéricos (string/date/arrays)
- infra base (queryClient, fetch wrappers si existieran)
- convenciones comunes (tipos utilitarios, constants globales)

**Ejemplos malos para `shared`:**

- `shared/users/*` con cosas del “Users feature”
- `shared/hooks/useEditUserModal.ts`
- `shared/components/UserCard.tsx` si solo un feature lo usa o si codifica reglas de ese feature

**5) Señales de que algo en `shared` se volvió demasiado específico 🚨**

Si una cosa en `shared`…

- tiene el nombre de un feature: `Users`, `Billing`, `Dashboard`, `Checkout`
- importa cosas de un feature
- asume un workflow (“step 2 del wizard”, “tab X”)
- tiene props o parámetros “raros” que solo un feature entiende
- se cambia cada vez que cambia un solo feature

👉 entonces no es shared: es código de feature que se “fugó”.

**6) Qué hacer cuando algo en `shared` se vuelve específico (solución)**

Tienes 3 opciones limpias:

**Opción 1 — Moverlo de vuelta al feature (la más común)**

Si solo un feature lo usa o ya depende del flujo del feature:

- `shared/*` → `features/<feature>/*`

**Opción 2 — Promoverlo a Domain (si en realidad es negocio)**

Si representa un concepto del negocio usado en varios features:

- `shared/*` → `domain/<concept>/*`

**Opción 3 — Dividir: core genérico vs adaptador específico**

Esto es lo más elegante cuando hay una parte realmente reusable.

Ejemplo:

- `shared/ui/DataTable` (genérico)
- `features/users/ui/UsersTable` (adaptador específico que arma columnas/rows)

**Regla:**

- shared = “motor”
- feature = “adaptación”

**7) Regla final para cumplir la promesa feature-driven**

> **Un feature solo puede depender de shared + capas globales.  
> Nunca de otro feature.**

Si necesitas reutilizar algo:

- primero intenta extraerlo a `domain` (si es negocio)
- si no, a `shared` (si es genérico)
- si es específico, se queda dentro del feature

Esto evita spaghetti y mantiene refactors seguros.
