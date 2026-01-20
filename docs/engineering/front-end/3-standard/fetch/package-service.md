---
slug: /frontend/standards/fetch/packages
title: Packages Service
sidebar_position: 1
---

## Shared API Client

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