---
title: Configuraciones iniciales
sidebar_position: 3
slug: /frontend/quality/error-handling/sentry-init
---

# Configuraciones iniciales

## 1. Instalar Sentry y mapear servicios

- Crear proyectos separados para cada aplicación dentro de un proyecto:

  - Formato: `[nombre del proyecto]-[especialidad]`
  - Ejemplo: `kaizen-client` y `kaizen-api`

- Integrar el SDK siguiendo la documentación oficial (usar el wizard recomendado):
  - [JavaScript/Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

### Instalación en Next.js

Responde la instalación de esta manera:

![instalacion-1](/img/frontend/error-handling/sentry-init-1.png)
![instalacion-2](/img/frontend/error-handling/sentry-init-2.png)
![instalacion-3](/img/frontend/error-handling/sentry-init-3.png)
![instalacion-4](/img/frontend/error-handling/sentry-init-4.png)

- Guarda el **SENTRY AUTH TOKEN** y **NO** lo subas a Git.  
  Debes eliminar el siguiente archivo:

![token-warning](/img/frontend/error-handling/sentry-init-5.png)

- Finalizamos la instalación:

![installation-done](/img/frontend/error-handling/sentry-init-6.png)

- Si tu versión de Next.js es menor a **15.4.1**, Sentry no funciona con Turbopack y verás este warning:

![turbopack-warning](/img/frontend/error-handling/sentry-init-7.png)

- Entonces debes eliminar `--turbo` del script:

![remove-turbo](/img/frontend/error-handling/sentry-init-8.png)

### Verificar sentryConfig

- Asegúrate de que el **DSN sea una variable de entorno**  
  El DSN conecta tu SDK con Sentry.

![dsn-example-1](/img/frontend/error-handling/sentry-init-9.png)
![dsn-example-2](/img/frontend/error-handling/sentry-init-10.png)

- `sentry.client.config` será deprecado. Su contenido debe moverse al archivo nuevo:

![client-config-deprecated](/img/frontend/error-handling/sentry-init-11.png)

- Si no tienes DSN, búscalo en el panel de Sentry → _Client Keys DSN_.  
  Verifica que el breadcrumb sea TU proyecto.

![client-keys-screen](/img/frontend/error-handling/sentry-init-12.png)

### Probar la instalación

- Abre la página `/sentry-example-page` para validar la configuración.
- Confirma que los eventos llegan al dashboard. (Solo verás el error de prueba)

![test-event-dashboard](/img/frontend/error-handling/sentry-init-13.png)

### Limitar Sentry solo a producción

- Según la documentación, tu `next.config` se ve así:

![nextconfig-doc](/img/frontend/error-handling/sentry-init-14.png)

- En mi caso, se ve así: _(solo cargar `withSentryConfig` en producción)_

```ts
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@avila-tools/ui'],
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
};

const sentryWebpackPluginOptions = {
  org: 'avilatek',
  project: 'avila-tools-pruebas',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

const config =
  process.env.NODE_ENV === 'production'
    ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
    : nextConfig;

export default config;
```
