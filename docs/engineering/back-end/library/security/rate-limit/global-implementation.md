---
title: Implementación global
sidebar_position: 4
slug: /backend/security/rate-limit/global-implementation
keywords: [library, security, rate-limit, global, implementation]
---

Fastify nos permite múltiples formas de proteger nuestra API a través de su librería [@fastify/rate-limit](https://github.com/fastify/fastify-rate-limit), la cual contiene una documentación bastante detallada, es recomendado leerla. De igual forma nuestra documentación cubre la explicación básica para poder desarrollar la solución.

## Protegiendo toda la API

La implementación de un rate limiter puede verse por capas, tenemos la posibilidad de proteger toda la API con un solo pedazo de código, pero también podemos aplicar otras réplicas para proteger partes específicas de nuestra aplicación, empecemos con la solución global.

### 🎯 Generación del identificador

Implementar un rate limiter puede ser algo bastante útil, a menos que lo hagas mal, en ese caso solo nos dará un buen dolor de cabeza. Uno de los puntos con los que hay que tener cuidado es la generación del identificador para cada usuario. Este valor permite al rate limiter ubicar al usuario realizando las peticiones en su memoria y revisar si ha excedido alguna política.

Una manera en que pudiésemos detectar el usuario es a través de la IP, pero no tomar en cuenta ningún valor otro sería un error. En el caso de que hayan muchos usuarios detrás de un reverse proxy como lo puede ser un balanceador o Cloudflare, muchos usuarios se encontrarían detrás de una poca cantidad de IPs y los acabaríamos bloqueando a todos... Desastre.

Así entonces, podemos utilizar el `Authorization` con el que mantenemos la sesión del usuario para obtener su ID o cualquier identificador del usuario que hayan decidido guardar en el JWT. Armamos todo lo que hablamos y nos quedaría una función como esta:

```ts
import jwt from '@/lib/jwt';

function generateKey(req: FastifyRequest) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const token = req.headers.authorization
    ? (req.headers.authorization as string).replace('Bearer ', '')
    : 'no-token';

  const userId = jwt.verifyToken(token);

  return `${ip}-${userId}`;
}
```

### ❌ Manejador de errores

Fastify nos permite definir una función que nos facilite manejar el error final. Para este caso tenemos dos casos que considerar:

1. El usuario sobrepasó el rate limiter y está siendo bloqueado hasta que termine el rango de tiempo. En estos casos el status code con el que trabajaremos será el `429 Too Many Requests` para cada request.
2. El rate limiter ya bloqueó al usuario varias veces y decidió ponerse rudo, así que le hizo un banned temporal a nuestro amigo. Acá el status code será `403 Forbidden` para todas sus peticiones.

```ts
function buildErrorResponse(context) {
  if (context.statusCode === 403) {
    return {
      statusCode: 403,
      error: 'Forbidden',
      message: 'You have been banned for exceeding the rate limit.',
      date: Date.now(),
    };
  }

  return {
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'You have exceeded the rate limit.',
    date: Date.now(),
  };
}
```

### 🚀 Wrapping up

Colocando todo junto en un archivo e implementado la libraría de Fastify, nos quedaría lo siguiente:

```ts
// apps/api/src/plugins/middlewares/rate-limit.ts

import { FastifyInstance } from 'fastify';
import rateLimit, { FastifyRateLimitOptions } from '@fastify/rate-limit';

function generateKey(req: FastifyInstance) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const token = req.headers.authorization
    ? (req.headers.authorization as string).replace('Bearer ', '')
    : 'no-token';
  return `${ip}-${token}`;
}

function buildErrorResponse(context) {
  if (context.statusCode === 403) {
    return {
      statusCode: 403,
      error: 'Forbidden',
      message: 'You have been banned for exceeding the rate limit.',
      date: Date.now(),
    };
  }

  return {
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'You have exceeded the rate limit.',
    date: Date.now(),
  };
}

export const autoConfig: FastifyRateLimitOptions = {
  global: true, // Apply rate limit globally
  max: 1000, // Requests per window
  timeWindow: '1 minute',
  ban: 3, // Maximum number of 429 responses before banning client
  keyGenerator: (req) => generateKey(req),
  errorResponseBuilder: (_, context) => buildErrorResponse(context),
};

export default rateLimit;
```

Para que nuestro servidor de Fastify puede utilizar este plugin, debemos agregar su registro en el init del servidor:

```ts
// apps/api/src/server.ts

const fastify = Fastify();

await fastify.register(fastifyAutoload, {
  dir: path.join(__dirname, 'plugins/middlewares'),
});
```
