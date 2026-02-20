---
title: Migrar Proyectos a Lovable
sidebar_position: 5
slug: /lovable-setup/migrate-project-to-lovable
---

# Migrar proyectos existentes a Lovable (guía práctica + riesgos)

Lovable **no soporta migración nativa**. Cada vez que creas un proyecto en Lovable, **siempre** genera un **repo nuevo** en GitHub.

Aun así, puedes “migrar” un proyecto de otra plataforma a Lovable siguiendo un flujo controlado: **crear proyecto vacío → tomar el repo recién creado → subir tu código a ese repo**.

---

## Riesgos

Al subir un repo “no creado por Lovable”, la IA **no tiene contexto real** del diseño, decisiones, edge cases y dependencias del sistema.

Eso aumenta el riesgo de que Lovable:

- “Refactorice” cosas que funcionan pero no entiende (rompa flujos).
- Cambie estructuras, nombres o rutas que otros sistemas consumen.
- Actualice dependencias o lockfiles sin intención (rompe builds).
- Modifique configuración (Vite/React, env, scripts) y deje el proyecto inestable.
- Toque seguridad por accidente (auth, RLS, permisos, endpoints).

**Conclusión:** después de migrar, hay que tratar a Lovable como un colaborador poderoso pero “nuevo en el equipo”: primero mapear, luego cambios pequeños y altamente controlados.

---

## Reglas de oro para una migración segura

1) **Siempre tendrás un backup** del repo original (y una rama de seguridad).
2) **CI primero**: build + lint + tests básicos si existen.
3) **No dejes que Lovable haga cambios masivos**. Pide *plan* antes de tocar código.
4) **Trabaja por ramas**. Evita que Lovable empuje directo a `main` en la medida de lo posible.
5) **No mezcles migración con refactors**. Primero que “corra igual” en el nuevo repo, y una vez ya funcione el proyecto se empiezan a hacer refactorizaciones.

---

## Flujo recomendado de migración

### 1) Crear proyecto vacío en Lovable

- En Lovable: **“Crea un nuevo proyecto vacío”**
- Conecta GitHub (Lovable creará un repo nuevo sí o sí)
- Conecta Lovable Cloud si aplica

### 2) Preparar el repo nuevo (antes de copiar tu código)

En el repo que creó Lovable, verifica que `main` existe y que puedes pushear.

### 3) Llevar el código del proyecto existente al repo de Lovable

La idea es que el repo de Lovable termine conteniendo **tu proyecto**.

**Para hacerlo debemos:** fusionar repos (merge de historias no relacionadas), para poder mantener el historial de commits.

> Importante: el resultado debe quedar en el branch que Lovable usa como referencia (normalmente `main`).  
> Recomendación: haz el import del proyecto en una rama segura y luego PR a `main`, para revisar el diff.

### 4) Push a `main`

Lovable necesita ver el código en el repo que administra.

- Si trabajaste con PR: mergea a `main`
- Si lo hiciste directo: asegúrate de que `main` queda consistente

### 5) Validación post-migración (antes de usar Lovable “en serio”)

En local y/o CI:

- `npm install` / `npm run build`
- `npm run lint` (si existe)
- `npm run test` (si existe)
- Ejecución básica del producto (smoke test):
  - login
  - navegación principal
  - flujo principal del negocio
  - endpoints críticos

Si algo falla: **no uses Lovable para “adivinar arreglos”** todavía. Primero estabiliza.

---

## Preparar el repo para que Lovable trabaje con guardrails

Una vez el proyecto corre, agrega:

- `agent_docs/` (si tu plantilla lo usa)
- `supabase/functions/` con `_shared/` y `tests/` (si aplica)
- Docs de estándares ya definidos (para que Lovable tenga referencia interna)

> Para más detalle de como configurar los agent_docs consultar la documentación de [Configuración inicial](/docs/lovable-setup/project-configuration).
> **Importante:** antes de aplicar esa configuración “tal cual”, **evalúa si conviene** en este proyecto migrado. Es común que el repositorio existente **no siga los mismos estándares** o estructura, así que debes decidir si:  
> - (A) Adoptas la configuración completa y ajustas el proyecto a ese estándar gradualmente.
> - (B) Aplicas solo una parte mínima (guardrails esenciales) y dejas la estandarización para una fase posterior.

---

## Primer uso recomendado: “modo lectura” (prompt inicial de análisis)

Después de migrar, lo ideal es que el **primer prompt** sea para que Lovable:

- Entienda estructura
- Detecte riesgos
- Sugiera una estrategia de cambios seguros

**Muy importante:** explícitale que **no modifique archivos**.

### Prompt inicial

- Contexto: Acabamos de migrar este repo a Lovable. La mayor parte del código NO fue creado por Lovable.
- Tarea: SOLO análisis, NO modifiques archivos.
- Entrega:
  - Mapa del repo (máx 12 líneas): frameworks, apps/paquetes, entradas, rutas, capa de datos, tests, scripts.
  - Lista de “zonas sensibles” (máx 8 bullets): auth, permisos, env, build, integraciones, pagos, etc.
  - Checklist de verificación (máx 10 bullets) para cambios seguros.
  - Recomendación de estrategia de trabajo (máx 6 bullets): cómo pedir cambios, tamaño de PR, archivos a evitar.
- Restricciones:
  - No hagas refactors, no cambies las versiones de las dependencias, no renombres masivos, no cambios de estructura.

---

## Cómo trabajar con Lovable después de una migración (sin romper el repo)

### Patrón seguro en 2 pasos

1) **Plan** (sin tocar código): “proponme plan + archivos a tocar”
2) **Implementación** (cambios mínimos): “toca solo estos archivos, con diff pequeño”

### Reglas para prompts de cambios

En cada prompt de implementación, incluye siempre:

- **Alcance explícito** (qué hace y qué NO hace)
- **Archivos permitidos** (lista cerrada)
- **Prohibiciones**:
  - No modificar dependencias
  - No hacer renombres masivos
  - No mover carpetas
  - No cambiar contratos públicos (rutas, payloads) sin pedirlo
- **Entregables**: archivos exactos, tests mínimos o pasos de verificación
- **“Si no estás seguro”**: pedir plan o dejar comentario, no inventar

Ejemplo de restricción útil:
> “Si necesitas tocar más de 5 archivos o más de 200 líneas, detente y devuelve un plan.”
> Nota: estas “prohibiciones” no significan que **nunca** se puedan actualizar dependencias, renombrar archivos o mover carpetas. Sí se puede, pero debe hacerse **de forma consciente y controlada**: cuando ese sea el **objetivo principal del prompt** (y no un efecto colateral). En esos casos, pide primero un **plan**, limita el alcance (idealmente por partes), define una **lista explícita** de cambios permitidos y exige pasos de verificación (build/tests/smoke).

---

## Señales de alerta (cuando frenar a Lovable)

Frena y vuelve al patrón “plan primero” si Lovable propone:

- Cambiar estructura de carpetas “para ordenarlo”
- Actualizar versiones de React/Vite/TS o dependencias
- Reescribir auth, guards o RLS “para mejorar”
- Cambiar nombres de rutas, endpoints o tablas sin razón clara
- Tocar `.env`, secretos, o “hardcodear” keys

---

## Checklist final de migración

- [ ] Repo original respaldado (y accesible)
- [ ] Build + lint + tests pasan
- [ ] Lovable recibió un prompt inicial de análisis (solo lectura)

---

## Nota rápida: por qué esto es delicado

En proyectos creados desde cero en Lovable, la IA “vio nacer” la estructura y decisiones.
En proyectos migrados, la IA llega con contexto incompleto, así que la forma correcta de usarla es:
**primero entender → luego cambios chicos → siempre verificando.**
