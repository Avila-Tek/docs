---
title: Pipeline A — Full Lovable (Publish)
sidebar_position: 1
slug: /lovable-ops/full-lovable
---

Este pipeline aplica cuando **todo el sistema vive en Lovable Cloud**: el **frontend** y el **backend** (DB/Auth/Edge Functions). En este escenario el “release gate” es el botón **Publish** de Lovable.

## Cuándo usar este pipeline

Úsalo cuando:

- La app se **publica (hostea) en Lovable Cloud**.
- No necesitamos mover el backend a otro proveedor.
- Queremos un proceso simple: **probar en Test y luego publicar a Live**.

---

## Flujo del pipeline

### 1) Desarrollo (en Test)

- Hacer cambios normalmente en Lovable.
- Probar en **Test** que lo principal funciona.
- Si el cambio toca el backend, probar también esas funcionalidades (por ejemplo, acciones que guardan datos).

Checklist rápida:

- [ ] Pantallas críticas cargan y navegan bien
- [ ] El inicio de sesión funciona (si aplica)
- [ ] Las funciones principales responden bien (si aplica)
- [ ] No se ven errores evidentes

---

### 2) Validación funcional (en Test)

Antes de publicar, hacer una pasada corta para confirmar que nada se rompió:

- [ ] Login / registro (si aplica)
- [ ] Flujos principales (el más importante del producto)
- [ ] Un caso de error típico se ve “bien” (mensaje claro, sin pantalla en blanco)

---

### 3) Checklist antes de publish (operativo)

#### 3.1 Configuración en Live (producción)

Asegurarse de que **Live** tiene lo necesario para funcionar en producción:

- [ ] Configuración de login (si aplica)
- [ ] Claves/secretos que usan integraciones o funciones (por ejemplo Stripe)
- [ ] Variables públicas necesarias para el frontend
- [ ] Integraciones activas (Stripe, PostHog, etc.)

> Regla práctica: si configuraste algo en **Test**, revisa si también hay que configurarlo en **Live**.

#### 3.2 Base de datos (schema / migraciones)

- [ ] Si solo agregaste cosas (tablas/campos nuevos), normalmente es seguro
- [ ] Si el cambio podría borrar/modificar información existente:
  - [ ] Tener listo el paso manual que toque ejecutar
  - [ ] Saber quién lo ejecuta y cuándo

#### 3.3 Rama correcta (si el proyecto usa ramas)

- [ ] Confirmar que estás en la rama que se quiere publicar (por ejemplo `main`)
- [ ] Confirmar que es la versión correcta

> Publish publica **lo que tienes abierto** en Lovable (la rama actual).

---

### 4) Publicar (release)

1. Presionar **Publish → Update** en Lovable.
2. Confirmar que terminó sin errores.

---

### 5) Verificación rápida en Producción (2–5 minutos)

Hacer un smoke test inmediato (2–5 minutos):

- [ ] Abrir la app en producción (Live)
- [ ] Hacer login (si aplica)
- [ ] Probar el flujo principal del producto
- [ ] Confirmar que todo se ve y responde como en Test
