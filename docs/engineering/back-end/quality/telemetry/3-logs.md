---
title: Logs
sidebar_position: 4
slug: /backend/telemetry/logs
keywords: [quality, telemetry, loki, logs, logger, standard]
---

## Estructura de los logs

Ya con Loki integrado en el sistema, es importante que mandemos los logs a Grafana de manera estándar para facilitar su procesamiento y análisis a nivel de la empresa.

Es por eso que cada request debe presentar las siguientes estructuras:

### GraphQL

```json
{
  "context": {
    "architecture": "graphql",
    "requestId": "c957a8c3-03f8-4be8-bafb-f01053b7ec9d",
    "serverInstance": "123", // <--- process.env.RENDER_INSTANCE_ID por ejemplo
  };
  "request": {
    "method": "query", // mutation
    "resolver": "currentUser",
    "operationName": "CURRENT_USER",
    "body": { ... },
    "query": "CURRENT_USER { ... }",
    "userId": "...",
  },
  "content": { ... }, // <--- Customizable
}
```

### REST

```json
{
  "context": {
    "architecture": "rest",
    "requestId": "c957a8c3-03f8-4be8-bafb-f01053b7ec9d",
    "serverInstance": "123", // <--- process.env.RENDER_INSTANCE_ID por ejemplo
  };,
  "request": {
    "method": "GET", // POST, PUT, DELETE
    "endpoint": "/v1/auth/current-user",
    "body": { ... },
    "query": { ... },
    "params": { ... },
    "userId": "...",
  },
  "content": { ... }, // <--- Customizable
}
```

## Detección de los requests

Para automatizar la mayor cantidad de logs dentro de nuestra API, podemos colocar dos hooks de Fastify para detectar los requests y respuestas:

### Detección de nuevos requests

```ts
fastify.addHook('onRequest', async (request, reply) => {
  const architecture = request.url === '/graphql' ? 'graphql' : 'rest'; // <--- Solo necesario si tienen un mix
  const requestId = generateRequestId(); // <--- Consejo: user uuid() + endpoint o resolver
  const body = request?.body;
  const requestContext = {
    architecture,
    requestId,
    serverInstance: process.env.RENDER_INSTANCE_ID;
  };
  const requestInfo = generateRequestInfo(body, architecture);

  Logger.info({
    context: requestContext,
    request: requestInfo,
    content: { incomingRequest: true },
  });
});
```

### Detección de respuestas

```ts
fastify.addHook('onResponse', async (request, reply) => {
  const architecture = request.url === '/graphql' ? 'graphql' : 'rest'; // <--- Solo necesario si tienen un mix
  const requestId = generateRequestId(); // <--- Consejo: user uuid() + endpoint o resolver
  const body = request?.body;
  const requestContext = {
    architecture,
    requestId,
    serverInstance: process.env.RENDER_INSTANCE_ID;
  };
  const requestInfo = generateRequestInfo(body, architecture);

  Logger.info({
    context: requestContext,
    request: requestInfo,
    content: {
      outgoingResponse: true,
      status: reply.statusCode,
    },
  });
});
```

## Reglas generales

Más allá de la detección de requests y respuestas, queda a libertad del desarrollador implementar logs dentro de sus procesos internos como lo vean necesario. Más adelante estaremos estandarizando un poco más en este sector.

:::warning

No se debe enviar ningún tipo de información privada del usuario como su nombre, correo, etc. Esto incluye su token de autentificación.

:::
