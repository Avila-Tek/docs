---
title: Loki
sidebar_position: 4
slug: /backend/telemetry/loki
keywords: [quality, telemetry, loki, logs, logger]
---

## Introducción

La implementación de Loki en nuestro código es relativamente sencilla. Está compuesta de un modelo singleton que abstrae la conexión con Grafana y podemos utilizar en cualquier parte de nuestro proyecto.

### Instalación

Para empezar, debemos tener las librarías de `pino` y `pino-loki` en nuestro proyecto.

```bash
npm i --workspace=apps/api pino pino-loki
```

### El modelo

```ts
// ./apps/api/src/lib/logger.ts

import pino, { Logger as PinoLogger } from 'pino';
import type { LokiOptions } from 'pino-loki';

const env = process.env.NODE_ENV || 'development';
const appName = process.env.LOKI_APP_NAME || 'default-app-name';
const hostId = process.env.LOKI_HOST || 'default-host';
const username = process.env.LOKI_USERNAME || 'default-username';
const password = process.env.LOKI_PASSWORD || 'default-password';
const renderInstanceId = process.env.RENDER_INSTANCE_ID || 'default-instance';

export class Logger {
  private static instance: PinoLogger | null = null;

  private constructor() {}

  private static get() {
    if (Logger.instance) {
      return Logger.instance;
    }

    const logger = pino(
      pino.transport<LokiOptions>({
        target: 'pino-loki',
        options: {
          batching: true,
          interval: 5000,
          labels: {
            app: appName,
            env,
            instance: renderInstanceId,
          },
          host: hostId,
          replaceTimestamp: true,
          basicAuth: {
            username,
            password,
          },
        },
      })
    );

    Logger.instance = logger;
    return logger;
  }

  public static debug(message: string, args: { [key: string]: any }) {
    return Logger.get().debug(args, `[DEBUG] ${message}`);
  }

  public static info(message: string, args: { [key: string]: any }) {
    return Logger.get().info(args, `[INFO] ${message}`);
  }

  public static warn(message: string, args: { [key: string]: any }) {
    return Logger.get().warn(args, `[WARN] ${message}`);
  }

  public static error(message: string, args: { [key: string]: any }) {
    return Logger.get().error(args, `[ERROR] ${message}`);
  }

  public static fatal(message: string, args: { [key: string]: any }) {
    return Logger.get().fatal(args, `[FATAL] ${message}`);
  }
}
```

### Caso de uso

Esta clase podemos proceder a utilizar en partes de nuestro código donde queramos informar a Loki de algún evento:

```ts
export async function approveOrder(...) {

  // Code ...

  const user = await User.findOne({ _id: userId, active: true });
  Logger.info('Query', {
    location: 'approveOrder',
    params: { _id: userId, active: true },
    collection: 'users',
    status: 'successful',
  });

  // More code...

}
```
