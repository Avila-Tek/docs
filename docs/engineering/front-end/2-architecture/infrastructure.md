---
slug: /frontend/architecture/infrastructure
title: Infrastructure layer
sidebar_position: 5
---

## Infrastructure — Services, API Clients & Dependency Injection

Esta capa se introduce para **aislar el UI del acceso a datos** y mejorar la **testabilidad** del código que vive alrededor del acceso a APIs. :contentReference[oaicite:2]{index=2}

## Estructura sugerida

```text
/infrastructure/
    api.ts
    dto.ts
    transform.ts
    interfaces.ts
    service.ts
    index.ts
```

### 1. api requests y dtos

API client + DTOs se encuentran en Packages compartidos

En nuestro caso:

La lógica de conexión a APIs

El manejo de headers / auth

El parsing y validación con schemas

Los tipos de entrada/salida (DTOs)

👉 ya viven en los packages, no en la app frontend.

**_Ejemplo_**

```tsx
// @repo/services/UserService
export class UserService {
async create(input: TCreateUserInput): Promise<Safe<TUser>> {
...
const parseResponse = safe(() => userSchema.parse(response.data));
return parseResponse;
}
}
```

- Los “DTOs” vienen directamente de schemas compartidos:

- Haciendo referencia a las inputs y outputs de cada endpoint que tiene interacción

```tsx
// @repo/schemas
export type TCreateUserInput = z.infer<typeof createUserInput>;
export type TUser = z.infer<typeof userSchema>;
```

# PARA MAS LEER COMO HACER FETCH

### 2. transform.ts

Funciones puras para convertir:

DTO → Domain model (y si aplica) Domain → DTO para payloads

```ts
import type { UserDto } from './dto';
import type { User } from '@/domain/user/model';

export function dtoToUser(dto: UserDto): User {
  return {
    id: dto.id,
    status: dto.user_status === 'active' ? 'ACTIVE' : 'BLOCKED',
    dailyRequests: dto.daily_requests,
  };
}
```

### 3. interface.ts

Interfaces TypeScript que describen el contrato que un Service espera.

Normalmente coincide con lo que expone api.ts o el package.

**Por qué existe**

Habilita Dependency Injection:

el service depende de una interface, no de una implementación concreta

Hace unit tests fáciles (inyectas un mock que cumpla el contrato).

```tsx
import type { UserDto } from './dto';

export interface UserApi {
  fetchUser(id: string): Promise<{ data: UserDto }>;
  updateEmail(input: { id: string; email: string }): Promise<void>;
}
```

### 4. service.ts

- Encapsula lógica “alrededor” del acceso a datos:
  - construcción de payload (ej `FormData`)
  - Usa a transforms DTO → Domain
  - compatibilidad entre versiones (feature flags / API versions)
  - composición de múltiples llamadas
- Es buen candidato a unit tests. :contentReference[oaicite:5]{index=5}

```tsx
import type { UserApi } from './interfaces';
import { dtoToUser } from './transform';

export class UserService {
  constructor(private api: UserApi) {}

  async getUser(id: string) {
    const { data } = await this.api.fetchUser(id);
    return dtoToUser(data);
  }
}
```

### 5. index.ts

**Singleton via barrel**

- Como el service es una clase, el post sugiere crear **una instancia** en `index.ts` y exportarla para el resto de la app. :contentReference[oaicite:7]{index=7}

```tsx
import * as userApi from './api';
import { UserService } from './service';

const userService = new UserService(userApi);
export default userService;
```

**Dependency injection (DI)**

- El service **no importa** el API client concreto.
- En su lugar depende de una **interface** (contrato).
- Quien instancia el service decide qué implementación inyectar (real o mock). :contentReference[oaicite:6]{index=6}

**Cuando NO necesitas un Service**

En nuestra arquitectura, NO siempre se crea un service en la capa de infrastructure.

Regla simple

👉 Si no hay lógica, no hay service.

¿Qué significa “no hay lógica”?

Un service NO es necesario cuando el código:

Solo llama a una API

Solo valida success / error

Solo retorna la data

No decide nada

No transforma nada

No coordina múltiples llamadas
