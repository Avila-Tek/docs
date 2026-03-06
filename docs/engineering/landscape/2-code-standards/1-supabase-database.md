---
title: Bases de Datos
sidebar_position: 1
slug: /code-standards/supabase/database
---

# Estándares de Bases de Datos

Estándares de calidad para **Postgres en Supabase o Lovable Cloud** (schema, migraciones, RLS y ciclo de vida de datos).  
Estos estándares son **independientes a la IA**: aplican igual si el cambio lo hace una persona o una herramienta.

---

## Glosario

- **RLS (Row-Level Security):** Seguridad a nivel de fila en Postgres. Permite definir *políticas* para que cada usuario solo pueda leer/escribir las filas que le corresponden (por ejemplo, `user_id = auth.uid()`), incluso si intenta hacer queries directas fuera del frontend.
- **PII (Personally Identifiable Information):** Información Personal Identificable. Datos que pueden identificar a una persona directa o indirectamente (ej. nombre, email, teléfono, documento, dirección). Requiere mayor cuidado: mínimo acceso, retención definida y protección con RLS cuando aplique.
- **PK (Primary Key):** Clave primaria. Columna (o conjunto de columnas) que identifica de forma única cada fila de una tabla (por ejemplo, `id`).
- **FK (Foreign Key):** Clave foránea. Columna que referencia la PK (u otra columna única) de otra tabla para mantener integridad referencial (por ejemplo, `orders.user_id → users.id`).
- **Tabla user-owned (por usuario):** Tabla donde cada registro “pertenece” a un usuario específico (normalmente porque tiene un `user_id`). La regla general es que cada usuario solo puede ver/editar sus propios registros.
- **Service role:** Tipo de usuario con permisos elevados (administrador) en Supabase. Puede ejecutar operaciones saltándose RLS. Se usa solo para tareas internas/admin y siempre con autorización explícita.

---

## Alcance

Incluye:

- Diseño de tablas, naming conventions, integridad de datos e índices.
- Migraciones y checklist de release.
- RLS (Row-Level Security) y baseline de acceso.
- Soft delete, retención, PII (Personally Identifiable Information) y hard delete.

---

## Reglas no negociables

- **Todos los cambios de schema van por migraciones** (nunca editar schema en Dashboard en prod/stg).
- **Cada tabla nueva debe tener**: `id`, `created_at`, `updated_at`, `deleted_at` + **RLS habilitado**.
- **Delete por defecto = soft delete** (`deleted_at = now()`). Hard delete solo para casos MUY concretos.
- **Todas las timestamps son `timestamptz` (UTC)**.
- **Toda FK debe tener `ON DELETE` explícito**.
- **RLS en tablas con datos de usuario/sensibles (por defecto en nuevas tablas)**; omitir RLS solo si es lookup público y documentado.
- **Migraciones append-only**: nunca editar o borrar migraciones ya creadas.

---

## Naming conventions

- Tablas: `snake_case`, **plural** (ej. `order_items`).
- Columnas: `snake_case`, singular (ej. `user_id`).
- FKs: `<tabla_referenciada_singular>_id` (ej. `user_id`, `order_id`).
- Índices: `idx_<table>_<columns>`.
- Unique constraints: `uq_<table>_<columns>`.
- Check constraints: `chk_<table>_<desc>`.
- Boolean: prefijo `is_` / `has_`.
- Policies RLS: `<table>_<operation>_<actor>` (ej. `orders_select_owner`).

---

## Columnas requeridas (todas las tablas)

- `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`
- `deleted_at timestamptz` (soft delete)
- `updated_at` **se actualiza automáticamente vía trigger**.

---

## Soft delete (obligatorio)

- Soft delete: set `deleted_at = now()` (no usar `DELETE`).
- Default queries: **siempre** filtrar `deleted_at IS NULL`.
- Restore: set `deleted_at = NULL` + logging del evento.
- Hard delete solo para casos muy concretos que deben quedar documentados.

---

## Integridad de datos

- FKs con `ON DELETE` explícito:
  - `RESTRICT` para relaciones críticas,
  - `CASCADE` solo si el hijo no tiene sentido sin padre,
  - `SET NULL` si el FK es opcional y el huérfano es válido.
- `CHECK` constraints para valores acotados (montos > 0, status, etc.).
- `TEXT` preferido sobre `VARCHAR(n)` salvo que el límite sea regla de negocio.

---

## Indexing baseline

- Indexar FKs usadas en JOIN/WHERE.
- Indexar columnas de `ORDER BY` en tablas grandes.
- Soft delete: preferir **partial index** `WHERE deleted_at IS NULL`.
- No indexar “por si acaso”: solo con patrón de query claro.
- Índices compuestos: orden por mayor selectividad primero.

---

## Migraciones y releases

### Reglas

- Una migración = un cambio lógico (tabla/policies/índices).
- RLS + policies para tabla nueva van **en la misma migración**.
- Cambios incompatibles se **desacoplan** (no romper código y DB en el mismo paso).

### Naming

- Usa este formato: `<timestamp>_<descripcion_en_snake_case>.sql`

### Cambios incompatibles (patrones obligatorios)

Cuando un cambio podría romper el código existente o afectar datos en producción, **no se hace en un solo paso**. Se hace por etapas (normalmente en migraciones separadas):

- **Renombrar una columna**
  - Crear la nueva columna → copiar los datos a la nueva (backfill) → actualizar el código para usarla → eliminar la columna vieja.
- **Cambiar el tipo de dato de una columna** (por ejemplo, `int` a `uuid`)
  - Crear una nueva columna con el tipo correcto → copiar/convertir los datos (backfill) → cambiar el código → eliminar o reemplazar la columna vieja.
- **Hacer una columna obligatoria (`NOT NULL`)**
  - Primero asegurar que todas las filas tengan un valor:
    - Poner un valor por defecto **o**
    - Rellenar los valores existentes (backfill)
  - Luego aplicar `NOT NULL`.

---

## RLS & baseline de acceso

- RLS **requerido** en:
  - Tablas que tengan user_id o que referencien auth.users.
  - Tablas que almacenen PII o cualquier dato sensible.
  - Por defecto, toda tabla nueva debe crearse asumiendo que requiere RLS. Solo se puede omitir en casos específicos (por ejemplo, tablas lookup públicas).

### Reglas mínimas recomendadas (tablas “por usuario”)

Cuando una tabla tiene datos que pertenecen a un usuario (por ejemplo, tiene `user_id`), estas son las reglas base:

- **Ver y editar (SELECT/UPDATE):** cada usuario solo puede ver o modificar **sus propios registros**, y solo los que **no estén eliminados** (soft delete).
- **Crear (INSERT):** al crear un registro, el sistema debe guardar automáticamente que **pertenece al usuario autenticado** (no aceptar un `user_id` enviado por el cliente).
- **Eliminar (DELETE):** en tablas con **soft delete**, los usuarios **no deben borrar** registros físicamente. En su lugar, se marca como eliminado (por ejemplo, con `deleted_at`) y eso se maneja desde la app/edge.

### Service role (límites)

- La **service role** tiene permisos “de administrador” y puede saltarse las reglas normales de acceso (RLS).  
  Por eso **solo se usa** para operaciones internas del sistema o acciones de administración, y siempre con:
  - Validación de permisos (autorización) antes de ejecutar
- No se debe usar service role para endpoints normales de usuarios si RLS ya cubre el acceso. Si lo necesitas para “que funcione”, probablemente falta una policy o falta autorización.

---

## Ciclo de vida, retención y PII

- No loggear PII (email, phone, address, etc.); nunca retornar PII en errores.
- PII debe estar en tablas con RLS + policies owner-only.
- No guardar PII en JSONB mezclado: aislar en columnas dedicadas.

---

# Checklist de calidad (DB)

## A) Nueva tabla

- [ ] Tabla en `snake_case` plural y columnas en `snake_case` singular.
- [ ] Tiene columnas requeridas: `id`, `created_at`, `updated_at`, `deleted_at`.
- [ ] `updated_at` se mantiene con trigger (incluido en la migración).
- [ ] RLS habilitado en la misma migración.
- [ ] Policies mínimas (SELECT + INSERT al menos) definidas y nombradas correctamente.
- [ ] Todas las FKs tienen `ON DELETE` explícito.
- [ ] Índices para FKs y patrones claros de WHERE/ORDER BY (incluye soft delete index si aplica).

## B) Archivo de migración

- [ ] Nombre correcto: `<timestamp>_<descripcion>.sql` (UTC, `snake_case`).
- [ ] Probado local: `supabase db reset` + `supabase migration up`.
- [ ] Sin valores environment-specific (UUIDs hardcoded, etc.).
- [ ] Cambios incompatibles están separados por fases (add/backfill/swap/drop).
- [ ] No se editó/reescribió una migración existente (append-only).

## C) RLS & acceso

- [ ] RLS habilitado (Con excepción de casos concretos).
- [ ] Policies siguen baseline: owner-only + `deleted_at IS NULL` donde aplique.
- [ ] No existe policy de DELETE para usuarios en tablas con soft delete.
- [ ] Si se requiere service role: está justificado (y el consumo se hará desde Edge Functions con auth).

## D) Soft delete / hard delete

- [ ] La operación de delete es soft delete (`deleted_at = now()`).
- [ ] Queries user-facing filtran `deleted_at IS NULL`.
- [ ] Si hay hard delete, debe ser para casos muy concretos que deben quedar documentados.

## E) Release (DB)

- [ ] Migración alineada con cambios de app/edge (orden: migración primero → código después).
- [ ] Índices justificados (patrones documentados).
- [ ] No se expone información sensible en logs/errores (PII/tokens).
