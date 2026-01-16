---
slug: /frontend/architecture/ui
title: UI layer
sidebar_position: 2
---

## UI — Components & Pages

### Responsabilidad

La capa de UI se encarga **exclusivamente de la experiencia de usuario**:

- Renderizar componentes
- Manejar estado visual (open/close, loading local, tabs)
- Escuchar eventos del usuario
- Mostrar resultados (success / error / empty states)

### Qué NO hace

- ❌ No contiene lógica de negocio
- ❌ No valida reglas del dominio
- ❌ No transforma datos del backend
- ❌ No conoce DTOs ni estructuras del API

```text
ui/
├── page/
├── widgets/
└── components/
```

## Tipos de archivos en UI

### 1. Pages

**Qué son**  
Componentes de alto nivel que representan una ruta o vista principal.

Una Page construye la pantalla combinando varios Widgets

**Responsabilidad**

- Componer widgets y components
- Conectar la UI con hooks / use-cases
- Manejar estados de carga y error

**Fetch en Page solo cuando la data se comparte**

Por defecto, cada Widget hace su propia query.
Solo considera poner una query en la Page cuando:

2+ widgets comparten la misma petición, o

necesitas cargar un recurso “root” para saber si renderizar la pantalla (ej: user no existe).

✅ Ejemplo: el user se usa en 3 widgets → la Page puede hacer useUserQuery() una vez.

**Evita bajar props innecesarias por muchos niveles desde el Page**

✅ Regla práctica:

Si un parámetro debe bajar más de 3 componentes, considera usar Context.

**Ejemplo**

```tsx
// ui/page/UserDashboardPage.tsx
export function UserDashboardPage({ userId }: { userId: string }) {
  // ✅ Query en Page porque el "user" se comparte en varios widgets
  const userQuery = useUserQuery(userId);

  // Estado global (root): si no hay user, no tiene sentido renderizar dashboard
  if (userQuery.isLoading) return <PageSkeleton />;
  if (userQuery.error) return <ErrorState message="Could not load user" />;
  if (!userQuery.data) return <EmptyState message="User not found" />;

  const user = userQuery.data;

  return (
    <div className="space-y-6">
      {/* Widgets reciben el user compartido */}
      <UserHeaderWidget user={user} />
      <UserProfileWidget user={user} />

      {/* Widgets con queries propias: loading independiente */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UserActivityWidget userId={userId} />
        <UserPermissionsWidget userId={userId} />
      </div>

      <UserMetaWidget user={user} />
    </div>
  );
}
```

### 2. Widgets

**Qué son**

Bloques de UI más complejos, con composición interna.

Cada Widget debe poder:

- renderizar su propio skeleton

- mostrar su propio error

- manejar su propio empty state

**Esto evita que:**

- toda la pantalla quede bloqueada por una sección

- un error parcial rompa toda la vista

**✅ Regla práctica:**

-Un Widget debe poder “vivir” aunque los otros widgets estén cargando o fallen.

**Responsabilidad**

- Agrupar varios components

- Manejar estado visual local

- Encapsular comportamiento UI

**Ejemplo**

```tsx
// ui/widgets/UserActivityWidget.tsx
export function UserActivityWidget({ userId }: { userId: string }) {
  const { data, isLoading, error } = useUserActivityQuery(userId);

  if (isLoading) return <CardSkeleton title="Recent activity" />;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <InlineError message="Could not load activity" />
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message="No activity yet" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={item.id} className="text-sm">
              {item.label}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
```

### 3. Components

**Qué son**
Componentes reutilizables enfocados en UI.

**Responsabilidad**

- Renderizar datos

- Emitir eventos (onClick, onSubmit)

- Recibir props claras

**Ejemplo**

```tsx
// ui/components/StatusBadge.tsx
export function StatusBadge({ status }: { status: 'ACTIVE' | 'BLOCKED' }) {
  return (
    <Badge variant={status === 'ACTIVE' ? 'success' : 'destructive'}>
      {status}
    </Badge>
  );
}
```

📌 Observa que:

- La UI no sabe cómo se obtiene el usuario

- La UI no sabe cómo es la respuesta del API

- Solo renderiza según el estado
