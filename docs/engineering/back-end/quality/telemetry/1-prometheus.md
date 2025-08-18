---
title: Prometheus
sidebar_position: 4
slug: /backend/telemetry/prometheus
keywords: [quality, telemetry, prometheus, infrastructure]
---

## Introducción

Como mencionamos en la [introducción](/docs/backend/quality/telemetry) de telemetría, Prometheus lo implementamos en nuestras APIs para lograr un monitoreo a nivel de infraestructura. Las métricas que nos interesarán a priori serán:

- Cantidad de requests por dominio (web o mobile).
- Duración de requests por dominio y endpoint.
- Porcentaje de uso del procesador.
- Porcentaje de uso de la memoria.
- Tamaño total del NodeJS heap.
- Porción utilizada del NodeJS heap.

### Implementación

Antes de empezar, veamos la organización de carpetas y archivos que tendremos:

```json
api
├── src
│   ├── plugins
│   │   ├── integrations
│   │   │   │   metrics
│   │   │   │   ├── index.ts     <--- Plugin de Fastify
│   │   │   │   ├── monitor.ts   <--- Clase InfrastructureMonitor
│   │   │   │   ├── register.ts  <--- Prometheus
│   │   │   │   └── utils.ts     <--- Funciones adicionales
│   └── server.ts
└── ...
```

Iremos explicando lo que debe ir en cada uno de estos archivos en los siguientes apartados (la lógica de las carpetas vendrá en una siguiente documentación sobre arquitectura):

#### 1. Registro de Prometheus

Primero vamos con la función para crear el registro de Prometheus y las métricas que estarán escuchando:

```ts
// ./apps/api/src/plugins/integrations/metrics/register.ts

import client from 'prom-client';

const lokiAppName = process.env.LOKI_APP_NAME;
const renderInstanceId = process.env.RENDER_INSTANCE_ID;

export function createInfrastructureMetrics() {
  const register = new client.Registry();
  register.setDefaultLabels({
    instance: renderInstanceId || 'default',
    jobName: lokiAppName || 'default',
  });

  // Metrics initialization
  client.collectDefaultMetrics({ register, prefix: '' });

  const requestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests processed by API, labeled by domain.',
    labelNames: ['domain'],
  });
  const requestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Histogram of HTTP request duration in seconds, labeled by path and method.',
    labelNames: ['domain', 'route', 'method', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  });
  const cpuUsage = new client.Gauge({
    name: 'process_cpu_usage_percent',
    help: 'CPU usage percentage',
  });
  const memoryUsage = new client.Gauge({
    name: 'process_memory_usage_bytes',
    help: 'Memory usage in bytes',
  });
  const heapTotal = new client.Gauge({
    name: 'nodejs_heap_total_bytes',
    help: 'Total heap size in bytes',
  });
  const heapUsed = new client.Gauge({
    name: 'nodejs_heap_used_bytes',
    help: 'Used heap size in bytes',
  });

  register.registerMetric(requestCounter);
  register.registerMetric(requestDuration);
  register.registerMetric(cpuUsage);
  register.registerMetric(memoryUsage);
  register.registerMetric(heapTotal);
  register.registerMetric(heapUsed);

  return {
    register,
    metrics: {
      requestCounter,
      requestDuration,
      cpuUsage,
      memoryUsage,
      heapTotal,
      heapUsed,
    },
  };
}
```

#### 2. Clase `InfrastructureMonitor`

Después pasamos con la clase que nos permitirá abstraer Prometheus de la lógica del código. A esta clase le llamaremos `InfrastructureMonitor`:

```ts
// ./apps/api/src/plugins/integrations/metrics/monitor.ts

import client from 'prom-client';
import { createInfrastructureMetrics } from './register';

interface InfrastructureMetrics {
  requestCounter: client.Counter;
  requestDuration: client.Histogram;
  cpuUsage: client.Gauge;
  memoryUsage: client.Gauge;
  heapTotal: client.Gauge;
  heapUsed: client.Gauge;
}

type RequestCounterLabels = {
  domain: string;
};

type RequestDurationLabels = {
  domain: string;
  route: string;
  method: string;
  statusCode: string;
};

export class InfrastructureMonitor {
  private static instance: InfrastructureMonitor;
  private register: client.Registry;
  private metrics: InfrastructureMetrics;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor(
    register: client.Registry,
    metrics: InfrastructureMetrics
  ) {
    this.register = register;
    this.metrics = metrics;
  }

  static async init() {
    if (this.instance) return this.instance;

    const { register, metrics } = createInfrastructureMetrics();
    this.instance = new InfrastructureMonitor(register, metrics);
    return this.instance;
  }

  // Monitoring methods
  public startMonitoring() {
    this.updateSystemMetrics();
  }

  public stopMonitoring() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = undefined;
  }

  private updateSystemMetrics(pollTime = 5000) {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      const startUsage = process.cpuUsage();
      const startTime = process.hrtime();

      setTimeout(() => {
        const diffUsage = process.cpuUsage(startUsage);
        const diffTime = process.hrtime(startTime);
        const elapsedMicros = diffTime[0] * 1e6 + diffTime[1] / 1e3;
        const cpuMicros = diffUsage.user + diffUsage.system;
        const cpuPercent = (cpuMicros / elapsedMicros) * 100;

        this.metrics.cpuUsage.set(cpuPercent);

        const mem = process.memoryUsage();
        this.metrics.memoryUsage.set(mem.rss);
        this.metrics.heapTotal.set(mem.heapTotal);
        this.metrics.heapUsed.set(mem.heapUsed);
      }, 100);
    }, pollTime);
  }

  // Register methods
  public registerRequest(labels: RequestCounterLabels) {
    this.metrics.requestCounter.inc(labels);
  }

  public registerRequestDuration(
    labels: RequestDurationLabels,
    duration: number
  ) {
    this.metrics.requestDuration.observe(
      { ...labels, status_code: labels.statusCode },
      duration
    );
  }

  // Getter methods
  public async getMetrics() {
    const currentMetrics = await this.register.metrics();
    const contentType = this.register.contentType;
    return {
      body: currentMetrics,
      contentType,
    };
  }
}
```

#### 3. Plugin de Fastify

Ahora nos toca implementar la clase en un plugin de Fastify (más información sobre esto en un futuro), de esta manera podemos conectarlo con el comportamiento de nuestro servidor. Primero definimos los utils:

```ts
import { FastifyRequest } from 'fastify';

export function getRequestDomain(request: FastifyRequest): string {
  // Lógica para distinguir el dominio entre web y mobile (solo si aplica)
}

export function getEndpointRoute(request: FastifyRequest): string {
  return request?.routeOptions?.url ?? request.url ?? '/graphql';
}
```

Y ahora vamos con el plugin como tal:

```ts
// ./apps/api/src/plugins/integrations/metrics/index.ts

import fp from 'fastify-plugin';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { InfrastructureMonitor } from './monitor';
import { getEndpointRoute, getRequestHost } from './utils';

declare module 'fastify' {
  interface FastifyInstance {
    prometheus: {
      monitor: InfrastructureMonitor;
    };
  }

  interface FastifyRequest {
    startTime?: [number, number];
  }
}

function onRequestHandler(
  request: FastifyRequest,
  monitor: InfrastructureMonitor
) {
  request.startTime = process.hrtime();
  const domain = getRequestHost(request);
  monitor.registerRequest({ domain });
}

function onResponseHandler(
  request: FastifyRequest,
  reply: FastifyReply,
  monitor: InfrastructureMonitor
) {
  const route = getEndpointRoute(request);
  const domain = getRequestHost(request);
  const method = request?.method?.toLowerCase() || 'get';
  const statusCode = String(reply.statusCode);

  const [seconds, nanoSeconds] = process.hrtime(request?.startTime);
  const durationInSeconds = Number((seconds + nanoSeconds / 1e9).toFixed(2));

  monitor.registerRequestDuration(
    {
      domain,
      route,
      method,
      statusCode,
    },
    durationInSeconds
  );
}

// Plugin export
export default fp(async (fastify: FastifyInstance) => {
  const monitor = await InfrastructureMonitor.init();
  fastify.decorate('prometheus', { monitor });

  fastify.addHook('onRequest', async (request: FastifyRequest) =>
    onRequestHandler(request, monitor)
  );

  fastify.addHook(
    'onResponse',
    async (request: FastifyRequest, reply: FastifyReply) =>
      onResponseHandler(request, reply, monitor)
  );

  fastify.addHook('onClose', async () => {
    monitor.stopMonitoring();
  });

  monitor.startMonitoring();
});
```

#### 4. Conexión con el servidor

Conectamos todo con el servidor principal y estamos casi listos:

```ts
export async function initServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const SERVER_HOST = process.env.SERVER_HOST || '0.0.0.0';

  const fastify = Fastify({ ... });

  try {

    // More code...

    // ------------------------------------
    await fastify.register(fastifyAutoload, {
      dir: path.join(__dirname, 'plugins/externals'),
    });
    // ------------------------------------

    // More code...

  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}
```

#### 5. Creación de la nueva ruta

Por último debemos exponer el endpoint de métricas que estará consultando Prometheus de forma remota:

```ts
fastify.get('/metrics', async (_, reply) => {
  const res = await fastify.prometheus.monitor.getMetrics();
  reply.header('Content-Type', res.contentType);
  reply.send(res.body);
});
```

La explicación sobre los plugins de Fastify y como funcionan ciertas partes de este código la estaremos agregando próximamente a la documentación de backend y actualizaremos este documento con una referencia al apartado. Stay tuned!
