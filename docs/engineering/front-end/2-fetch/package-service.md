---
slug: /frontend/fetch/packages
title: Packages Service
sidebar_position: 1
---

## Shared API Client
La centralización de la lógica de comunicación mediante un Shared API Client es un pilar estratégico en nuestra arquitectura. Al definir un Puerto HTTP, desacoplamos la lógica de negocio de las implementaciones de red específicas. Esto no solo facilita la gestión de cambios estructurales (breaking changes) desde un punto único, sino que garantiza un manejo estandarizado de respuestas sin afectar el resto de la aplicación.

### Shared API Client: Port
Define la interfaz y los tipos base para el HttpClient. Su propósito principal es desacoplar la lógica de negocio de las implementaciones específicas de red, garantizando que el consumo de APIs sea seguro y consistente en todo el proyecto.

```ts
import { getEnumObjectFromArray, type Safe } from '@repo/utils';

export const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type HttpMethod = (typeof httpMethods)[number];
export const httpMethodEnumObject = getEnumObjectFromArray(httpMethods);

export type TokenProvider = string | (() => string | undefined) | undefined;

export type QueryParams = Record<
  string,
  string | number | boolean | string[] | undefined
>;

export interface HttpClientConfig {
  baseUrl: string;
  token?: TokenProvider;
  defaultHeaders?: Record<string, string>;
}

export interface ZodLikeSchema<T = unknown> {
  safeParse(
    data: unknown
  ): { success: true; data: T } | { success: false; error: unknown };
}

export interface HttpRequestOptions {
  headers?: Record<string, string>;
  authorization?: string | false;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  unwrapEnvelope?: boolean;
}

export type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ExtractEnvelopeData<T> = T extends { success: true; data: infer D }
  ? D
  : never;

export type InferSchemaOutput<TSchema> = TSchema extends ZodLikeSchema<infer T>
  ? T
  : never;

export type InferEnvelopeData<TSchema> = ExtractEnvelopeData<
  InferSchemaOutput<TSchema>
>;

export type InferResponseType<T, TSchema> = TSchema extends ZodLikeSchema
  ? InferEnvelopeData<TSchema>
  : T;

// contrato
export interface HttpClient {
  get<T = unknown, TSchema extends ZodLikeSchema | undefined = undefined>(
    path: string,
    params?: QueryParams,
    options?: HttpRequestOptions,
    schema?: TSchema
  ): Promise<Safe<InferResponseType<T, TSchema>>>;

  post<T = unknown, TSchema extends ZodLikeSchema | undefined = undefined>(
    path: string,
    body?: unknown,
    params?: QueryParams,
    options?: HttpRequestOptions,
    schema?: TSchema
  ): Promise<Safe<InferResponseType<T, TSchema>>>;

  put<T = unknown, TSchema extends ZodLikeSchema | undefined = undefined>(
    path: string,
    body?: unknown,
    params?: QueryParams,
    options?: HttpRequestOptions,
    schema?: TSchema
  ): Promise<Safe<InferResponseType<T, TSchema>>>;

  patch<T = unknown, TSchema extends ZodLikeSchema | undefined = undefined>(
    path: string,
    body?: unknown,
    params?: QueryParams,
    options?: HttpRequestOptions,
    schema?: TSchema
  ): Promise<Safe<InferResponseType<T, TSchema>>>;

  delete<T = unknown, TSchema extends ZodLikeSchema | undefined = undefined>(
    path: string,
    params?: QueryParams,
    options?: HttpRequestOptions,
    schema?: TSchema
  ): Promise<Safe<InferResponseType<T, TSchema>>>;
}
```

### Shared API Client: Adapter
El Adaptador es la implementación concreta del contrato HttpClient. Mientras que el puerto nos dice qué debe hacer, el adaptador define cómo lo hace.

Para el ejemplo a continuacion, se muestra un adaptador utilizando "safeFetch", pero se podria hacer un adaptador para axios, fetch y cualquier otra herramienta que prefieras.

```ts
import type { Safe } from '@repo/utils';
import { safeFetch } from '@repo/utils';
import { prettifyError } from 'zod/v4';
import {
  type HttpClient,
  type HttpClientConfig,
  type HttpMethod,
  type HttpRequestOptions,
  httpMethodEnumObject,
  type InferResponseType,
  type QueryParams,
  type TokenProvider,
  type ZodLikeSchema,
} from '../port/httpClient.port';
import { extractErrorFromRawResponse } from '../../lib/http/httpErrorFormatter';

const PARSE_ERROR_MESSAGE = 'Error al procesar la respuesta';

export class SafeFetchClient implements HttpClient {
  private readonly baseUrl: string;
  private readonly token: TokenProvider;
  private readonly defaultHeaders: Record<string, string>;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.token = config.token;
    this.defaultHeaders = config.defaultHeaders ?? {};
  }

  async get<T = unknown, TSchema extends ZodLikeSchema | undefined = undefined>(
    path: string,
    params?: QueryParams,
    options?: HttpRequestOptions,
    schema?: TSchema
  ): Promise<Safe<InferResponseType<T, TSchema>>> {
    return this.request<T, TSchema>({
      method: httpMethodEnumObject.GET,
      path,
      body: undefined,
      params,
      options,
      schema,
    });
  }

  async post<
    T = unknown,
    TSchema extends ZodLikeSchema | undefined = undefined,
  >(
    path: string,
    body?: unknown,
    params?: QueryParams,
    options?: HttpRequestOptions,
    schema?: TSchema
  ): Promise<Safe<InferResponseType<T, TSchema>>> {
    return this.request<T, TSchema>({
      method: httpMethodEnumObject.POST,
      path,
      body,
      params,
      options,
      schema,
    });
  }

  async put<T = unknown, TSchema extends ZodLikeSchema | undefined = undefined>(
    path: string,
    body?: unknown,
    params?: QueryParams,
    options?: HttpRequestOptions,
    schema?: TSchema
  ): Promise<Safe<InferResponseType<T, TSchema>>> {
    return this.request<T, TSchema>({
      method: 'PUT',
      path,
      body,
      params,
      options,
      schema,
    });
  }

  async patch<
    T = unknown,
    TSchema extends ZodLikeSchema | undefined = undefined,
  >(
    path: string,
    body?: unknown,
    params?: QueryParams,
    options?: HttpRequestOptions,
    schema?: TSchema
  ): Promise<Safe<InferResponseType<T, TSchema>>> {
    return this.request<T, TSchema>({
      method: httpMethodEnumObject.PATCH,
      path,
      body,
      params,
      options,
      schema,
    });
  }

  async delete<
    T = unknown,
    TSchema extends ZodLikeSchema | undefined = undefined,
  >(
    path: string,
    params?: QueryParams,
    options?: HttpRequestOptions,
    schema?: TSchema
  ): Promise<Safe<InferResponseType<T, TSchema>>> {
    return this.request<T, TSchema>({
      method: httpMethodEnumObject.DELETE,
      path,
      body: undefined,
      params,
      options,
      schema,
    });
  }

  // centraliza la logica del fetching con "safeFetch"
  private async request<T, TSchema extends ZodLikeSchema | undefined>({
    method,
    path,
    body,
    params,
    options,
    schema,
  }: {
    method: HttpMethod;
    path: string;
    body?: unknown;
    params?: QueryParams;
    options?: HttpRequestOptions;
    schema?: TSchema;
  }): Promise<Safe<InferResponseType<T, TSchema>>> {
    const url = this.buildUrl(path, params);
    const headers = this.buildHeaders(method, body, options);

    const fetchOptions: RequestInit = {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...(options?.signal ? { signal: options.signal } : {}),
      ...(options?.credentials ? { credentials: options.credentials } : {}),
      ...(options?.cache ? { cache: options.cache } : {}),
    };

    const response = await safeFetch(url, fetchOptions);

    // Network error - pass through
    if (!response.success) {
      return response as Safe<InferResponseType<T, TSchema>>;
    }

    // No schema - return raw response
    if (!schema) {
      return response as Safe<InferResponseType<T, TSchema>>;
    }

    // Parse with schema
    const parseResult = schema.safeParse(response.data);

    if (!parseResult.success) {
      // Try to extract error message from non-envelope response (e.g., raw API errors)
      const extractedError = extractErrorFromRawResponse(response.data);
      if (extractedError) {
        return { success: false, error: extractedError };
      }

      // Log schema validation error for debugging
      console.error(
        prettifyError(parseResult.error as Parameters<typeof prettifyError>[0])
      );
      return { success: false, error: PARSE_ERROR_MESSAGE };
    }

    const unwrapEnvelope = options?.unwrapEnvelope ?? true;

    if (unwrapEnvelope) {
      const envelope = parseResult.data as
        | { success: true; data: unknown }
        | { success: false; error: string };

      if (!envelope.success) {
        return { success: false, error: envelope.error };
      }

      return {
        success: true,
        data: envelope.data as InferResponseType<T, TSchema>,
      };
    }

    return {
      success: true,
      data: parseResult.data as InferResponseType<T, TSchema>,
    };
  }

  private buildUrl(path: string, params?: QueryParams): URL {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue;

        if (Array.isArray(value)) {
          for (const item of value) {
            url.searchParams.append(key, item);
          }
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url;
  }

  private buildHeaders(
    method: HttpMethod,
    body?: unknown,
    options?: HttpRequestOptions
  ): Record<string, string> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
    };

    if (body !== undefined && ['POST', 'PUT', 'PATCH'].includes(method)) {
      headers['Content-Type'] = 'application/json';
    }

    if (options?.authorization === false) {
      // Explicitly disabled
    } else if (typeof options?.authorization === 'string') {
      headers['Authorization'] = options.authorization;
    } else {
      const token = this.resolveToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    return headers;
  }

  private resolveToken(): string | undefined {
    if (typeof this.token === 'function') {
      return this.token();
    }
    return this.token;
  }
}
```

## Api por modulo

A continuación, declaramos una api por cada modulo de nuestro sistema. Este basicamente define con cuales consultas mi aplicacion puede interactuar.
<p align="right"><small>Shared API client viene por inyeccion de dependencias</small></p>

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
import type { Safe } from '@repo/utils';
import type { HttpClient, HttpRequestOptions } from '../http';

const paginatedUsersResponseSchema = buildSafeResponseSchema(
  buildPaginationSchemaForModel(userSchema)
);

export class UserApi {
  private readonly basePath = '/v1/users';
  constructor(private readonly httpClient: HttpClient) {}

  async create(
    input: TCreateUserInput,
    options?: HttpRequestOptions
  ): Promise<Safe<TUser>> {
    return await this.httpClient.post(
      `${this.basePath}/create`,
      input,
      undefined,
      options
    );
  }

  async pagination(
    input: TPaginationInput,
    options?: HttpRequestOptions
  ): Promise<Safe<Pagination<TUser>>> {
    return await this.httpClient.get(
      `${this.basePath}`,
      { page: input.page, perPage: input.perPage },
      {
        ...options,
      },
      paginatedUsersResponseSchema
    );
  }
}
```

## Api general
Api general de nuestra aplicacion, la cual inyectara la Shared Api Client a la API de cada modulo

```tsx
// 📁 package/services/src/API.ts
import { AuthService } from './components/auth';
import { UserApi } from './components/users';
import type { HttpClient, TokenProvider } from './http';
import { SafeFetchClient } from './http';

export interface APIConfig {
  baseURL: string;
  token?: TokenProvider;
  httpClient?: HttpClient;
}

export interface APIService {
  users: UserApi;
}

export class API {
  public readonly v1: APIService;
  public readonly httpClient: HttpClient;

  constructor(config: APIConfig) {
    this.httpClient =
      config.httpClient ??
      new SafeFetchClient({
        baseUrl: config.baseURL,
        token: config.token,
      });

    // Wire services with dependencies
    this.v1 = Object.freeze({
      users: new UserApi(this.httpClient),
    });
  }
}

```

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