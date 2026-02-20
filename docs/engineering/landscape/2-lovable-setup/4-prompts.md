---
title: Prompts de ejemplo
sidebar_position: 4
slug: /lovable-setup/prompts
---

# Prompts de ejemplo para Lovable

Estas son **plantillas** listas para copiar/pegar en Lovable, simplemente se debe describir la funcionalidad que se quiere implementar.

> Reemplaza los placeholders como: `<FUNCIONALIDAD>`, `<ENTIDAD>`, `<TABLA>`, `<EDGE_FUNCTION>`, etc.

## Cómo usar estas plantillas

1) Reemplaza los placeholders (`<FUNCIONALIDAD>`, `<TABLA>`, etc.).
2) Mantén el prompt corto: describe objetivo + contexto + restricciones.

## Glosario rápido

- **Edge Function:** endpoint backend en Supabase que responde HTTP.
- **RLS:** reglas de seguridad en la base de datos para limitar acceso por usuario.
- **Service role:** Usuarios admin que puede saltarse RLS (usar solo con autorización).
- **Query / Mutation:** leer datos / modificar datos (patrón de React Query).
- **Skeleton:** placeholder visual mientras carga una pantalla/sección.
- **Schema:** reglas de validación (Zod) para datos de formularios/inputs.
- **Test de regresión:** test que evita que un bug arreglado vuelva a aparecer.

---

## Backend

### Nuevo endpoint (Edge Function)

```txt
Tarea: Crear una Supabase Edge Function llamada <EDGE_FUNCTION>.

Antes de codear:
- Lee y aplica: agent_docs/supabase/functions/00_lovable_guide.md (estructura, responses, auth/authz, shared, logging, env, seguridad).

Requisitos:
- Crear en supabase/functions/<edge-function>/index.ts (kebab-case).
- Endpoint privado por defecto (requiere usuario autenticado).
- Validar input (campos requeridos + límites).
- Respuestas estándar (success/error) y manejo de errores consistente.
- Logging seguro (sin tokens/PII).
- Reutilizar _shared (no duplicar helpers).

Entrega:
- Plan corto (archivos + pasos).
- Implementación.
- Test mínimo si hay lógica crítica o helpers nuevos.
```

### Nuevo Endpoint público (Edge)

```txt
Tarea: Crear un endpoint público en Edge Function <EDGE_FUNCTION> para <CASO_USO_PUBLICO>.

Antes de codear:
- Lee y aplica: agent_docs/supabase/functions/00_lovable_guide.md.

Requisitos:
- Documentar en README.md de la función que es público y por qué.
- Validar input con más rigor + límites anti abuso (tamaño, longitudes, arrays).
- Respuestas estándar y errores sin detalles internos.
- Logging seguro (sin datos sensibles).

Entrega:
- Plan corto + archivos.
- Implementación + README.
- Test mínimo para casos: inválido (400) y éxito (200/201).
```

### Nuevo Endpoint admin-only (Edge)

```txt
Tarea: Crear/ajustar un endpoint admin-only en <EDGE_FUNCTION> para <OPERACION_ADMIN>.

Antes de codear:
- Lee y aplica: agent_docs/supabase/functions/00_lovable_guide.md (auth vs authz, adminClient, seguridad).

Requisitos:
- Autenticación obligatoria.
- Autorización explícita antes de ejecutar (verificar rol/permiso admin).
- Usar adminClient solo después de confirmar permisos.
- Logging de auditoría (qué operación, sobre qué entidad, quién la pidió), sin datos sensibles.

Entrega:
- Plan corto (cómo validar permiso + flujo).
- Implementación.
- Test mínimo para: no-auth (401), no-permiso (403), éxito (200/201).
```

### Crear una Tabla en la Base de Datos

```txt
Tarea: Agregar la tabla <TABLA> para soportar <FUNCIONALIDAD>.

Antes de codear:
- Lee y aplica: agent_docs/supabase/db/00_lovable_guide.md (naming, migraciones, RLS baseline, soft delete, índices).

Requisitos:
- Crear migración para la tabla con columnas requeridas (id, created_at, updated_at, deleted_at si aplica).
- Definir PK/FKs y ON DELETE explícito.
- Habilitar RLS y políticas baseline (owner-only si aplica).
- Índices necesarios (especialmente FKs y patrones de consulta).
- Evitar cambios manuales en Dashboard.

Entrega:
- Plan corto (tabla + relaciones + policies + índices).
- Migración(es) listas.
- Nota breve si hay impacto en edge/react (qué endpoints/hooks tocar).
```

### Cambio incompatible en Base de Datos (Renombrar / Cambiar tipo de una columna)

```txt
Tarea: Hacer un cambio incompatible en <TABLA> (rename/type change) sin romper producción.

Antes de codear:
- Lee y aplica: agent_docs/supabase/db/00_lovable_guide.md (cambios por etapas: add/backfill/swap/drop).

Requisitos:
- Proponer el plan por etapas:
  1) agregar lo nuevo (columna/tabla),
  2) backfill/migración de datos,
  3) actualizar el código/edge para usar lo nuevo,
  4) eliminar lo viejo en una etapa posterior.
- Separar en migraciones cuando corresponda para reducir riesgo.

Entrega:
- Plan corto con etapas y archivos.
- Migración(es) correspondientes.
- Lista de cambios necesarios en edge/react (si aplica).
```

### Ajustar Políticas RLS (owner-only + excluir soft-deleted)

```txt
Tarea: Ajustar RLS policies para <TABLA>.

Antes de codear:
- Lee y aplica: agent_docs/supabase/db/00_lovable_guide.md (RLS baseline, tablas user-owned, soft delete).

Requisitos:
- Asegurar que usuarios solo puedan ver/modificar sus propios registros (owner-only) cuando aplique.
- Asegurar que SELECT/UPDATE excluyan registros soft-deleted (por ejemplo deleted_at != null).
- No dar DELETE físico a usuarios en tablas con soft delete (si aplica).
- Hacer cambios vía migración y con naming consistente de policies.

Entrega:
- Plan corto: qué policies existen hoy y qué se cambiará.
- Migración lista con policies actualizadas.
```

### Implementar hard delete excepcional

```txt
Tarea: Implementar hard delete para <TABLA>/<ENTIDAD> (solo si es estrictamente necesario).

Antes de codear:
- Lee y aplica: agent_docs/supabase/db/00_lovable_guide.md (hard delete como excepción, retención/PII).
- Si es desde Edge: agent_docs/supabase/functions/00_lovable_guide.md (logging y seguridad).

Requisitos:
- Justificar por qué no sirve soft delete (legal/temporal/aprobado).
- Documentar el motivo y alcance (README si aplica).
- Agregar logging de auditoría (sin datos sensibles).
- Mantener respuestas estándar.

Entrega:
- Plan corto + justificación.
- Implementación (DB/Edge según aplique) + documentación.
- Test mínimo si hay lógica crítica.
```

---

## Frontend

### Crear una nueva vista

```txt
Tarea: Agregar una nueva vista/pantalla para <FUNCIONALIDAD>.

Antes de codear:
- Lee y aplica: agent_docs/frontend/00_lovable_guide.md (estructura por features, React Query, skeletons, forms/testing si aplica).

Requisitos:
- Crear la pantalla en src/pages/<ruta>.tsx, manteniéndola "delgada".
- Extraer la lógica a src/features/<FUNCIONALIDAD>/ (components/hooks/schemas según corresponda).
- Data fetching con React Query: query hook reutilizable (no inline en el componente).
- Loading inicial con Skeletons (no full spinner).
- Manejo de errores visible cerca del contenido.

Entrega:
- Plan corto (archivos a tocar + pasos).
- Implementación con cambios pequeños y consistentes.
- Si agregas un schema o lógica no trivial, añade test mínimo.
```

### Agregar CRUD para una funcionalidad

```txt
Tarea: Implementar CRUD para <ENTIDAD> dentro del feature <FUNCIONALIDAD> (listar, crear, editar, eliminar).

Antes de codear:
- Lee y aplica: agent_docs/frontend/00_lovable_guide.md.

Requisitos:
- UI en src/features/<FUNCIONALIDAD>/components/.
- Queries y mutations en hooks reutilizables dentro de src/features/<FUNCIONALIDAD>/hooks/.
- Centralizar query keys (no strings inline).
- Listado con Skeletons en carga inicial.
- Create/Update/Delete con mutations + invalidations al terminar bien.
- Borrado por defecto: soft delete si el backend/DB lo soporta.

Entrega:
- Plan corto + archivos.
- Implementación incremental (PR/diff pequeño).
- Test mínimo si hay schema nuevo o bugfix/lógica crítica.
```

### Refactor de pantalla grande (mover a estructura de carpetas por feature)

```txt
Tarea: Refactor de la pantalla src/pages/<ruta>.tsx para mover lógica a src/features/<FUNCIONALIDAD>/ sin cambiar comportamiento.

Antes de codear:
- Lee y aplica: agent_docs/frontend/00_lovable_guide.md (feature boundaries y organización).

Requisitos:
- Dejar src/pages/<ruta>.tsx como wrapper (ensamblaje).
- Extraer hooks, queries/mutations, schemas y componentes a src/features/<FUNCIONALIDAD>/.
- Mantener cambios pequeños: no reescribir UI completa, solo reorganizar y mejorar lo mínimo.
- Asegurar Skeletons en cargas y errores claros.

Entrega:
- Plan corto: qué extraer primero.
- Refactor por pasos (commits/diff pequeño).
- Si tocas una lógica que antes fallaba, agrega test de regresión mínimo.
```

### Agregar formulario (Zod + React Hook Forms)

```txt
Tarea: Crear un formulario para <ENTIDAD> (create o edit) dentro del feature <FUNCIONALIDAD>.

Antes de codear:
- Lee y aplica: agent_docs/frontend/00_lovable_guide.md (forms con Zod + RHF, mutations, loading).

Requisitos:
- Schema Zod en src/features/<FUNCIONALIDAD>/schemas/<entity>Schema.ts.
- Form con react-hook-form + zodResolver y defaultValues completos.
- Submit llama a un mutation hook (no llamar Supabase directo desde el form).
- Estado de envío: botón disabled + spinner.
- Feedback al finalizar: toast / cerrar modal / reset / navegación (según el caso).

Entrega:
- Plan corto + archivos.
- Implementación.
- Test mínimo: al menos 1 caso inválido del schema (si es nuevo).
```

### Corregir bug en Frontend + test de regresión mínimo

```txt
Tarea: Corregir el bug "<DESCRIPCION_BUG>" en <FUNCIONALIDAD>.

Antes de codear:
- Lee y aplica: agent_docs/frontend/00_lovable_guide.md (patrones y testing mínimo).

Requisitos:
- Reproducir el bug leyendo el código actual y detectar causa raíz.
- Arreglar con el cambio más pequeño posible.
- Agregar test de regresión mínimo que falle antes y pase después (sin snapshots).

Entrega:
- Plan corto: causa → fix → test.
- Implementación + test.
```

### Estandarizar data fetching (extraer queries/mutations)

```txt
Tarea: Estandarizar el data fetching en <FUNCIONALIDAD>.

Antes de codear:
- Lee y aplica: agent_docs/frontend/00_lovable_guide.md (React Query, queryKeys, hooks reutilizables).

Requisitos:
- Detectar queries/mutations inline dentro de componentes.
- Extraer a hooks reutilizables en src/features/<FUNCIONALIDAD>/hooks/ (o src/hooks/ si es cross-feature).
- Centralizar/normalizar query keys (no keys inline).
- Ajustar invalidations en onSuccess para mantener la UI consistente.

Entrega:
- Plan corto + lista de componentes a tocar.
- Implementación por pasos (diff pequeño).
- Si cambias lógica crítica, agrega test mínimo.
```

## Testing

### Testing mínimo (schema / hook / edge)

```txt
Tarea: Agregar tests mínimos para <AREA> (schema/hook/edge) en <FUNCIONALIDAD>.

Antes de codear:
- Si es React: agent_docs/frontend/00_lovable_guide.md (testing mínimo).
- Si es Edge: agent_docs/supabase/functions/00_lovable_guide.md (testing mínimo).
- Si es DB: agent_docs/supabase/db/00_lovable_guide.md (validación por migraciones/policies).

Requisitos:
- Evitar snapshot tests.
- Enfocar en comportamiento:
  - schema: caso inválido mínimo,
  - hook: lógica/transformación relevante,
  - edge: casos 400/401-403/200 (según aplique).
- Mantener tests pequeños y rápidos.

Entrega:
- Plan corto: qué se testea y por qué.
- Tests implementados.
```
