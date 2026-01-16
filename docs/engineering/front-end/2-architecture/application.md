---
slug: /frontend/architecture/application
title: Application layer
sidebar_position: 3
---

# Application Layer (Use-cases, Hooks & Mutations)

La capa Application conecta la UI con el dominio y la infraestructura.

Es donde vive la **lógica de flujo y orquestación**.

**Coordinación de UI-state no visual**: loading/error/success, control de permisos, feature flags.

❌ **No va aquí**

- JSX / componentes visuales (eso es UI).

- Lógica de negocio “pura” (eso es Domain: reglas, invariantes, validaciones duras).

- Detalles de red/SDKs/HTTP (eso es Infrastructure).

---

```text
application/
├── use-cases/
├── queries/
├── mutations/
└── hooks/
```

## Tipos de archivos en Application

### 1. Use-cases

**Qué son:**
Hooks que representan una acción del usuario o un flujo (“Conectar retailer”, “Crear dashboard”, “Pagar”, etc.).  
**Regla:** un use-case puede usar varias queries/mutations internas y devolver una API simple para la UI.
**Responsabilidad**

- Orquestar domain + infrastructure
- Validar reglas de alto nivel
- Retornar resultados explícitos

**Ejemplo**

```ts
// application/use-cases/updateUserEmail.ts
import { userRepository } from '@/infrastructure/user';
import { isValidEmail } from '@/domain/user/logic';

type Result =
  | { ok: true }
  | { ok: false; reason: 'INVALID_EMAIL' | 'USER_NOT_FOUND' };

export async function updateUserEmail(input: {
  userId: string;
  email: string;
}): Promise<Result> {
  const normalizedEmail = input.email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, reason: 'INVALID_EMAIL' };
  }

  const user = await userRepository.getById(input.userId);
  if (!user) {
    return { ok: false, reason: 'USER_NOT_FOUND' };
  }

  await userRepository.updateEmail({
    userId: user.id,
    email: normalizedEmail,
  });

  return { ok: true };
}
```

### 2. Queries (React Query – lectura)

**Qué son**

Hooks basados en React Query que exponen datos listos para UI.

**Responsabilidad**

Leer datos

Manejar cache

Exponer isLoading, error, data

**Regla:** deben devolver **Domain models**, no DTOs crudos.

**Ejemplo**

```tsx
// application/queries/useUserQuery.ts
import { useQuery } from '@tanstack/react-query';
import { userRepository } from '@/infrastructure/user';

export function useUserQuery(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userRepository.getById(userId),
  });
}
```

### 3.Mutations

**Responsabilidad**

Hooks basados en React Query para realizar modificaciones en la base de datos

```tsx
// application/mutations/useUpdateUserEmail.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserEmail } from '../use-cases/updateUserEmail';

export function useUpdateUserEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
```
