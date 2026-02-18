---
title: Variables de Entorno
sidebar_position: 2
slug: /lovable-setup/environment-variables
---

# Manejo de Variables de entorno en Lovable (Frontend + Edge Functions)

## Introducción: ¿qué es una variable de entorno?

Una **variable de entorno** (env) es un valor de configuración que tu app lee al ejecutarse o al compilarse, por ejemplo:

- URLs (API, Supabase, CDN)
- “Keys” públicas (publishable keys)
- flags de comportamiento (`VITE_FEATURE_X=true`)

La idea es **no hardcodear valores dentro del código** para poder cambiar la configuración según el entorno (desarrollo, qa, producción) sin tocar lógica.  

---

## La regla más importante: **público vs secreto**

En Lovable hay dos mundos:

1) **Frontend (Vite)** → variables **públicas**  
   - Se incluyen en el código que corre en el navegador.
   - Si alguien abre DevTools o inspecciona el bundle, puede verlas.
   - En Vite, solo se exponen al cliente las variables con prefijo **`VITE_`**.

2) **Backend / Edge Functions (Lovable/Supabase)** → variables **secretas**  
   - Se guardan de forma cifrada/segura.
   - Se inyectan en el backend y **no** se exponen al navegador.
   - Lovable provee “Secrets” para esto y los inyecta automáticamente donde se necesitan.

> **Conclusión:** Si es un secreto (token privado, API key secreta, credenciales), **NO va en el frontend**.

---

## 1) Variables de entorno en el Frontend (Lovable + Vite)

Lovable usa Vite para el frontend. En Vite:

- Las variables se leen desde archivos `.env*` y se acceden en el código con **`import.meta.env`**.
- Se “reemplazan” de forma estática durante el build (build-time).
- Para que una variable esté disponible en el navegador debe empezar con **`VITE_`**.

### Dónde se ponen

En proyectos Lovable normalmente existe un **archivo `.env` en el repo**, porque el frontend necesita esos valores para compilar. Esto es especialmente común para valores “públicos” como configuración de Supabase.

> **Disclaimer (importante):** En la mayoría de proyectos, **guardar un `.env` en el repositorio es una mala práctica**, porque es fácil que alguien termine metiendo **secretos** (tokens, claves privadas) por accidente.

### ¿Por qué el `.env` del frontend puede quedar en el repo?

Lovable necesita tener acceso al archivo .env para poder compilar el frontend, por lo tanto, lo que va ahí **no debería ser secreto**. Al final, todo `VITE_*` termina en el bundle del navegador, así que guardarlo “en git” no cambia mucho el riesgo (ya es público). La seguridad real es: **no meter secretos** en `VITE_*`.

---

## 2) Variables de entorno en Edge Functions (backend)

Para secretos y configuración sensible, Supabase o Lovable Cloud ofrecen **Secrets**:

- Guardas valores sensibles (API keys, tokens, credenciales).
- Se almacenan de forma segura y se inyectan en el backend (Edge Functions / integraciones).

Si tu backend está sobre Supabase Edge Functions, Supabase también documenta su “Secrets Manager” para funciones, tanto por Dashboard como por CLI.

### Cómo se usan dentro de una Edge Function

El patrón típico en Supabase Edge Functions (Deno) es leerlos desde el entorno dentro de la función (por ejemplo con `Deno.env.get(...)`).  
> El punto clave: **se leen en el backend**, no en el browser.

---

## Patrón recomendado en Lovable

### A) Frontend (público)

- Guardar en `.env` del repo **solo** variables `VITE_*` que no sean secretas.
- Ejemplos comunes:
  - URLs públicas
  - publishable keys
  - flags no sensibles

### B) Edge Functions (secreto)

- Guardar secretos en **Lovable Cloud → Secrets** (o en Supabase Secrets Manager).
- Ejemplos:
  - `STRIPE_SECRET_KEY`
  - `OPENAI_API_KEY`
  - tokens privados
  - service-role keys, credenciales, etc.

### C) “Necesito usar un secreto desde el frontend”

No lo expongas. En su lugar:

1. El frontend llama a una **Edge Function**
2. La Edge Function usa el secreto internamente
3. La Edge Function devuelve solo el resultado necesario

Esto mantiene el secreto fuera del navegador.

---

## Checklist de problemas comunes

- **Me sale `undefined` al intentar usar la variable en el frontend**
  - ¿La variable empieza con `VITE_`?
  - ¿La estás leyendo con `import.meta.env.VITE_...`?
  - ¿Reiniciaste el preview/dev server después de agregarla?

- **Estoy intentando meter un secreto en el frontend**
  - No lo hagas: pásalo a **Secrets** y úsalo en Edge Functions.

---

## Resumen

- **Frontend (Vite)**: `VITE_*` → público, vive en `.env`/`.env.local`, accesible por `import.meta.env`.
- **Edge Functions**: secretos en Lovable Secrets / Supabase Secrets Manager → privado, disponible solo en backend.
