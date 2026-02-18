---
title: React
sidebar_position: 3
slug: /code-standards/react
---

# React Standards (React + TypeScript + Vite)

Estándares de calidad para el **frontend en React**.  
Aplican igual si el código lo escribe una persona o una IA (Lovable u otra).

> Objetivo: **máxima velocidad** con cambios pequeños y consistentes, evitando retrabajo.

---

## Glosario

- **React:** Librería para construir interfaces (UI) a base de componentes reutilizables.
- **React Query:** Librería para manejar datos “del servidor” en React (carga, cache, reintentos, estados de loading/error) sin tener que hacerlo manualmente con `useEffect`.
- **Client components:** Componentes que se ejecutan principalmente en el navegador. Se usan cuando necesitas interacción del usuario, estado local, o APIs del browser.
- **Server components:** Componentes que se renderizan del lado del servidor. Ayudan a mejorar performance y reducir JavaScript en el cliente cuando no necesitas interacción.
- **Hook:** Función reutilizable (normalmente empieza con `use...`) que encapsula lógica de React. Se usa para compartir comportamiento entre componentes (por ejemplo: cargar datos, manejar formularios o estado).
- **Query (consulta):** Lectura de datos (por ejemplo: “traer lista de proyectos”). En React Query suele ser `useQuery`.
- **Mutation (mutación):** Acción que cambia datos (crear/editar/eliminar). En React Query suele ser `useMutation`.
- **Loading state:** Estado donde la UI todavía está esperando datos o una acción está en progreso (por ejemplo, mientras carga una pantalla o se envía un formulario).
- **Skeleton:** Placeholder visual (bloques/grises) que imita la forma del contenido mientras carga. Da sensación de velocidad y evita “saltos” en el layout.
- **Forms (formularios):** Pantallas o componentes donde el usuario ingresa datos (inputs, selects, etc.) para enviarlos al sistema.
- **Zod:** Librería para definir reglas de validación y tipos (schemas). Sirve para validar datos de formularios y garantizar consistencia.
- **Schema:** Conjunto de reglas que define la “forma” y validaciones de unos datos. En el frontend lo usamos principalmente con Zod para asegurar que lo que el usuario envía (o lo que recibimos) tenga el formato correcto antes de procesarlo.
- **shadcn/ui:** Colección de componentes UI (Button, Dialog, Input, etc.) construidos sobre Radix + Tailwind. Nos da una base consistente y rápida para construir interfaces.
- **Testing:** Pruebas automatizadas que verifican que el código hace lo esperado. Nos sirven para detectar errores rápido, evitar regresiones y mantener velocidad sin romper cosas.

---

## Reglas no negociables

- **1 componente React por archivo** (no exportar “helper components” junto al principal).
- **Prohibido** `useEffect + useState` para data del server: usar **React Query**.
- **Prohibido** `as any` / `any`.
- **Prohibido** crear `index.ts` como barrel exports.
- **Imports siempre con `@/`** (no usar cadenas `../`).
- **Query keys centralizadas** en `src/lib/queryKeys.ts` (no strings inline).
- **Queries y mutations van fuera de los componentes**, en hooks reutilizables.
- **Loading states con Skeletons** (spinner solo para acciones de botón/form).
- **Forms siempre** con **Zod + react-hook-form + zodResolver**.
- UI primitives **solo shadcn/ui** (no MUI/Chakra/Ant).
- Styling con Tailwind usando `cn()` (no concatenar strings; no `style={{}}` para layout).

---

## Estructura de proyecto y límites (feature boundaries)

### Estructura base (dónde va cada cosa)

La idea es que el proyecto sea fácil de entender: **cada tipo de archivo tiene “su lugar”**.

- `src/pages/`
  - Aquí viven las **pantallas/rutas**.
  - Deben ser “delgadas”: arman la vista y conectan componentes.
  - Evitar meter aquí lógica pesada o llamadas directas a datos.

- `src/features/<domain>/`
  - Aquí vive cada **módulo funcional** (por ejemplo: `auth`, `projects`, `billing`).
  - Dentro de cada feature va todo lo relacionado a ese módulo:
    - `components/` (UI del feature)
    - `hooks/` (queries/mutations y lógica reutilizable)
    - `schemas/` (validaciones con Zod)

- `src/components/`
  - Componentes **reutilizables y genéricos** (sin reglas de negocio).
  - `src/components/ui/` (shadcn/ui):
    - no editar los componentes base generados,
    - si necesitas cambios, crea un wrapper/extensión.

- `src/hooks/`
  - Hooks **compartidos** que sirven en varios features (no específicos de uno).

- `src/lib/`
  - Utilidades y configuración general del proyecto:
    - `queryKeys.ts` (obligatorio): llaves centralizadas de React Query
    - `supabaseClient.ts`: un solo cliente de Supabase para todo el frontend
    - `utils.ts`: helpers generales (incluye `cn()`)

### Reglas de organización (para evitar “spaghetti”)

- Un feature no debería depender directamente de otro feature.
  - Si un feature necesita “algo” de otro, se resuelve de forma indirecta (por ejemplo, a través de queries/mutations o hooks compartidos).
- Si una pantalla en `src/pages/*` empieza a crecer demasiado (por ejemplo, pasa de ~80 líneas),
  - mueve la lógica y piezas reutilizables al feature correspondiente (`src/features/<domain>/`).
  - La pantalla debe quedarse como un “ensamble” de componentes.

---

## Type safety (Supabase types)

- Shapes de DB **solo** desde: `src/integrations/supabase/types.ts`.
- Para filas: usar `Tables<"table_name">` (no redefinir interfaces).
- Si el shape es incierto: usar `unknown` + type guard (no “casts”).

---

## Data Fetching (React Query)

### Regla principal

- Toda data del server se maneja con **React Query** (`useQuery`, `useMutation`).

### Query keys (obligatorio)

- Todas las keys viven en `src/lib/queryKeys.ts` como factory tipada (`as const`).
- Nunca usar keys como strings inline.

### Queries (Consultas)

- Cada “consulta de datos” debe vivir en un **hook propio**, para poder reutilizarla en distintas pantallas:
  - `src/features/<domain>/hooks/useX.ts` o `src/hooks/useX.ts`
- Ese hook debe devolver el resultado completo de React Query (loading, error, data), y la pantalla decide qué usar.
- Si al pedir datos Supabase responde con un error, **no lo ignores**:
  - la consulta debe fallar de forma controlada para que React Query lo trate como error (y la UI pueda mostrarlo bien).

### Mutations (Cambios de datos)

- Cada acción que **modifica datos** (crear/editar/eliminar) debe vivir en un **hook propio**:
  - `useCreateX.ts`, `useUpdateX.ts`, `useDeleteX.ts`
- Cuando una mutation termina bien, hay que **refrescar** la data relacionada:
  - usar `queryKeys` (centralizados) para que sea consistente y no se rompa por strings sueltos.
- Los datos que recibe la mutation (payload) deben ser consistentes:
  - idealmente salen de los tipos del backend/DB o del schema de validación del form (Zod).

### Configuración base de React Query (obligatoria)

- Definir una configuración estándar del `QueryClient` para evitar comportamientos inesperados:
  - Cuánto tiempo considerar la data “fresca”,
  - Cuándo limpiar cache,
  - Cuántas veces reintentar en errores.
  
La idea es no depender de valores por defecto “mágicos” que nadie recuerda.

---

## UI & Loading States (Tailwind + shadcn/ui)

### UI primitives

- Usar **shadcn/ui** para los componentes comunes (Button, Card, Dialog, Input, etc.).
- Evitar agregar otras librerías de UI para no mezclar estilos ni duplicar patrones.

### Styling (Estilos)

- Usar **Tailwind** como forma principal de estilizar.
- Para combinar clases condicionales, usar `cn()` (para mantener el código limpio y consistente).
- Evitar `style={{}}` para cosas de layout/espaciado; solo usarlo si Tailwind no lo cubre.
- Diseñar **mobile-first**:
  - Primero la versión móvil,
  - Luego mejoras con `md:` / `lg:` para pantallas grandes.

### Loading (Estados de carga)

- Cuando una pantalla o sección está cargando por primera vez:
  - Mostrar **Skeletons** que se parezcan al contenido real (para que se sienta rápido y estable).
- Cuando el usuario hace una acción (por ejemplo, enviar un form o guardar cambios):
  - Usar un spinner **dentro del botón** y deshabilitarlo mientras procesa.
- Cuando la data se actualiza “por detrás” (refetch automático):
  - No mostrar loading visible (debe ser silencioso).

### Errores

- Mostrar el error **cerca de donde ocurrió** (en la sección o campo afectado), no solo como toast.
- El mensaje al usuario debe ser claro y útil, pero sin exponer detalles internos (errores crudos, SQL, trazas, etc.).

---

## Forms (Zod + react-hook-form)

La meta es que todos los formularios sean fáciles de mantener y fallen de forma clara.

- Cada formulario debe tener su **validación en Zod** dentro del feature correspondiente:
  - `src/features/<domain>/schemas/<entity>Schema.ts`
- Ese archivo debe exportar:
  - El `schema` (las reglas de validación),
  - El tipo `FormValues` derivado del schema (para mantener todo consistente).

Reglas al crear el form:

- `useForm` siempre debe usar:
  - `zodResolver(schema)` para validar con Zod,
  - `defaultValues` completos para evitar comportamientos raros en los inputs.

UI del form:

- Usar los wrappers de **shadcn/ui** para mantener estilo y errores consistentes:
  - `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`

Al enviar (submit):

- El form **no llama a Supabase directo**.
  - Debe llamar a un **hook de mutation** (para poder reutilizarlo y mantener el patrón).
- Mientras se envía:
  - Mostrar spinner en el botón,
  - Deshabilitar el botón para evitar doble submit.
- Al terminar:
  - Dar feedback claro (toast, cerrar modal, resetear el form, o navegar), según corresponda.

---

## Testing (mínimo)

Cuándo agregar tests:

- **Nuevo schema Zod:** al menos 1 test que confirme que un caso inválido falla como esperamos.
- **Hooks con lógica real:** si un hook transforma datos, combina resultados o tiene reglas, agregar un test unitario.
- **Bugfix:** si arreglamos un bug de lógica, agregar un test de regresión para que no vuelva a ocurrir.

Qué evitar (para no perder velocidad en tests con poco valor):

- Snapshot tests.
- Tests que validen “internals” de librerías (React Query, shadcn/ui, Supabase client).
- Tests de UI “pura” sin lógica (renderizar por renderizar).

Herramientas recomendadas:

- **Vitest** (runner)
- **React Testing Library** (tests orientados al comportamiento)

---

# Checklist de calidad (React)

## A) Estructura y límites

- [ ] El cambio respeta feature boundaries (sin imports directos entre features).
- [ ] `src/pages/*` se mantiene thin (sin data fetching ni lógica compleja).
- [ ] 1 componente por archivo; archivo < ~200 líneas (si no, extraer subcomponentes/hooks).

## B) Imports y tipos

- [ ] Imports con `@/` (sin `../` chains).
- [ ] No hay `any` / `as any`.
- [ ] Tipos de DB salen de `src/integrations/supabase/types.ts` (`Tables<"...">`).

## C) Data fetching (React Query)

- [ ] No existe `useEffect + useState` para data del server.
- [ ] Queries/mutations están en hooks reutilizables (no inline en components).
- [ ] Query keys vienen de `src/lib/queryKeys.ts` (sin strings inline).
- [ ] Mutations invalidan queries con `queryKeys` en `onSuccess`.

## D) UI / Loading / Error states

- [ ] Initial load usa Skeletons (no full-page spinner).
- [ ] Acciones (submit/click) usan spinner dentro del botón + disabled.
- [ ] Errores se muestran cerca del contenido afectado (sin detalles técnicos).

## E) Forms

- [ ] Form tiene schema Zod + `zodResolver`.
- [ ] `defaultValues` definidos.
- [ ] Submit usa mutation hook (no Supabase directo).
- [ ] `<FormMessage>` se usa para errores (sin rendering manual redundante).

## F) Styling

- [ ] shadcn/ui para primitives; no librerías de UI adicionales.
- [ ] Tailwind + `cn()` (sin concatenación de clases).
- [ ] Sin `style={{}}` para layout/spacing.

## G) Testing (cuando aplica)

- [ ] Nuevo schema → test del caso inválido.
- [ ] Hook con lógica → test unitario.
- [ ] Bugfix de lógica → test de regresión.
