---
title: Pipeline B — Frontend externo, Backend Lovable
sidebar_position: 2
slug: /lovable-ops/external-frontend-lovable-backend
---

Este pipeline aplica cuando el **frontend se publica fuera de Lovable** (Vercel/Netlify/Cloudflare/etc.), pero el **backend se mantiene en Lovable Cloud** (base de datos, login, integraciones y funciones).

En este escenario hay **dos despliegues que deben coordinarse**:

- **Backend (Lovable Cloud):** se libera con el botón **Publish**.
- **Frontend (hosting externo):** se libera con el despliegue del proveedor (manual o CI/CD).

La idea es simple: **probar en Test**, y luego publicar **sin desincronizar** el frontend del backend.

## Cuándo usar este pipeline

Úsalo cuando:

- El **frontend** debe hostearse fuera de Lovable (dominio, infraestructura, políticas internas, etc.).
- Queremos mantener el backend dentro de **Lovable Cloud**.
- Aceptamos coordinar releases entre **Publish** (backend) y **deploy** (frontend).

---

## Flujo del pipeline

### 1) Desarrollo (en Test)

- Hacer cambios normalmente en Lovable.
- Probar en **Test** que lo principal funciona.
- Si hay cambios en pantallas o flujos, probar también el frontend en su entorno de preview/staging (si existe).

Checklist rápida:

- [ ] Pantallas críticas cargan y navegan bien
- [ ] El inicio de sesión funciona (si aplica)
- [ ] Los flujos principales funcionan de punta a punta (frontend → backend)
- [ ] No se ven errores evidentes

---

### 2) Validación funcional (en Test)

Antes de liberar cambios:

- [ ] Login / registro (si aplica)
- [ ] Flujos principales (los más importantes del producto)
- [ ] Un caso de error típico se ve “bien” (mensaje claro, sin pantalla en blanco)

---

### 3) Checklist antes de liberar (operativo)

#### 3.1 Backend: configuración en Live (producción)

Asegurarse de que **Live** tiene lo necesario para producción:

- [ ] Configuración de login (si aplica)
- [ ] Claves/secretos que usan integraciones o funciones (por ejemplo Stripe)
- [ ] Variables públicas necesarias para el frontend
- [ ] Integraciones activas (Stripe, PostHog, etc.)

> Regla práctica: si configuraste algo en **Test**, revisa si también hay que configurarlo en **Live**.

#### 3.2 Frontend: variables del hosting externo

Asegurarse de que el hosting externo tenga configuradas las variables “públicas” que usa el frontend (ej: Supabase URL/Key del ambiente correcto):

- [ ] Variables del frontend apuntan a **producción** (Live)
- [ ] No hay valores de **Test/Dev** por error
- [ ] Si se cambiaron variables, recordar que el frontend necesita un rebuild/redeploy

#### 3.3 Cambios sensibles (compatibilidad)

Si el cambio toca integraciones, endpoints o estructura de datos:

- [ ] Confirmar que el frontend viejo sigue funcionando con el backend nuevo (ideal)
- [ ] Evitar cambios “rompedores” (breaking) en un solo paso
- [ ] Si hay cambio grande, planificar un release en 2 pasos (primero backend compatible, luego frontend)

#### 3.4 Rama correcta (si el proyecto usa ramas)

- [ ] Confirmar que estás en la rama correcta para publicar backend (por ejemplo `main`)
- [ ] Confirmar que el frontend que vas a desplegar corresponde a esa misma versión

---

## Orden recomendado de despliegue

### Caso normal (cambios compatibles)

1) **Publicar backend** en Lovable (**Publish → Update**).
2) **Desplegar frontend** en el hosting externo.
3) Hacer verificación rápida.

### Caso de cambio riesgoso o grande

- Preferir releases en 2 pasos:
  1) Publicar backend de forma compatible (sin romper el frontend actual).
  2) Desplegar frontend nuevo.
  3) (Opcional) En un release posterior, limpiar compatibilidad.

---

### 4) Publicar y desplegar

1. Presionar **Publish → Update** en Lovable (backend).
2. Desplegar el **frontend** en el hosting externo.
3. Confirmar que ambos terminaron sin errores.

---

### 5) Verificación rápida en Producción (2–5 minutos)

- [ ] Abrir la web en producción
- [ ] Hacer login (si aplica)
- [ ] Probar el flujo principal del producto
- [ ] Confirmar que las acciones que guardan/leen datos funcionan
- [ ] Confirmar que no hay errores visibles
