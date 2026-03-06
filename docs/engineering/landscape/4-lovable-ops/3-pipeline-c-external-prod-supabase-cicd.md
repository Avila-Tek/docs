---
title: Pipeline C — Prod externo (Supabase + CI/CD)
sidebar_position: 3
slug: /lovable-ops/external-prod-supabase-cicd
---

Este pipeline aplica cuando **producción no puede vivir en Lovable**. En otras palabras:

- El **backend** (base de datos, login, integraciones y funciones) vive **fuera de Lovable**, normalmente en **Supabase**.
- El **frontend** se publica en un hosting externo (Vercel/Netlify/Cloudflare/etc.).
- El “botón” de release ya no es Publish, sino un **pipeline de despliegue** (CI/CD) que controla qué llega a producción.

Lovable se usa principalmente para **construir y probar**, pero el despliegue real de producción se hace **por fuera**.

## Cuándo usar este pipeline

Úsalo cuando:

- Por políticas, infraestructura o control operativo, el backend **debe** estar fuera de Lovable.
- Necesitamos separar claramente **ambientes** (por ejemplo DEV y PROD).
- Queremos un proceso de despliegue más controlado (aprobaciones, revisiones, historial de releases).

---

## Modelo simple (cómo se organiza)

Normalmente tendremos al menos **dos ambientes**:

- **Ambiente de pruebas (DEV/Test)**: para probar cambios sin afectar usuarios reales.
- **Ambiente de producción (PROD)**: el que usan los usuarios reales.

Regla importante:

- En este pipeline, **Publish no es “publicar a producción”**.
- Producción se actualiza cuando corre el **pipeline externo**.

---

## Flujo del pipeline

### 1) Desarrollo (en Lovable + ambiente de pruebas)

- Hacer cambios en Lovable.
- Probar en el ambiente de pruebas que todo lo principal funciona.
- Si el cambio toca datos o funciones, validar también esos flujos.

Checklist rápida:

- [ ] Pantallas críticas cargan y navegan bien
- [ ] El inicio de sesión funciona (si aplica)
- [ ] Los flujos principales funcionan de punta a punta
- [ ] No se ven errores evidentes

---

### 2) Validación funcional (en ambiente de pruebas)

Antes de liberar cambios:

- [ ] Login / registro (si aplica)
- [ ] Flujos principales (los más importantes del producto)
- [ ] Un caso de error típico se ve “bien” (mensaje claro, sin pantalla en blanco)

---

### 3) Checklist antes de liberar a Producción (operativo)

#### 3.1 Producción: variables del frontend

Asegurarse de que el hosting externo tenga configuradas las variables correctas para **producción**:

- [ ] Variables del frontend apuntan a **PROD** (no a Test/Dev)
- [ ] Si se cambiaron variables, recordar que el frontend necesita rebuild/redeploy
- [ ] No hay secretos privados en variables del frontend

#### 3.2 Producción: backend (Supabase)

Asegurarse de que producción está lista para recibir el despliegue:

- [ ] El pipeline tiene acceso al ambiente PROD (credenciales/permissions listos)
- [ ] Si hay cambios en la base de datos, están revisados y entendidos
- [ ] Si un cambio podría borrar/modificar información existente:
  - [ ] Tener claro el paso manual (si aplica)
  - [ ] Saber quién lo ejecuta y cuándo

#### 3.3 Evitar desincronización

Si el cambio es grande:

- [ ] Evitar cambios “rompedores” en un solo paso
- [ ] Preferir un release en 2 pasos:
  1) Backend compatible (sin romper el frontend actual)
  2) Frontend nuevo
  3) (Opcional) limpiar compatibilidad en un release posterior

---

## Orden recomendado de despliegue

### Caso normal (cambios compatibles)

1) **Desplegar backend** en producción (pipeline externo)
   - normalmente incluye cambios de base de datos y funciones
2) **Desplegar frontend** en producción (hosting externo)
3) Hacer verificación rápida

### Caso de cambio riesgoso o grande

- Preferir releases en 2 pasos para evitar “pantallas rotas” en producción.

---

### 4) Desplegar a Producción

1. Correr el **pipeline de producción** (backend).
2. Desplegar el **frontend** en el hosting externo.
3. Confirmar que ambos terminaron sin errores.

---

### 5) Verificación rápida en Producción (2–5 minutos)

- [ ] Abrir la web en producción
- [ ] Hacer login (si aplica)
- [ ] Probar el flujo principal del producto
- [ ] Confirmar que las acciones que guardan/leen datos funcionan
- [ ] Confirmar que no hay errores visibles
