---
slug: /frontend/standards/good-practices
title: Buenas practicas
sidebar_position: 5
---

## React APIs solo vía React

❌ Importar hooks desde React

✅ Importar solo React y usar React.useState, React.useEffect, etc.

```tsx
// ❌
import React, { useState } from 'react';

export default function Component() {
  const [value, setValue] = useState<string>('');
  return <div>{value}</div>;
}
```

```tsx
// ✅
import React from 'react';

export default function Component() {
  const [value, setValue] = React.useState<string>('');
  return <div>{value}</div>;
}
```

## Write Deep Components

**Regla**

✅ Preferir componentes con intención clara y “completos” (no 20 props para todo).

✅ Composición > configuraciones infinitas.

Patrón recomendado: Stateful + Stateless

**Stateful (Container): data/estado/orquestación**

**Stateless (View): solo props + render**

[Aprenda más sobre este patrón de diseño](https://www.patterns.dev/react/presentational-container-pattern/)

**Ejemplo**

```tsx
// ✅ Stateless
export function ProductListView({ items }: { items: Product[] }) {
  return (
    <ul>
      {items.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

```tsx
// ✅ Stateful
export function ProductList() {
  const items = useProducts(); // hook (state/data)
  return <ProductListView items={items} />;
}
```

## Prefer Async/Await over .then()

**Regla**

✅ Usa async/await con try/catch

✅ Maneja errores de forma clara y centralizada

❌ Evita cadenas largas de .then()

```tsx
//❌
function fetchData() {
  fetch('/api/data')
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error(err));
}
```

```tsx
//✅
async function fetchData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

## Use Promise.all for Parallel Async Work

**Regla**

✅ Ejecuta promesas independientes en paralelo

❌ No hagas llamadas asíncronas secuenciales innecesarias

```tsx
// ❌
async function loadData() {
  const a = await fetch('/a');
  const b = await fetch('/b');
  const c = await fetch('/c');
}
```

```tsx
//✅
async function loadData() {
  const [a, b, c] = await Promise.all([fetch('/a'), fetch('/b'), fetch('/c')]);
}
```

## Avoid await Inside Loops

**Regla**

✅ Usa Promise.all para procesar colecciones
❌ No uses await dentro de bucles cuando no es necesario

```tsx
// ❌
async function processItems(items) {
  for (const item of items) {
    await processItem(item);
  }
}
```

```tsx
// ✅
async function processItems(items) {
  await Promise.all(items.map((item) => processItem(item)));
}
```

## Avoid Prop Drilling

**Regla**

✅ Pasa props solo 3 niveles máximo

✅ Si un dato se usa en múltiples niveles, usa Context, hooks o composición

❌ No atravieses múltiples componentes solo para pasar props

```tsx
// ❌
function App({ user }) {
  return <Layout user={user} />;
}

function Layout({ user }) {
  return <Sidebar user={user} />;
}

function Sidebar({ user }) {
  return <UserMenu user={user} />;
}

function UserMenu({ user }) {
  return <span>{user.name}</span>;
}
```

## Avoid Short-Circuit Conditional Rendering

En JavaScript, el operador && no devuelve un boolean, sino el primer valor falsy o el último truthy. Cuando se usa `cond && <Component />` y cond no es un boolean estricto (por ejemplo items.length, que es un number), React puede terminar renderizando valores inesperados como 0, ya que los números son renderizables.

Esto provoca bugs silenciosos y hace que la intención del código no sea clara. Por eso, en lugar de `items.length && <List />`, se debe usar una condición explícita como `items.length > 0 ? <List /> : <Empty />`, que deja claro el comportamiento esperado y evita renderizados incorrectos.

**Regla**

✅ Usa ternary explícito o null

❌ No uses `cond && <X />` cuando cond no es boolean estricto

```tsx
// ❌ items.length es number (0, 1, 2...)
return items.length && <List items={items} />;

// ✅
return items.length > 0 ? <List items={items} /> : <Empty />;
```

## Avoid Nested Ternary Operators

**Regla**

✅ Si hay 1+ condicional anidado, usa map o switch fuera del JSX

✅ Cuando el UI depende de “estado” o “tipo”, usa mapas

❌ No ternarios anidados

```tsx
❌ Nested tenaries
return (
  <div>{isAdmin ? isOwner ? <A /> : isEditor ? <B /> : <C /> : <D />}</div>
);
```

```tsx
❌ Nested conditional rendering
return (
  <div>
    {status === 'loading' ? (
      <Spinner />
    ) : status === 'error' ? (
      errorType === 'network' ? (
        <NetworkError />
      ) : (
        <GenericError />
      )
    ) : status === 'success' ? (
      isAdmin ? (
        <AdminView />
      ) : (
        <UserView />
      )
    ) : (
      <Idle />
    )}
  </div>
);
```

```tsx
// ✅ component map
const byStatus: Record<Status, React.ReactNode> = {
  idle: <Idle />,
  loading: <Spinner />,
  error: <ErrorState />,
  success: <Success />,
};

return byStatus[status];
```

## Write Comments in JSX (solo cuando agrega contexto)

**Reglas**

✅ Comentarios para decisiones (“por qué”), no para obviedades

```tsx
return (
  <section>
    {/* We avoid showing this for guests due to compliance requirements */}
    {isGuest ? null : <SensitivePanel />}
  </section>
);
```

## Always Destructure Props

**Reglas**

✅ Siempre destructuring en la firma

✅ Defaults ahí mismo

```tsx
type Props = { title?: string; tags?: string[] };

export function Header({ title = '', tags = [] }: Props) {
  return (
    <h1>
      {title} ({tags.length})
    </h1>
  );
}
```

## Avoid Spreading Props

**Regla**

✅ Pasa props explícitas o pasa un objeto único intencional

❌ No ...props sin control (oculta API)

```tsx
// ❌
<UserProfile {...user} />
```

```tsx
// ✅
<UserProfile user={user} />
```

## Move Lists in Components (limpia el JSX)

**Regla**

✅ Prepara arrays/filtrados arriba, JSX abajo

❌ No metas filtros + mapas complejos dentro del return

```tsx
// ❌
return (
  <ul>
    {items
      .filter((item) => item.active && item.type !== 'archived')
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((item) => (
        <Row key={item.id} item={item} isHighlighted={item.priority > 5} />
      ))}
  </ul>
);
```

```tsx
// ✅
const visible = items.filter((x) => x.active);

return (
  <ul>
    {visible.map((x) => (
      <Row key={x.id} item={x} />
    ))}
  </ul>
);
```

## Avoid Nested Render Functions

**Regla**

✅ Si renderizas repetido, extrae componente (Row) o función pura fuera del JSX

❌ No declares “mini-components” dentro del render para mapas complejos

```tsx
// ❌ (tiende a crecer y ensucia el render)
return items.map((x) => {
  const label = x.active ? 'Active' : 'Disabled';
  return <div key={x.id}>{label}</div>;
});
```

```tsx
// ✅
function Row({ item }: { item: Item }) {
  const label = item.active ? 'Active' : 'Disabled';
  return <div>{label}</div>;
}

return items.map((x) => <Row key={x.id} item={x} />);
```

## Use Intermediate Variables for Readability

**Regla**

✅ Usa variables intermedias para describir condiciones complejas  
✅ Prefiere nombres semánticos que expliquen la intención  
❌ No pongas lógica compleja directamente en condicionales

```ts
//❌
if (user.isLoggedIn && user.token !== null && user.role !== 'guest') {
  // lógica
}
```

```tsx
const isUserAuthenticated =
  user.isLoggedIn && user.token !== null && user.role !== 'guest';

if (isUserAuthenticated) {
  // lógica
}
```

## Single Responsibility Principle (SRP)

**Regla**

✅ Cada función o componente debe tener una sola responsabilidad
✅ Separa lógica de negocio, efectos secundarios y UI
❌ No mezcles múltiples responsabilidades en una sola unidad

```tsx
// ❌
function createUserAndDisplay(name, age) {
  const user = { name, age };
  saveUser(user);

  const userList = document.getElementById('userList');
  userList.innerHTML += `<li>${user.name} - ${user.age}</li>`;
}
```

```tsx
function createUser(name, age) {
  const user = { name, age };
  saveUser(user);
  return user;
}

function displayUser(user) {
  const userList = document.getElementById('userList');
  userList.innerHTML += `<li>${user.name} - ${user.age}</li>`;
}
```

## Always Handle Loading and Empty States

**Regla**

✅ Todo flujo async debe manejar explícitamente loading, empty y error
✅ El usuario siempre debe saber qué está pasando

❌ No asumas que siempre habrá datos
❌ No dejes pantallas en blanco mientras carga

```tsx
//❌
function UserList() {
  const { data } = useUsers();

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

```tsx
//✅
function UserList() {
  const { data, isLoading, error } = useUsers();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState />;
  if (!data || data.length === 0) return <EmptyState />;

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## Differentiate Handled vs Unhandled Errors

**Regla**

✅ Distingue claramente entre errores **manejados** y **no manejados**

✅ Los errores manejados deben mostrar **feedback específico al usuario**

✅ Los errores no manejados deben registrarse (logs, monitoring) y mostrar un mensaje genérico

❌ No muestres errores técnicos crudos al usuario final

❌ No silencie errores no manejados

```tsx
//❌
try {
  await submitForm(data);
} catch (error) {
  alert('Something went wrong');
}
```

```tsx
//✅
try {
  await submitForm(data);
} catch (error) {
  if (error instanceof ValidationError) {
    showToast('Email is invalid');
  } else if (error instanceof UnauthorizedError) {
    showToast('Your session has expired. Please log in again.');
  } else {
    logError(error);
    showToast('Unexpected error. Please try again later.');
  }
}
```
