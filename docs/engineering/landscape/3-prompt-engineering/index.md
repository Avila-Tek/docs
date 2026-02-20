---
title: Prompts y workflows con IA
sidebar_position: 3
slug: /ai-prompts
---

# Prompts y workflows con IA

Esta sección explica cómo escribir **buenos prompts desde cero** independientemente de la **herramienta utilizada**.  
Aunque actualmente usamos Lovable para construir, este proceso funciona igual si mañana usamos otra IA.

La idea es simple: para mantener nuestra prioridad #1 (**velocidad**), queremos que los prompts sean:

- Claros (menos iteraciones),
- Específicos (menos ambigüedad),
- Pequeños (menos tokens y diffs más controlados).

## ¿Por qué refinar prompts antes de usarlos en Lovable?

Lovable es excelente para **editar el repo** y producir cambios rápidos, pero muchas veces no es el mejor lugar para “pensar” e iterar el prompt.  

Refinar el prompt primero con otra IA (ej. **Gemini** o **GPT**) tiene ventajas:

- **Menos tokens en Lovable:** llegas con un prompt final, no con 5 intentos.
- **Menos cambios accidentales:** el prompt sale más preciso (y Lovable toca menos archivos).
- **Mejor calidad del plan:** puedes forzar “Research → Plan” antes de escribir código.
- **Reutilización:** te queda un prompt “plantilla” que puedes usar en futuros tasks.

> Regla práctica: usa otra IA para **diseñar el prompt**, y usa Lovable para **ejecutarlo en el repo**.

## Proceso recomendado (rápido)

1. Escribe un borrador del prompt (objetivo + alcance).
2. Pásalo por una IA “refinadora” (Gemini/GPT) para mejorar claridad y estructura.
3. Toma el prompt final y ejecútalo en Lovable.

## Prompt de ejemplo para refinar prompts

```txt
Actúa como “Prompt Refiner”. Harás 2 pasos: (1) Preguntar, (2) Entregar prompt final.

PASO 1 (primera respuesta):
- Haz SOLO 3 preguntas, 1 línea cada una.
- NO expliques nada, NO des contexto, NO generes el prompt final.

PASO 2 (segunda respuesta, tras mis respuestas):
- Devuelve SOLO el PROMPT FINAL en un bloque de texto, SIN títulos, SIN secciones, SIN líneas vacías.
- Límite duro: EXACTAMENTE 9 líneas (ni más ni menos). Si te pasas, reescribe hasta cumplir.
- Cada línea debe empezar con este prefijo exacto:
  1) TAREA:
  2) RESTRICCIONES:
  3) REQ1:
  4) REQ2:
  5) REQ3:
  6) REQ4:
  7) PROCESO:
  8) SALIDA:
  9) SALIDA:

Reglas del PROMPT FINAL:
- Español, directo, sin relleno.
- No incluir links ni rutas a docs. Solo: “Sigue las guidelines del repo”.
- Small diffs: “toca lo mínimo y reutiliza lo existente”.
- NO escribir listas largas dentro del prompt (prohibido listar criterios de aceptación/casos de error). Solo pedir cantidades.
- “PROCESO:” debe ser una sola línea con Research→Plan→Implement→Validate.
- En seguridad/stack: si algo no está definido, escribe “según el patrón existente del repo”.

Contenido mínimo requerido:
- Debe mencionar qué se construye (funcionalidad).
- Debe mencionar qué NO se incluye (si aplica).
- Debe pedir entregables al final con cantidades.

PROMPT BORRADOR:
<PEGAR AQUÍ>
```

## Ejemplo completo (antes / después)

### 1) Contexto del task

- Objetivo: Implementar una funcionalidad de inicio de sesión para que los usuarios puedan entrar al producto de forma segura y sin fricción.
- Alcance:
  - Pantalla de Iniciar sesión con campos básicos (ej. email + contraseña).
  - Registro (si el producto lo requiere desde el inicio).
  - Mensajes claros cuando algo sale mal (credenciales inválidas, campos incompletos).
  - Experiencia de carga “agradable” mientras se procesa (feedback visible).
- Restricciones:
  - Recuperación de contraseña (se hace en un paso aparte).
  - 2FA / autenticación en dos pasos.
  - Roles y permisos avanzados.
  - Perfil de usuario completo (solo acceso y sesión).

### 2) Prompt original

```txt
Quiero hacer una funcionalidad de autenticación para una página web, quiero que incluya registro de usuarios e inicio de sesión, no hace falta hacer recuperación de contraseña ni 2FA
```

### 3) Prompt refinado

#### Preguntas que hizo la IA

```txt
¿Qué método de autenticación debe usarse (email+password, magic link, OAuth) o debe ser “según el patrón existente del repo”?
¿Qué pantallas/rutas necesitas (solo /login y /signup u otras) y debe incluir protección de rutas privadas?
¿Qué entregables mínimos quieres al final (cantidad de pantallas, cantidad de endpoints/acciones, cantidad de tests) o lo dejo estándar?
```

#### Respuestas

```txt
- Email y contraseña 
- /login, /register y al iniciar sesión redirigir a /home 
- Estándar
```

#### Prompt Final

```txt
TAREA: Implementa autenticación web con email y contraseña: registro e inicio de sesión, con redirección a /home tras login.
RESTRICCIONES: Sigue las guidelines del repo; toca lo mínimo y reutiliza lo existente; si algo no está definido, según el patrón existente del repo.
REQ1: UI obligatoria: 2 pantallas (/login y /register) con validación básica y manejo de estados (cargando/error) según el patrón existente del repo.
REQ2: Ruteo: tras login exitoso redirige a /home; si ya está autenticado, evita mostrar /login y /register según el patrón existente del repo.
REQ3: Backend: 2 acciones/endpoints (register y login) o equivalente del repo; persiste sesión/token según el patrón existente del repo.
REQ4: Fuera de alcance: no implementar recuperación de contraseña, 2FA, login social/OAuth, ni perfiles avanzados.
PROCESO: Research→Plan→Implement→Validate
SALIDA: Entrega 2 pantallas listas para usar y 2 acciones/endpoints conectadas extremo a extremo con redirección a /home.
SALIDA: Incluye 3 tests (o equivalente) y una breve nota de uso (máx 5 líneas) sin links ni rutas a docs.
```

### 4) Checklist rápido del prompt refinado

- [ ] Pide Research → Plan → Implement → Validate
- [ ] Define archivos a tocar (o pide plan de archivos)
- [ ] Define criterios de aceptación
- [ ] Define casos de error / edge cases si aplica
- [ ] No duplica guidelines del repo
- [ ] Mantiene el scope acotado (small diffs)

> No es obligatorio refinar siempre con este prompt exacto. Lo importante es apoyarnos en otra IA para tomar nuestra idea inicial (normalmente ambigua), hacerle preguntas clave y devolver un prompt más claro, acotado y ejecutable. Mientras menos ambigüedad y mejor definido el alcance (qué incluye y qué no), más fácil es para Lovable producir cambios pequeños y consistentes con el repo, evitando interpretaciones y retrabajo.
