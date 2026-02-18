---
title: Estándares de Edge Functions
sidebar_position: 2
slug: /code-standards/supabase/edge-functions
---

# Estándares de Edge Functions

Estándares de calidad para **Edge Functions de Supabase o Lovable Cloud (Deno runtime)**.  
Aplican igual si el código lo escribe una persona o una IA (Lovable u otra).

> Objetivo: **máxima velocidad** con cambios pequeños y consistentes, sin sacrificar seguridad ni mantenibilidad.

---

## Glosario

- **RLS (Row-Level Security):** Seguridad a nivel de fila en Postgres. Permite definir *políticas* para que cada usuario solo pueda leer/escribir las filas que le corresponden (por ejemplo, `user_id = auth.uid()`), incluso si intenta hacer queries directas fuera del frontend.
- **PII (Personally Identifiable Information):** Información Personal Identificable. Datos que pueden identificar a una persona directa o indirectamente (ej. nombre, email, teléfono, documento, dirección). Requiere mayor cuidado: mínimo acceso, retención definida y protección con RLS cuando aplique.
- **CORS (Cross-Origin Resource Sharing):** Reglas del navegador que controlan si un sitio web puede llamar a tu API/Edge Function desde otro dominio. Por eso manejamos el “preflight” (`OPTIONS`) y devolvemos headers de CORS para permitir/denegar el acceso.
- **Preflight:** Petición previa que hace el navegador (normalmente `OPTIONS`) para preguntar si tiene permiso de hacer la petición real (por ejemplo, si puede usar `POST` y enviar `Authorization`). Si el preflight falla, el navegador bloquea la llamada.
- **Request:** La “petición” que llega a tu función (método como `GET/POST`, headers, URL y body). Es lo que tu endpoint recibe y procesa.
- **Parsear (parse):** Convertir el body de la request (por ejemplo JSON en texto) a un objeto que el código pueda usar. Si el JSON está mal formado, el parseo falla y debe responderse con error de request inválida.
- **Service role:** Tipo de usuario con permisos elevados (administrador) en Supabase. Puede ejecutar operaciones saltándose RLS. Se usa solo para tareas internas/admin y siempre con autorización explícita.
- **Testing:** Pruebas automatizadas que verifican que el código hace lo esperado. Nos sirven para detectar errores rápido, evitar regresiones y mantener velocidad sin romper cosas.

---

## Alcance

Incluye:

- Estructura de funciones, flujo HTTP, CORS, auth/authz, validación.
- Manejo de errores y responses consistentes.
- Uso de `_shared/`, env/secrets, logging.
- Testing mínimo y baseline de seguridad.

---

## Reglas no negociables

- Runtime es **Deno** (NO Node): no usar APIs de Node, no `process.env`.
- **Nunca duplicar helpers**: todo lo común se importa desde `_shared/`.
- **Nunca usar `new Response()` directo**: usar `successResponse` / `errorResponse` (incluyen CORS).
- **Nunca `console.log`**: usar `logger`.
- **Nunca `Deno.env.get()`**: usar helpers `getEnv*`.
- Errores de negocio: **siempre** `AppError` + `ErrorCodes` (no string literals).
- Delete por defecto: **soft delete** (`deleted_at` / `is_deleted`). Hard delete requiere justificación + documentación.
- Admin client (service role) **bypassea RLS**: usar solo con **autorización explícita** + logging.

---

## Estructura de carpetas y archivos

- Cada función vive en: `supabase/functions/<function-name>/` (kebab-case)
- Obligatorio: `index.ts` (entry point con `Deno.serve`)
- Opcional (solo si ayuda a mantener `index.ts` pequeño):
  - `service.ts` (lógica de negocio)
  - `schema.ts` (tipos/validación)
  - `handlers.ts` (si hay routing interno)
  - `README.md` (si hay endpoint público, hard delete, webhooks, etc.)
- Prohibido: crear carpetas `utils/`, `helpers/`, `lib/` dentro de funciones (va a `_shared/`).

---

## Flujo estándar de request (STRICT)

Orden recomendado en todas las funciones:

1) **CORS:** manejar el `OPTIONS` y responder de inmediato si es un preflight.  
2) **Autenticación:** leer el token del request (header `Authorization`).  
3) **Preparar clientes:** crear los clientes de Supabase que usará la función (usuario/admin según aplique).  
4) **Confirmar usuario:** validar que el token sea válido y obtener el usuario (salvo que el endpoint sea público y esté documentado).  
5) **Leer el body:** si el request trae JSON, parsearlo.  
6) **Validar datos:** verificar campos requeridos y reglas básicas (formatos, límites, etc.).  
7) **Ejecutar la lógica:** hacer la operación real (consultar/crear/actualizar).  
8) **Responder:** devolver una respuesta exitosa con el formato estándar.  
9) **Manejar errores:** si algo falla, registrar el error y devolver una respuesta de error estándar.

---

## Responses y contratos

Para que el frontend y el equipo puedan trabajar rápido sin adivinar, **todas las funciones deben responder con un formato consistente**:

- **Respuesta exitosa:** usar el helper `successResponse(...)`
  - Puede incluir solo los datos, o datos + un mensaje.
- **Respuesta con error:** usar el helper `errorResponse(...)`
  - Incluye un mensaje claro y un código de error consistente.

Reglas:

- No construir respuestas “a mano” (no devolver objetos distintos en cada endpoint).
- No enviar detalles internos al cliente (por ejemplo, SQL, mensajes crudos del servidor o trazas de error).

### Códigos de respuesta (baseline)

- `200` / `201`: todo salió bien (éxito).
- `400`: el request viene mal (faltan campos, formato inválido).
- `401`: no hay sesión/token válido (no está autenticado).
- `403`: está autenticado, pero **no tiene permiso**.
- `404`: el recurso no existe.
- `409`: conflicto (por ejemplo, ya existe / ya fue procesado / idempotencia).
- `500`: error interno (mensaje genérico para el cliente).

---

## Manejo de errores (STRICT)

La idea es que los errores se manejen **siempre igual**, para que sea fácil debuggear y para que el cliente reciba respuestas claras.

- Todo lo que hace la función debe estar dentro de un bloque que permita **capturar errores** (try/catch).
- Cuando ocurra un error “esperado” (por ejemplo: falta un campo, no tiene permiso, no se encontró algo), debemos devolver un error controlado usando nuestro formato estándar (AppError + ErrorCodes).
- Si ocurre un error “inesperado” (algo que no anticipamos), devolvemos un mensaje **genérico** al cliente y lo investigamos con logs.

Reglas:

- Antes de responder con error, **siempre** registrar el error con `logger.error(...)`, incluyendo contexto útil (qué operación se intentó, IDs relevantes, requestId, etc.).
- Nunca exponer al cliente detalles internos del sistema (trazas, SQL, info sensible).

---

## Authentication vs Authorization

**Autenticación (Authentication / AuthN)** responde a:

- **“¿Quién eres?”**
- Ejemplo: validar que el token/sesión sea real y obtener el usuario.

**Autorización (Authorization / AuthZ)** responde a:

- **“¿Puedes hacer esto?”**
- Ejemplo: aunque el usuario sea válido, confirmar si puede ver/editar ese recurso específico.

> Importante: que alguien esté autenticado **no significa** que tenga permiso para cualquier acción.

### Reglas

- Por defecto, todos los endpoints son **privados**: requieren usuario autenticado.
- Un endpoint **público** es una excepción y:
  - debe quedar documentado en un `README.md` de esa función,
  - debe validar el input con más rigor (para evitar abuso: payloads grandes, spam, etc.).

### Autorización (permisos) en operaciones con datos

Cada vez que un endpoint **lee, modifica o borra** información, debe existir una regla clara que garantice que el usuario tiene permiso. Se puede cumplir de estas formas:

- **Dueño del recurso:** el usuario solo puede operar sobre registros que le pertenecen (por ejemplo, “solo tus notas / tus órdenes”).
- **RLS en la base de datos:** dejar que la base de datos aplique la regla (si está bien configurada), usando el cliente “normal” (anon) para respetar esas políticas.
- **Service role (admin):** si la acción es administrativa (ver/modificar data de otros usuarios), primero se valida que el usuario tenga ese rol/permiso y **solo entonces** se usa el cliente admin.

Regla práctica:

- Si para “que funcione” estás usando el cliente admin sin validar permisos, el endpoint está inseguro.

---

## Supabase clients (anon vs admin)

En Edge Functions usamos dos formas de conectarnos a Supabase, y la diferencia es **crítica para la seguridad**:

- **Cliente normal (`anonClient`)**
  - Se comporta como un usuario normal.
  - Respeta las reglas de acceso (RLS) definidas en la base de datos.
  - Es el **default** para endpoints “user-facing” (cuando el usuario está operando sobre sus propios datos).

- **Cliente administrador (`adminClient`)**
  - Tiene permisos elevados.
  - Puede saltarse las reglas de acceso (RLS).
  - Solo se usa en casos específicos, por ejemplo:
    - tareas internas del sistema / administración,
    - consultas que involucran data de múltiples usuarios (y están justificadas),
    - procesos por lotes controlados (batch jobs),
    - casos puntuales donde RLS no cubre lo necesario, pero **con permisos validados antes**.

**Regla clave:**  
Si estás usando `adminClient` solo para “que funcione”, eso es una señal de problema:

- Faltan políticas RLS,
- Falta validar permisos (autorización) antes de acceder/modificar datos.

---

## Parsing y validación

Antes de ejecutar cualquier lógica, debemos asegurarnos de que los datos que llegan al endpoint son **válidos y seguros**.

- Si el request trae un body en JSON:
  - Primero **leerlo y convertirlo** a objeto (si el JSON viene roto, se responde con error).
  - Luego verificar que estén los **campos obligatorios**.

- Validaciones comunes (según el caso):
  - emails con formato correcto (y normalizados para evitar duplicados por mayúsculas/espacios),
  - acciones/valores permitidos (por ejemplo, solo aceptar `create | update | delete`, no cualquier string).

Reglas:

- Si llegan campos extra o inesperados y eso puede causar problemas, **rechazar el request** (especialmente en endpoints públicos).
- Poner límites para evitar abuso:
  - Tamaño máximo de texto,
  - Cantidad máxima de elementos en arrays,
  - Tamaño máximo del body.
  
Esto evita que alguien mande requests gigantes o maliciosos que ralenticen o tumben el servicio.

---

## Operaciones de base de datos (desde Edge)

### Soft delete (default)

Cuando “borramos” algo, **no lo eliminamos de verdad**. Lo que hacemos es marcarlo como eliminado:

- En vez de hacer `DELETE`, hacemos un **UPDATE** para marcar el registro:
  - `deleted_at = now()`

Regla:

- Todas las consultas normales (las que usan los usuarios) deben **ignorar** los registros marcados como eliminados.
  - Es decir: solo mostrar lo que no esté “borrado”.

Esto nos permite:

- Recuperar datos si fue un error,
- Auditar cambios,
- Evitar pérdidas irreversibles.

### Hard delete (excepción)

Eliminar un registro de forma permanente (**hard delete**) es una excepción. Solo se permite cuando:

- Hay una obligación legal (por ejemplo, eliminación definitiva por privacidad),
- Es data temporal/efímera (ej. OTP),
- Existe un requerimiento explícito aprobado.

Si se hace hard delete, es obligatorio:

- Documentar el motivo en el `README.md` de esa función,
- Registrar el evento en logs (qué se borró y por qué), para auditoría.

---

## Logging (structured)

Los logs son nuestra principal herramienta para entender qué pasó en producción sin perder tiempo.

Reglas:

- Usar siempre el logger del proyecto (`logger.debug/info/warn/error`) en lugar de `console.log`.
- Mantener un formato consistente (logs “estructurados”): además del mensaje, incluir datos útiles como metadata.

Mínimo recomendado:

- Al iniciar una petición: registrar un log tipo “Start” con:
  - nombre de la función,
  - `requestId`,
  - `userId` si existe.
- Si algo falla: registrar un log tipo “Failure” con:
  - `requestId`,
  - `userId` si existe,
  - el error,
  - y contexto (qué operación se intentaba).

Seguridad en logs (no negociable):

- Nunca loggear información sensible:
  - tokens, header `Authorization`,
  - contraseñas,
  - API keys,
  - PII (datos personales) sensibles.

Siempre incluir contexto útil:

- `requestId` (para rastrear la petición),
- `userId` (si aplica),
- acción/operación,
- IDs relevantes (por ejemplo `orderId`, `workspaceId`, etc.).

---

## Env vars y secrets

Regla general: los secretos y configuraciones **no se escriben en el código**.

- Leer variables de entorno **solo** con los helpers del proyecto:
  - `getEnv`, `getEnvNumber`, `getEnvBoolean`, `getEnvJson`
- Nunca hardcodear secretos en el repo.
- Nunca devolver secretos en respuestas ni incluirlos en mensajes de error.

Local vs producción:

- `.env` se usa solo para desarrollo local dentro de `supabase/functions/` y debe estar ignorado por git.

Convenciones:

- Variables custom en `UPPER_SNAKE_CASE`.
- Usar prefijo por servicio cuando aplique (ej. `STRIPE_SECRET_KEY`).
- Si una función depende de variables específicas, documentarlo en su `README.md`.

---

## Naming conventions (resumen)

- Carpetas: `kebab-case` (`process-payment`, `get-user-profile`)
- Archivos: `index.ts`, `service.ts`, `schema.ts`, `handlers.ts`, `README.md` (lowercase)
- Variables Funciones: `camelCase`
- Typos o Classes: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Booleanos: `is/has/should`
- Códigos de error: `UPPER_SNAKE_CASE` (desde `ErrorCodes`)

---

## Testing standards (mínimo)

Qué testear:

- `_shared/` siempre (unit tests).
- lógica compleja en `service.ts` (unit tests).
- flows críticos (authentication/authorization, errores, DB writes) deberían tener tests de función (cuando estén disponibles en el setup).

Cobertura (Objetivos):

- `_shared`: 95%+
- lógica crítica: 90%+
- paths de error: obligatorios

---

## Baseline de seguridad

Antes de dar por “lista” una Edge Function, revisa este checklist. Es el mínimo para evitar incidentes y retrabajo.

Checklist mental en cada función:

- **Autenticación activa** por defecto (si es público, debe estar documentado).
- **Permisos claros**: verificar que el usuario realmente puede hacer esa acción (por ownership, RLS o rol admin).
- **Inputs validados**: no confiar en datos del cliente; validar campos, formatos y límites.
- **Secretos bien usados**: leer env vars solo con `getEnv*` y no exponerlos.
- **Logs seguros**: no registrar tokens, `Authorization`, API keys ni datos personales.
- **Cliente admin con cuidado**: usar `adminClient` solo con autorización explícita y logging.
- **CORS correcto**: manejar preflight (`OPTIONS`) para que el navegador no bloquee la llamada.
- **Borrado lógico**: por defecto usar soft delete, no hard delete.

---

# Checklist de calidad (Edge Functions)

## A) Estructura

- [ ] Función creada en `supabase/functions/<kebab-case>/index.ts`
- [ ] No se crearon helpers locales (todo shared está en `../_shared/`)
- [ ] `index.ts` idealmente < 200 líneas (si crece, extraer a `service.ts`)

## B) Imports y runtime

- [ ] No hay imports de Node / no se usan APIs de Node
- [ ] No hay `Deno.env.get()` ni `process.env`
- [ ] No hay `console.log`

## C) CORS

- [ ] `handleCorsPreflight(req)` es lo primero y responde `OPTIONS`

## D) Authentication/Authorization

- [ ] Endpoint autentica por defecto (`getAuthenticatedUser`)
- [ ] Si es público: está documentado en `README.md` y tiene validaciones/limitaciones
- [ ] Para writes/lecturas sensibles: ownership o autorización explícita
- [ ] No se usa `adminClient` sin authorization explícita + logging

## E) Parsing y validación

- [ ] Body parseado con `parseJsonBody<T>`
- [ ] Campos requeridos con `validateRequired`
- [ ] Validadores específicos aplicados (email/action/limits)

## F) Errores y responses

- [ ] Todo envuelto en `try/catch`
- [ ] Errores de negocio usan `AppError` + `ErrorCodes`
- [ ] `successResponse` / `errorResponse` (sin `new Response`)
- [ ] Errores loggeados con `logger.error` + contexto

## G) DB operations

- [ ] Se usa `anonClient` por defecto (RLS)
- [ ] Soft delete implementado para borrados
- [ ] Hard delete solo si aplica + `README.md` + `logger.warn` con reason

## H) Env/secrets

- [ ] Env vars via `getEnv*`
- [ ] No secrets hardcodeados
- [ ] No secrets en logs ni en responses
- [ ] Variables custom documentadas (si aplica)

## I) Tests (cuando aplica)

- [ ] `_shared/` cubierto con unit tests
- [ ] `service.ts` con tests si hay lógica crítica
- [ ] Casos mínimos para críticos: 400/401-403/200 (+ 409 si idempotencia)
