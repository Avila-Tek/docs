---
slug: /frontend/standards/queries
title: Query
sidebar_position: 7
---

## Packages service

Centralizar las configuraciones básicas para nuestras consultas (conocido como <a href="https://profy.dev/article/react-architecture-api-client" target="_blank">Client Api Shared</a>) es esencial, ya que nos permite implementar distintos breaking changes con solo modificar unos pocos archivos.

Para ello, usaremos una clase API la cual se encargará de instanciar todos nuestros servicios y pasarles configuraciones generales como, por ejemplo, una URL base y el token del usuario.

```tsx
// 📁 package/services/src/API.ts
import { UserService } from './components/users';

export type APIConfig = {
  baseURL: string;
  token?: string;
};

export type APIService = {
  users: UserService;
};

export class API {
  public v1: APIService;

  constructor(private config: APIConfig) {
    this.v1 = Object.freeze({
      users: new UserService(this.config.baseURL, this.config.token),
    });
  }
}
```

"A continuación, declaramos los servicios que contienen las consultas de la aplicación. Al actuar como intermediario entre el backend y el frontend, el servicio nos permite transformar los datos del formato retornado por el servidor al formato utilizado en el front, y viceversa.

```tsx
// 📁 package/services/components/users.ts
import {
  buildPaginationSchemaForModel,
  buildSafeResponseSchema,
  TPagination as Pagination,
  TCreateUserInput,
  TPaginationInput,
  TUser,
  userSchema,
} from '@repo/schemas';
import { Safe, safe, safeFetch } from '@repo/utils';
import { z } from 'zod';
import { TRequestConfig } from '../types';

export class UserService {
  constructor(
    private baseUrl: string,
    private token?: string
  ) {
    this.create.bind(this);
  }

  async create(
    input: TCreateUserInput,
    config?: TRequestConfig
  ): Promise<Safe<TUser>> {
    const response = await safeFetch(
      new URL(`${this.baseUrl}/v1/users/create`),
      {
        body: JSON.stringify(input),
        ...(config ?? {}),
        headers: {
          ...(config?.headers ?? {}),
          ...(typeof this.token !== 'undefined'
            ? { Authorization: `Bearer ${this.token}` }
            : {}),
        },
      }
    );
    if (response.success) {
      const parseResponse = safe(() => userSchema.parse(response.data));
      return parseResponse;
    }
    return response;
  }

  async pagination(
    input: TPaginationInput,
    config?: TRequestConfig
  ): Promise<Safe<Pagination<TUser>>> {
    const qs = new URLSearchParams([
      ['page', String(input.page)],
      ['perPage', String(input.perPage)],
    ]);
    const response = await safeFetch(
      new URL(`${this.baseUrl}/v1/users?${qs.toString()}`),
      {
        method: 'GET',
        ...(config ?? {}),
        headers: {
          ...(config?.headers ?? {}),
          ...(typeof this.token !== 'undefined'
            ? { Authorization: `Bearer ${this.token}` }
            : {}),
        },
      }
    );
    if (!response.success) {
      return response;
    }

    const safeParsedData = buildSafeResponseSchema(
      buildPaginationSchemaForModel(userSchema)
    ).safeParse(response.data);

    if (!safeParsedData.success) {
      console.error(z.prettifyError(safeParsedData.error));
      return { success: false, error: 'Internal Server Error' };
    }

    if (!safeParsedData.data.success) {
      console.error(safeParsedData.data.error);
      return { success: false, error: 'Internal Server Error' };
    }

    return {
      success: true,
      data: safeParsedData.data.data,
    };
  }
}
```
<p align="right"><small>- Ahora podemos formatear la data retornada por el back al type de nuestro dominio 🤯🤯</small></p>

Por último, instanciamos nuestra clase para así poder compartir su configuración con todas las consultas de nuestra app.
```tsx
// 📁 /apps/clients/src/services/user/queries.ts
import { API } from '@repo/services';

let api: API | null = null;

export function getAPIClient(token?: string): API {
  let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  baseURL += '/api';
  if (!api) {
    api = new API({ token, baseURL });
  }
  return api;
}
```

Ahora solo queda construir nuestros objetos Queries en cada una de nuestra app para que configuremos React.Query con nuestra api

```tsx
// 📁 /apps/clients/src/services/user/queries.ts
import { TCreateUserInput, TPaginationInput, TUser } from '@repo/schemas';
import { Safe } from '@repo/utils';
import { queryOptions } from '@tanstack/react-query';
import { getAPIClient } from '@/src/lib/api';

export const usersQueries = {
  pagination({ page, perPage }: TPaginationInput) {
    return queryOptions({
      queryKey: ['pagination', String(page), String(perPage)],
      async queryFn() {
        const api = getAPIClient();
        const data = await api.v1.users.pagination({ perPage, page });
        if (!data.success) {
          throw new Error(data.error);
        }
        return data.data;
      },
    });
  },
};
```

## React Query

Configurar React Query consiste de 2 pasos, (1) crear el client y (2) instanciar el Contexto.

* Instanciar el contexto
```tsx
'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import type * as React from 'react';
import { getQueryClient } from '@/src/lib/get-query-client';

export function QueryClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

* Crear el client
```tsx
import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
```

## Queries

* Obtener data del servidor.

Primero realizaremos un prefetching de los datos que deseamos desde el servidor; esto cargará nuestro caché con la respuesta de la consulta deseada.

```tsx
// 📁 /app/client/src/app/users/page.tsx
import { paginationInputSchema } from '@repo/schemas';
import React from 'react';
import z from 'zod';
import { getQueryClient } from '@/src/lib/get-query-client';
import { usersQueries } from '@/src/services/user/queries';
import { UsersQuery } from './users-query';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: Props) {
  const qs = await searchParams;
  const queryClient = getQueryClient();
  const parsed = paginationInputSchema.safeParse(qs);
  if (!parsed.success) {
    return (
      <p className="error">
        Error parsing params {z.prettifyError(parsed.error)}
      </p>
    );
  }
  void queryClient.prefetchQuery(
    usersQueries.pagination({
      page: parsed.data.page,
      perPage: parsed.data.perPage,
    })
  );
  return <UsersQuery page={parsed.data.page} perPage={parsed.data.perPage} />;
}
```
<p align="right"><small>- Al hacer un prefetching, la data "Viajará" a nuestras queries en client-side 😊</small></p>

Y ahora procedemos a leer la data del cache sin problema alguno, para ello hacemos uso de useSuspenseQuery (también podríamos haber hecho uso de useQuery).

```tsx
// 📁 apps\client\src\app\users\users-query.tsx
'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';
import { usersQueries } from '@/src/services/user/queries';

export function UsersQuery({
  page,
  perPage,
}: {
  page: number;
  perPage: number;
}) {
  const query = useSuspenseQuery(usersQueries.pagination({ page, perPage }));
  if (query.error) {
    <p className="error">{query.error.message}</p>;
  }
  return <code>{JSON.stringify(query.data, null, 2)}</code>;
}
```
<p align="right"><small>- El prefetching funcionará siempre y cuando sus queryKeys sean iguales, en este ejemplo lo declaramos en el objeto userQueries 😜</small></p>

* Obtener desde el client.

Haremos uso de useQuery. Es importante mencionar que, si hiciéramos un prefetching desde el servidor de ciertos datos y se consultan en el cliente con useQuery, recibiríamos los datos de la caché, tal como en el caso de useSuspenseQuery. La diferencia entre ambas es cómo se gestiona el estado de carga (loading state).

```tsx
// 📁 apps\client\src\app\users\users-query.tsx
const query = useQuery(usersQueries.pagination({ page, perPage }));
```

* Manejar el loading state

Con useQuery, el estado de carga (loading state) se manejaría de forma manual; en cambio, con useSuspenseQuery, se haría a través de React.Suspense.

## Mutations

Declaramos el servicio para mutaciones, el cual se encarga de parsear y comunicarse con la API.

```tsx
// 📁 /apps/clients/src/services/user/mutations.ts
import { TCreateUserInput } from '@repo/schemas';
import { Safe } from '@repo/utils';
import { mutationOptions } from '@tanstack/react-query';
import { getAPIClient } from '@/src/lib/api';

export const userMutations = {
  create() {
    return mutationOptions<Safe<TUser>, Error, TCreateUserInput>({
      mutationKey: ['create'],
      async mutationFn(variables) {
        const api = getAPIClient();
        const safeResult = await api.v1.users.create(variables);
        return safeResult;
      },
      onError(error) {
        console.error(error);
      },
    });
  },
};
```