---
slug: /frontend/architecture/infrastructure
title: Infrastructure layer
sidebar_position: 2
---

## Infrastructure — Services, API Clients & Dependency Injection

Esta capa se introduce para **aislar el UI del acceso a datos** y mejorar la **testabilidad** del código que vive alrededor del acceso a APIs.

Es el punto de entrada/salida de los datos de la aplicación

```text
UI
 ↓
Application   ← aquí
 ↓
Infrastructure
 ↓
Packages (services + schemas)
```

## Estructura sugerida

```text
/AnyFeature
  ...
  /infrastructure/
      api.ts
      dto.ts
      transform.ts
      interfaces.ts
      service.ts
      index.ts
```

### 1. api requests y dtos

API client + DTOs se encuentran en Packages compartidos, para ello leer:
  
  👉 [/frontend/standards/fetch/packages](/docs/frontend/fetch/packages)

Por lo tanto:

- La lógica de conexión a APIs

- El manejo de headers / auth

- El parsing y validación con schemas

- Los tipos de entrada/salida (DTOs)

👉 Ya viven en los packages, no en la app frontend.

**Un resumen muy corto de ejemplo**

```tsx
// @repo/packages/services/UserService

export class UserService {
  async create(input: TCreateUserInput): Promise<Safe<TUser>> {
    ...
    const parseResponse = safe(() => userSchema.parse(response.data));
    return parseResponse;
  }
}
```

- Los “DTOs” son los contratos vienen directamente de schemas compartidos:

- Haciendo referencia a las inputs y outputs de cada endpoint que tiene interacción

```tsx
// @repo//packages/schemas
export type TCreateUserInput = z.infer<typeof createUserInput>;
export type TUser = z.infer<typeof userSchema>;
```

👉 Para mas leer **[como hacer fetch](/docs/frontend/fetch)**

### 2. transform.ts

Bien ya tenemos datos, pues ejecutamos el endpoint ahora bien no queremos acoplar el front al back por lo que aqui se realizan los transform necesarios de los DTOs a los Domains correspondientes

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

Las **interfaces** definen el **contrato que un Service espera**, no cómo se implementa.

- No contienen lógica.

- No hacen fetch.

- No transforman datos.

👉 Solo dicen: _“esto es lo que necesito para funcionar”_.

**Por qué existe**

Con interface.ts, el service no depende de una implementación, sino de un contrato.

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

El **service** es el lugar donde vive la **lógica alrededor del acceso a datos**.

No es UI.  
No es un endpoint.  
No es dominio puro.

Es el punto intermedio donde **se toman decisiones técnicas** antes o después de hablar con una API.

**_ ¿Qué problema resuelve `service.ts`?_**

Sin un service, esta lógica suele terminar en:

- hooks de React Query
- componentes
- handlers de UI

Eso provoca:

- código difícil de leer
- lógica duplicada
- tests complicados
- acoplamiento entre UI y datos

El `service` existe para **sacar esa lógica del UI** y ponerla en un lugar estable y testeable.

**Qué tipo de lógica vive en un service**

Un service **no hace el fetch directamente** (eso ya lo hacen los packages o `api.ts`).  
Un service **orquesta** lo que pasa alrededor del fetch.

**Ejemplos típicos:**

- Construcción de payloads  
  (ej: `FormData`, normalización de inputs)

- Transformación de datos  
  DTO → Domain (usando `transform.ts`)

- Compatibilidad y decisiones técnicas

  - versiones de API
  - feature flags
  - fallback de endpoints

- Composición de múltiples llamadas  
  (ej: crear post → subir imagen → asociar imagen)

**Ejemplo**

```ts
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

**Qué está pasando aquí**

- El service recibe una API por constructor (no la importa directamente)

- Llama al método necesario (fetchUser)

- Convierte el DTO a un Domain model

- Devuelve un objeto que el resto del sistema puede usar sin conocer el backend

**Por qué el service NO importa api.ts directamente**

Porque el service no debe conocer implementaciones, solo contratos.

```ts
constructor(private api: UserApi) {}
```

Esto permite:

- cambiar la API sin tocar el service

- inyectar mocks en tests

- aislar la lógica del acceso a datos

### 5. index.ts

**Singleton via barrel**

- Como el service es una clase, el se sugiere crear **una instancia** en `index.ts` y exportarla para el resto de la app.

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

**Regla simple**

👉 Si no hay lógica, no hay service.

¿Qué significa “no hay lógica”?

**Un service NO es necesario cuando el código:**

- Solo llama a una API

- Solo valida success / error

- Solo retorna la data

- No decide nada

- No transforma nada

- No coordina múltiples llamadas

### En resumen

```text
interface.ts   → define el contrato
transform.ts   → adapta datos (DTO → Domain)
service.ts     → orquesta todo lo anterior
```

## Cache
  La cache es fundamental para aumentar la velocidad y el rendimiento de las aplicaciones al almacenar temporalmente datos de acceso frecuente. Esto nos permite reducir los tiempos de espera del usuario, pues no tiene que esperar al resultado de una consulta que ya ha realizado previamente.

### Importancia del cache
- Velocidad de carga.
- Experiencia del usuario.
- Reducción de carga en Servidores.
- Ahorro de recursos.

### Cache en TanStack Query
  TanStack query maneja por defecto el caching de data. Para entender como funcionan, se tiene que entender 2 conceptos:

- **[Query keys](https://tanstack.com/query/v5/docs/framework/react/guides/query-keys)**: Es una opcion que especifica la forma en que TanStack Query rastreara la data en el cache (si no consigue la data en el cache o la data es obsoleta, entonces realiza una consulta a la base de datos).

```tsx
  // Lista de todos
  useQuery({ queryKey: ['todos'], ... })
  // Todos filtrados por status, (Si tu consulta depende de una variable, especificala en tu query keys).
  useQuery({ queryKey: ['todos', status], ... })
  // Paginacion de todos, (mismo concepto del ejemplo anterior, pero con variables serializables).
  useQuery({ queryKey: ['todos', JSON.stringify(pagination)], ... })
```

- **[StaleTime](https://tanstack.com/query/v4/docs/framework/react/guides/important-defaults)**: Es una opcion que determina durante cuanto tiempo una data es considerada como "fresca" antes de que sea marcada como "obsoleta" (si una data es obsoleta, se realiza una query para refrescar la data).

```tsx
  // No se hara uso de cache, siempre traera data nueva.
  useQuery({ staleTime: 0, ... })
  // La data nunca sera considerada obsoleta.
  useQuery({ staleTime: 'static', ... })
  // La data se considera obsoleta pasado 1 minuto
  useQuery({ staleTime: 60000 , ... })
```

- **[Prefetching](https://tanstack.com/query/v4/docs/framework/react/guides/prefetching)**: El prefetching nos permite triggerear una consulta en segundo plano y almacenar en cache el resultado de la respuesta, para su posterior uso. Para mas informacion [leer](/docs/frontend/fetch/queries#queries).

## Testing
👉 **Ir a:** [test de infraestructura](/docs/frontend/quality/testing/testing-by-layer/infrastructure-test)
