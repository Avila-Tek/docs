---
title: Integración con Sentry
sidebar_position: 4
slug: /backend/errors/sentry
keywords: [quality, errors, sentry]
---

## Instalación de Sentry

Las únicas dos librerías que deben instalar del ecosistema de Sentry son `@sentry/node` y `@sentry/profiling-node`. La primera es la dependencia principal del SDK, la segunda nos ayudará a tener mayor visibilidad en el rendimiento de nuestras aplicaciones.

```bash
npm install @sentry/node @sentry/profiling-node --save
```

Por otra parte, para efectos del resto de la implementación, deben tener instalados en el proyecto las siguientes dependencias para poder hacer uso de los plugins en Fastify.

- `fastify-plugin`
- `@fastify/autoload`

```bash
npm install fastify-plugin @fastify/autoload --save
```

## Configuración del plugin y SDK

Lo primero que debemos hacer es crear un plugin de Fastify para poder cargar el SDK de Sentry. La estructura de carpetas debe tener la siguiente forma:

```bash
api
├── src
│   ├── plugins
│   │   ├── errors
│   │   │   ├── handler.ts     <--- Handler central de errores (docu de centralización)
│   │   │   ├── not-found.ts   <--- Manejador de errores 404 (docu en desarrollo)
│   │   │   └── sentry.ts      <--- Plugin de Sentry
│   └── server.ts
└── ...
```

El archivo `sentry.ts` debe verse de la siguiente forma:

```ts
// apps/api/src/plugins/errors/sentry.ts

import fp from 'fastify-plugin';
import * as Sentry from '@sentry/node';
import { FastifyInstance } from 'fastify';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

function sentryPlugin(fastify: FastifyInstance) {
  if (process.env.NODE_END !== 'production') return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: process.env.RELEASE,
    enableLogs: true,
    tracesSampleRate: 0.3, // 30% de los logs
    sendDefaultPii: true,
    integrations: [
      Sentry.rewriteFramesIntegration({ root: global.__rootdir__ }),
      Sentry.httpIntegration(),
      Sentry.mongoIntegration(),
      nodeProfilingIntegration(),
    ],
    profileSessionSampleRate: 0.3, // 30% de visibilidad sobre el rendimiento
    profileLifecycle: 'trace', // Modo de uso donde el análisis es automático
  });

  Sentry.setupFastifyErrorHandler(fastify);

  console.log('🚨 Sentry plugin loaded!');
}

export default fp(sentryPlugin);
```

La variable `Sentry_DSN` la conseguirán en el momento que creen el proyecto en la plataforma, debe verse de la siguiente forma:

```
https://<PUBLIC_KEY>@o<ORGANIZATION_ID>.ingest.us.sentry.io/<PROJECT_ID>
```

## Server

Una vez esté configurado el SDK de Sentry, vamos al archivo server.ts e incluimos las siguientes líneas en la fase de carga de plugins, justo después de definir el servidor:

```ts
const server = Fastify({ ... });

await server.register(fastifyAutoload, {
  dir: path.join(__dirname, 'plugins/errors'),
});
```

De esta manera, Sentry ya estaría integrado para detectar todos los errores no manejados dentro del servidor.

## Enviando errores manejados

Idealmente nuestra plataforma nunca debería tener errores que no sean atajados de ninguna forma. Siendo este el caso, la integración que llevamos hasta el momento rara vez debería activarse. Entonces, ¿Dónde está el uso real?

### Handler global

Para este punto, ya deberíamos haber desarrollado nuestro `handler` global de errores para toda la API ([documentación](/docs/backend/errors/centralization)). En esta función es donde podremos mandar excepciones a Sentry de manera voluntaria de la siguiente forma:

```ts
Sentry.captureException({ ... })
```

Con esto en mente, podemos agregar una nueva función a toda la solución para manejar a Sentry:

```ts
export function handleError(
  error: Error | Exception,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const date = new Date();
  const stack = generateCleanStackTrace(error);

  sendExceptionToSentry(error, stack);

  // More code...
}

function sendExceptionToSentry(
  request: FastifyRequest,
  error: Error | Exception,
  stack: string
) {
  if (process.env.NODE_ENV !== 'production') return;

  const isHandledError = error instanceof Exception;
  const excludedStatuses = [400, 401, 404, 409, 422, 429];
  if (isHandledError && excludedStatuses.includes(error.status)) return;

  const date = new Date();

  const requestContext = getRequestContext(request);

  if (error instanceof Error) {
    return Sentry.captureException({
      context: {
        type: 'unhandled',
        date,
      },
      request: requestContext,
      error: {
        message: error?.message,
        status: 500,
        stack,
      },
    });
  }

  Sentry.captureException({
    context: {
      type: 'handled',
      date,
    },
    request: requestContext,
    error: {
      title: error.data.title,
      status: error.data.status,
      type: error.data.type,
      stack,
    },
  });
}
```

Hay dos puntos importantes en esta función:

1. La función `getRequestContext` no fue implementada intencionalmente. La idea es que cada equipo seleccione los parámetros que consideren importantes para poder debuggear los errores en Sentry. Deben tomar en cuenta que la recomendación es enviar una cantidad de parámetros justa y necesaria.
2. Se pueden agregar condiciones adicionales al sistema, como la omisión
