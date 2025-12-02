---
title: Gestión de eventos
sidebar_position: 4
slug: /frontend/quality/error-handling/event-managing
---

# Gestión de eventos

# 1. Error Boundary Global

En todos los proyectos **Next.js** debe incluirse un archivo `app/global-error.tsx` configurado con **Sentry**.  
Este archivo actúa como un _Error Boundary_ global, capturando cualquier error no manejado en el árbol raíz de la aplicación y enviándolo automáticamente a Sentry mediante `Sentry.captureException(error)`.

Además, la UI del `global-error.tsx` puede personalizarse según el diseño o necesidades de cada proyecto (mensaje, estilos, acciones, branding).

Esto garantiza consistencia en el manejo de fallas críticas y evita pantallas en blanco en producción.

## Ejemplo mínimo

```tsx
'use client';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error, reset }) {
  Sentry.captureException(error);

  return (
    <html>
      <body>
        <h2>Algo salió mal.</h2>
        <button onClick={() => reset()}>Reintentar</button>
      </body>
    </html>
  );
}
```

---

# 2. Eventos manuales

## Términos clave

- **Evento**: instancia de envío de datos a Sentry (error o excepción).
- **Problema**: agrupación de eventos similares.
- **Captura**: reporte de un evento cuando se envía a Sentry.

Es común usar `try/catch` para evitar que un error detenga todo el sistema, pero a veces ocurren errores dentro del propio `try`, generando bugs difíciles de rastrear.

Por eso, cuando trabajamos en funciones _core_ o críticas, es recomendable **capturar manualmente errores** y enviarlos a Sentry, aunque ya exista un manejo `try/catch`.

## Ejemplo

```ts
import * as Sentry from '@sentry/nextjs';

async function processPayment(data) {
  try {
    const response = await api.charge(data);
    return response;
  } catch (error) {
    Sentry.captureException(error);
  }
}
```

---

# 3. Filtrado de eventos

El **filtrado de eventos** permite controlar qué errores se envían realmente a Sentry mediante opciones como `beforeSend` e `ignoreErrors`.

Esto ayuda a reducir ruido, mejorar calidad y evitar consumo innecesario de la cuota.

## Ignore events

```ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  ignoreErrors: [
    'network error',
    'Cannot read properties of null',
    'N+1 API Call',
  ],
});
```

## beforeSend

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    const error = hint.originalException;

    if (error?.message?.toLowerCase().includes('network error')) return null;

    if (error?.message?.includes('Cannot read properties of null')) return null;

    if (event?.message?.includes('N+1 API Call')) return null;

    const url = event?.request?.url || '';
    if (
      url.includes('/operaciones/estados-de-cuenta') ||
      url.includes('/operaciones/venta/editar') ||
      url.includes('/operaciones/abono/kaizen/editar')
    ) {
      return null;
    }
    return event;
  },
});
```

---

# 4. Enriquecer eventos

Crear estructura:

```
lib/
  sentry/
    attrsHelpers.ts
    SentryScope.tsx
```

## Atributos

### tags

```json
{ "service": "web", "route": "/checkout" }
```

### context

```json
{
  "ui_state": { "step": "review" },
  "order": { "id": "o_123", "amount": 59.99 }
}
```

### extras

```json
{ "cartSize": 4, "debugFlag": true }
```

### fingerprint

```ts
fingerprint: ['type:ValidationError', 'route:/checkout'];
```

---

# Wrapper global

```tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import React from 'react';

type Primitive = string | number | boolean | null | undefined;

export type SentryAttrs = {
  user?: { id?: string; email?: string; username?: string };
  tags?: Record<string, Primitive>;
  context?: Record<string, unknown>;
  extras?: Record<string, unknown>;
  fingerprint?: string[];
};

type SentryWrapperProps = React.PropsWithChildren<
  SentryAttrs & { stripEmpty?: boolean; clearOnUnmount?: boolean }
>;

export default function SentryWrapper({
  user,
  tags,
  context,
  extras,
  fingerprint,
  stripEmpty = true,
  clearOnUnmount = false,
  children,
}: SentryWrapperProps) {
  React.useEffect(() => {
    if (tags) {
      for (const [key, val] of Object.entries(tags)) {
        if (stripEmpty && (val === null || val === undefined || val === ''))
          continue;
        Sentry.setTag(key, String(val));
      }
    }

    if (context && Object.keys(context).length > 0) {
      Sentry.setContext('app', context);
    }

    if (extras) {
      for (const [key, val] of Object.entries(extras)) {
        if (stripEmpty && (val === null || val === undefined)) continue;
        Sentry.setExtra(key, val);
      }
    }

    return () => {
      if (clearOnUnmount) {
        Sentry.setUser(null);
        if (tags) Object.keys(tags).forEach((k) => Sentry.setTag(k, ''));
        if (context) Sentry.setContext('app', undefined as any);
      }
    };
  }, [
    JSON.stringify(user ?? {}),
    JSON.stringify(tags ?? {}),
    JSON.stringify(context ?? {}),
    JSON.stringify(extras ?? {}),
    fingerprint?.join('|') ?? '',
    stripEmpty,
    clearOnUnmount,
  ]);

  return <>{children}</>;
}
```

---

# Uso en layout

```tsx
'use client';
import SentryWrapper from '@/app/lib/sentry/SentryWrapper';

export default function DashboardLayout({ children }) {
  return (
    <SentryWrapper
      tags={{ route: '/checkout', component: 'checkout/page' }}
      context={{ ui_state: { step: 'review' } }}
      fingerprint={['type:ValidationError', 'route:/checkout']}
    >
      {children}
    </SentryWrapper>
  );
}
```

---

# Helpers sin React

```ts
'use server';

import { withSentryScope } from '@/app/lib/sentry/attrsHelpers';
import * as Sentry from '@sentry/nextjs';

export async function payOrder(orderId: string) {
  return withSentryScope(
    (scope) => {
      scope.setTag('endpoint', 'POST /api/payments');
      scope.setContext('payment', { orderId });
    },
    async () => {
      try {
        return { ok: true };
      } catch (err) {
        Sentry.captureException(err);
        throw err;
      }
    }
  );
}
```

---

# Recursos

- Integrating Sentry with React
- Using Sentry in React.js and Next.js Projects
