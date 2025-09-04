---
title: Implementación en resolvers (GraphQL)
sidebar_position: 4
slug: /backend/security/rate-limit/resolver-implementation
keywords: [library, security, rate-limit, resolver, implementation]
---

:::warning

Para empezar es importante haber leído la [Implementación global](/docs/backend/security/rate-limit/global-implementation). Sin la primera parte, esta documentación no les funcionará.

:::

## Context

Para implementar rate limit en los resolvers de GraphQL tenemos que pensar un poco fuera de la caja porque esta arquitectura solo tiene un endpoint llamado `/graphql`. Esto facilita muchos las cosas en diferentes contextos, pero en este lo complica un poquito.

Lo primero que debemos hacer es valernos del `preHandler` que nos entrega Fastify y los rate limiters manuales que podemos crear, la [documentación](https://github.com/fastify/fastify-rate-limit) de Fastify sobre los rate limiters incluye unos ejemplos bastantes sencillos que usaremos, pero en principio para crear un RL manual solo tenemos que hacer:

```ts
// Este aplica las configs globales
const rateLimitChecker1 = fastify.createRateLimit();

// Este sobre-escribe sus propias configs
const rateLimitChecker2 = fastify.createRateLimit({ max: 100, ban: 3 });
```

La función `createRateLimit` nos retorna **otra** función que podemos aplicar en los flujos donde queremos validar un rate limit. Hasta acá nos acompaña Fastify, de acá en adelante somos nosotros y nuestra imaginación.

## La solución

Empecemos por los objetivos que tenemos:

1. Necesitamos una manera fácil y escalable de registrar nuestras configuraciones por resolver.
2. Nos toca crear un rate limit manual por cada configuración que agreguemos.
3. Debemos usar el `preHandler` de Fastify para ejecutar la solución **antes** del controller.
4. No volvernos locos antes de llegar a la solución.

Parece difícil, pero en realidad es bastante sencillo. Antes de ir punto por punto, veamos la estructura de carpetas final:

```json
api
├── src
│   ├── plugins
│   │   ├── routes
│   │   │   ├── graphql.ts
│   │   │   ├── rate-limiting
│   │   │   │   ├── checker.ts         <--- Clase para validar un rate limiter
│   │   │   │   ├── ecosystem.ts       <--- Clase para crear todos los rate limiters
│   │   │   │   ├── graphql-config.ts  <--- Configuraciones por resolver
│   │   │   │   ├── resolvers.ts       <--- Lista de resolvers
│   │   │   │   └── types.ts           <--- Typing de la solución
│   └── server.ts
└── ...
```

### 1. Configuraciones

Empecemos por definir el typing que encontraremos en `types.ts`:

```ts
import { FastifyRateLimitOptions } from '@fastify/rate-limit';
import { RateLimitedResolver } from './resolvers';

export type RateLimitGranularity = 'user' | 'ip-user';

export type RateLimitOptions = {
  config: FastifyRateLimitOptions;
  granularity?: RateLimitGranularity;
};

export type RateLimitPolicy = Record<RateLimitedResolver, RateLimitOptions>;
```

Adicionalmente estaremos creando una lista de resolvers para tener validaciones de typing adicionales, pero lo estaremos agregando en su propio archivo `resolvers.ts` porque esta lista es propensa a crecer:

```ts
export const rateLimitedResolvers = [
  'currentUser',
  'signIn',
  'signUp',
  // ... more
] as const;
export type RateLimitedResolver = (typeof rateLimitedResolvers)[number];
```

Y finalmente creamos nuestras configs en `graphql-config.ts`:

```ts
import { RateLimitPolicy } from './types';

const oneMinuteInMs = 60000;
const twoMinutesInMs = 120000;
const tenMinutesInMs = 600000;

export const graphqlRateLimitPolicy: RateLimitPolicy = {
  currentUser: {
    config: { max: 1000, timeWindow: oneMinuteInMs },
    granularity: 'user',
  },
  signIn: {
    config: { max: 10, timeWindow: oneMinuteInMs },
    granularity: 'user',
  },
  signUp: {
    config: { max: 5, timeWindow: twoMinutesInMs },
  },
};
```

#### Granularidad

En el artículo anterior mencionamos que hacer tracking de usuarios por IP era una mala idea, sin embargo podemos decidir entre usar la IP y el ID del usuario o solo el ID. Esto lo podemos configurar con la propiedad `granularity` que posee los valores `user` y `ip-user`

### 2. Creación de Rate Limits por cada config

Acá tenemos que ponernos creativos, por lo que estaremos creando dos clases en concreto para manejar la situación con gracia:

- `RateLimitChecker`: esta clase encapsulará la creación de un rate limit individual.
- `RateLimitEcosystem`: tendrá la responsabilidad de crear todos los `RateLimitCheckers` y permitirá al preHandler conseguir el que le interese con facilidad.

<div style={{textAlign:'center', margin:'0px 0px 20px 0px'}}>
  <img src="/img/backend/security/rate-limit-class-diagram.png" style={{height: '400px'}} />
</div>

#### RateLimitChecker

Con todas las funciones privadas menos una llamada `check`, es el encargado de contener un solo rate limit y ser usado en el `preHandler` para validar al usuario.

También podemos ver otra vez la función `generateKey`, pero esta vez tiene una funcionalidad adicional en la que toma en cuenta la granularidad.

```ts
import { FastifyInstance, FastifyRequest } from 'fastify';
import { FastifyRateLimitOptions } from '@fastify/rate-limit';
import jwt from '@/lib/jwt';
import { RateLimitGranularity } from './types';

type CheckerResponse = {
  isAllowed: boolean;
  isExceeded: boolean;
  isBanned: boolean;
};

type Checker = (req: FastifyRequest) => Promise<CheckerResponse>;

export class RateLimitChecker {
  private config: FastifyRateLimitOptions;
  private checker: Checker;
  private granularity: RateLimitGranularity;
  private fastify: FastifyInstance;

  constructor(
    fastify: FastifyInstance,
    config: FastifyRateLimitOptions,
    granularity: RateLimitGranularity
  ) {
    this.config = config;
    this.granularity = granularity;
    this.fastify = fastify;
    this.createChecker();

    this.check = this.check.bind(this);
    this.generateKey = this.generateKey.bind(this);
  }

  private createChecker() {
    this.checker = this.fastify.createRateLimit({
      ...this.config,
      keyGenerator: (req) => this.generateKey(req),
    }) as any;
  }

  async check(
    request: FastifyRequest
  ): Promise<{ isAllowed: boolean; status: number }> {
    const response = await this.checker(request);
    const status = this.computeStatus(response);

    return {
      isAllowed: response.isAllowed || !response.isExceeded,
      status,
    };
  }

  private computeStatus(response: CheckerResponse): number {
    if (response.isBanned) return 403;
    if (response.isExceeded) return 429;
    return 200;
  }

  private generateKey(req: FastifyRequest): string {
    // User IP and authentication token
    const userId = this.getUserIdFromRequest(req);
    if (this.granularity === 'user') return userId;

    const ip = this.getIpFromRequest(req);
    return `${ip}-${userId}`;
  }

  private getUserIdFromRequest(req: FastifyRequest): string {
    const token = req.headers.authorization
      ? (req.headers.authorization as string).replace('Bearer ', '')
      : null;

    if (!token) return 'unknown';

    const { _id: userId } = jwt.auth.verify(token);
    return userId;
  }

  private getIpFromRequest(req: FastifyRequest): string {
    if (req.ip) return req.ip;

    const forwardedHeader = req.headers['x-forwarded-for'];
    if (forwardedHeader) {
      const forwarded = Array.isArray(forwardedHeader)
        ? forwardedHeader[0]
        : forwardedHeader;
      return forwarded || 'unknown';
    }

    return 'unknown';
  }
}
```

#### RateLimitEcosystem

Por este lado, la clase `RateLimitEcosystem` solo tiene la función `getRateLimitChecker` como pública, mientras que en `createRateLimiter` podemos ver la manera en que se crea cada instancia en base a las políticas que fueron recibidas por parámetro.

Como pueden ver, esta clase no utiliza las políticas que definimos en `graphql-config.ts` directamente, la intención es instanciarla pasándole las configs por el constructor y que la clase quede desacoplada en caso de querer aplicar bajo otro contexto.

```ts
import { FastifyInstance } from 'fastify';
import { RateLimitChecker } from './checker';
import { RateLimitPolicy } from './types';

export class RateLimitEcosystem {
  private policy: RateLimitPolicy;
  private fastifyInstance: FastifyInstance;
  private rateLimiters: Record<string, RateLimitChecker>;
  private rateLimiterKeys: string[];

  constructor(policy: RateLimitPolicy, fastify: FastifyInstance) {
    this.policy = policy;
    this.fastifyInstance = fastify;
    this.rateLimiterKeys = Object.keys(this.policy);
    this.createRateLimiters();

    this.getRateLimiter = this.getRateLimiter.bind(this);
  }

  private createRateLimiters() {
    this.rateLimiters = Object.keys(this.policy).reduce(
      (acc, key) => ({
        ...acc,
        [key]: new RateLimitChecker(
          this.fastifyInstance,
          this.policy[key].config,
          this.policy[key].granularity ?? 'ip-user'
        ),
      }),
      {}
    );
  }

  getRateLimitChecker(key: string): RateLimitChecker | undefined {
    if (this.rateLimiterKeys.includes(key)) {
      return this.rateLimiters[key];
    }
  }
}
```

### 3. El preHandler

Finalmente llegamos al preHandler, que estaremos colocando en el lugar donde definimos nuestro endpoint `/graphql`, en `routes/graphql.ts`. En caso de tener la definición del endpoint en un lugar diferente, es recomendable cambiar la implementación a lo que presentamos a continuación:

```ts
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { fastifyApolloHandler } from '@as-integrations/fastify';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import { SentryPlugin } from '@/lib/sentry';
import schema from '@/schema/schema';
import { RateLimitEcosystem } from './rate-limiting/ecosystem';
import { graphqlRateLimitPolicy } from './rate-limiting/graphql-config';

declare module 'fastify' {
  interface FastifyInstance {
    graphql: {
      rateLimitEcosystem: RateLimitEcosystem;
    };
  }
}

export interface IApolloServerContext {
  req: FastifyRequest;
  res: FastifyReply;
}

function createApolloServer(fastify: FastifyInstance) {
  const isProduction = process.env.NODE_ENV === 'production';
  const plugins = [
    isProduction
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
    ApolloServerPluginCacheControl({
      defaultMaxAge: 60,
      calculateHttpHeaders: true,
    }),
    fastifyApolloDrainPlugin(fastify),
    new SentryPlugin(),
  ];

  const cache = new InMemoryLRUCache({
    maxSize: 100 * 1024 * 1024, // 100MB
    ttl: 60 * 60 * 8, // 8 hours
  });

  const apolloServer = new ApolloServer<IApolloServerContext>({
    schema,
    introspection: !isProduction,
    includeStacktraceInErrorResponses: !isProduction,
    cache,
    plugins,
  });

  return apolloServer;
}

async function preHandler(
  rateLimitEcosystem: RateLimitEcosystem,
  request: FastifyRequest,
  reply: FastifyReply,
  done
) {
  const body = request.body as { query: string };
  if (!body.query) return done();

  const operation = getOperationFromBody(body);
  const rateLimiter = rateLimitEcosystem.getRateLimitChecker(operation);
  if (!rateLimiter) return done();

  const { isAllowed, status } = await rateLimiter.check(request);
  if (!isAllowed) {
    return reply
      .status(status)
      .send({ error: status ? 'Rate limit exceeded' : 'Access denied' });
  }

  return done();
}

function getOperationFromBody(body: { query: string }) {
  return body.query.split('{')[1]?.split('(')?.[0]?.trim();
}

export default fp(
  async function (fastify: FastifyInstance) {
    const graphqlRateLimitEcosystem = new RateLimitEcosystem(
      graphqlRateLimitPolicy,
      fastify
    );

    fastify.decorate('graphql', {
      rateLimitEcosystem: graphqlRateLimitEcosystem,
    });

    const apolloServer = createApolloServer(fastify);
    await apolloServer.start();

    fastify.route({
      url: '/graphql',
      method: ['GET', 'POST', 'OPTIONS'],
      preHandler: async (request, reply, done) =>
        preHandler(fastify.graphql.rateLimitEcosystem, request, reply, done),
      handler: fastifyApolloHandler(apolloServer, {
        context: async (request, reply) => {
          return { req: request, res: reply, fastify } as any;
        },
      }) as any,
    });
  },
  { name: 'graphql-route' }
);
```
