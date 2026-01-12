---
slug: /frontend/architecture/rules
title: Reglas de  FDS
sidebar_position: 2
---

## 0) Reglas base (lo que no se negocia)

### 0.1 Regla de imports (anti-spaghetti)

**Solo se permite importar hacia abajo, nunca hacia arriba:**

`app → pages → widgets → features → entities → shared`

**Prohibido**

- ❌ `features → features` (no imports cruzados entre features)
- ❌ `entities → features/widgets/pages/app`
- ❌ `shared → cualquier layer externo`
- ❌ `widgets → pages/app`
- ❌ `pages → app`

---

### 0.2 Separación Next.js: `app` vs `pages` vs `widgets`

En App Router, `app/` es obligatorio para routing, pero **no es** el lugar donde vive la “pantalla”.

- `app/` = **routing + wiring mínimo por URL** (sin UI pesada)
- `pages/` = **pantallas (screens)**: composición principal de la vista
- `widgets/` = **bloques grandes** reutilizables dentro de pages
- `features/` = acciones (intenciones del usuario)
- `entities/` = dominio (capacidad base)
- `shared/` = base reusable genérica

**Regla de oro**

- `app/**/page.tsx` solo renderiza una `page` y pasa props si aplica.
- `pages/*` compone **varios widgets** y conecta features/entities.
- `widgets/*` encapsulan secciones grandes reutilizables (sin “volverse page”).

# AQUI FALTA EJEMPLO

## 1) Estructura mínima del repo

```text
src/
  app/        # Next routing ONLY
  pages/      # Screens (FSD pages layer)
  widgets/
  features/
  entities/
  shared/
```

Verifica que esten configurado los alias `@/*` → `src/*` para imports consistentes:

```text
- `@/pages/...`
- `@/widgets/...`
- `@/features/...`
- `@/entities/...`
- `@/shared/...`
```

## 2) Cómo se arma una URL en Next (App Router) sin romper FSD

### 2.1 `app/**/page.tsx` (wiring mínimo)

Ejemplo:

```tsx
// src/app/(dashboard)/products/page.tsx
import { ProductsPage } from '@/pages/products';

export default function Page() {
  return <ProductsPage />;
}
```

✅ app no contiene UI real, solo conecta ruta → page.

## 3) Cómo se arma una pantalla (pages) componiendo varios widgets

### 3.1 Estructura de una page

```text
pages/
  products/
    ui/
      ProductsPage.tsx
    index.ts
```

### 3.2 Ejemplo real: page componiendo varios widgets

```tsx
// src/pages/products/ui/ProductsPage.tsx
import { PageHeader } from '@/widgets/page-header';
import { ProductFiltersPanel } from '@/widgets/product-filters-panel';
import { ProductList } from '@/widgets/product-list';
import { CartSummaryBar } from '@/widgets/cart-summary-bar';

export function ProductsPage() {
  return (
    <div>
      <PageHeader title="Products" />
      <ProductFiltersPanel />
      <ProductList />
      <CartSummaryBar />
    </div>
  );
}
```

✅ Aquí queda clara la separación:

pages arma la vista final con múltiples widgets.

widgets encapsulan secciones grandes reutilizables.

## 4) Plantillas listas para copiar/pegar (Slices)

> Regla: cada slice tiene **Public API** (index.ts) y se consume por ahí.  
> Evitamos “barrels globales”; sí usamos `index.ts` **delgado** por slice.

### 4.1 Plantilla de Widget (bloque grande reutilizable)

Ej: `widgets/product-list`

```text
widgets/
  product-list/
    ui/
      ProductList.tsx
    index.ts
```

```ts
// src/widgets/product-list/index.ts
export { ProductList } from './ui/ProductList';
```

Widget que consume entities + features

```tsx
// src/widgets/product-list/ui/ProductList.tsx
import { useQuery } from '@tanstack/react-query';
import { productQueries } from '@/entities/product';
import { ProductCard } from '@/entities/product';
import { AddToCartButton } from '@/features/cart/add-to-cart';

export function ProductList() {
  const { data = [], isLoading } = useQuery(productQueries.listOptions());

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data.map((p) => (
        <div key={p.id}>
          <ProductCard product={p} />
          <AddToCartButton productId={p.id} />
        </div>
      ))}
    </div>
  );
}
```

✅ El widget compone entity UI + feature action.

### 4.2 Plantilla de Entity (dominio) — TanStack Query “por entity”

Ej: entities/product

```text
entities/
  product/
    model/
      types.ts
    api/
      product.query.ts
      get-products.ts
      get-product.ts
      create-product.ts
      update-product.ts
      delete-product.ts
    ui/
      ProductCard.tsx
    index.ts
```

# FALTA DEFINIR SE PONE ESTOS TENTATIVOS model/types.ts

```ts
export type ProductId = string;

export type Product = {
  id: ProductId;
  title: string;
  priceCents: number;
};
```

# FALTA DEFINIR SE PONE ESTOS TENTATIVOS api/get-products.ts (fetcher)

```ts
import { apiClient } from '@/shared/api';
import type { Product } from '../model/types';

export async function getProducts(): Promise<Product[]> {
  const res = await apiClient.get('/products');
  if (!res.ok) return [];
  return res.json();
}
```

# FALTA DEFINIR SE PONE ESTOS TENTATIVOS api/product.query.ts (query factory + keys)

```tsx
import { queryOptions } from '@tanstack/react-query';
import { getProducts } from './get-products';

export const productQueries = {
  all: () => ['product'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...productQueries.all(), 'list', filters] as const,

  listOptions: (filters?: Record<string, unknown>) =>
    queryOptions({
      queryKey: productQueries.list(filters),
      queryFn: () => getProducts(),
    }),
};
```

ui/ProductCard.tsx (representacional)

```tsx
import type { Product } from '../model/types';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article>
      <h3>{product.title}</h3>
      <p>{product.priceCents}</p>
    </article>
  );
}
```

index.ts (Public API delgado)

```tsx
export type { Product, ProductId } from './model/types';
export { ProductCard } from './ui/ProductCard';
export { productQueries } from './api/product.query';
export { getProducts } from './api/get-products';
```

### 4.3 Plantilla de Feature (acción/flujo) — cuándo tiene api/

Regla rápida:

Si la feature solo usa operaciones base del dominio → NO duplicar api, consume entities/\*.

Si hay endpoint orquestador del flujo o lógica de mutation (cache/toasts/optimistic) → features/\*/api.

Ejemplo: features/cart/add-to-cart (hook de mutation + UI)

```text
features/
  cart/
    add-to-cart/
      api/
        use-add-to-cart.ts
      ui/
        AddToCartButton.tsx
      index.ts
```

api/use-add-to-cart.ts (useMutation + cache)

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCartItem } from '@/entities/cart';
import { cartQueries } from '@/entities/cart';

export function useAddToCart() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: addCartItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cartQueries.all() });
    },
  });
}
```

ui/AddToCartButton.tsx

```tsx
'use client';

import type { ProductId } from '@/entities/product';
import { Button } from '@/shared/ui/button';
import { useAddToCart } from '../api/use-add-to-cart';

export function AddToCartButton({ productId }: { productId: ProductId }) {
  const m = useAddToCart();

  return (
    <Button
      disabled={m.isPending}
      onClick={() => m.mutate({ productId, quantity: 1 })}
    >
      {m.isPending ? 'Adding...' : 'Add to cart'}
    </Button>
  );
}
```

index.ts

```ts
export { AddToCartButton } from './ui/AddToCartButton';
export { useAddToCart } from './api/use-add-to-cart';
```

✅ Aquí la feature tiene api/ porque contiene el hook de TanStack Query (mutación + cache behavior del flujo).
✅ El fetcher addCartItem vive en entities/cart/api (dominio).

## 5) Dónde va la API: reglas definitivas (entity vs feature)

### Va en `entities/<entity>/api` si…

- El request corresponde a **una sola entity** (puro dominio)
- Es un CRUD o comando base del dominio:
  - `getProduct`, `createProduct`, `updateProduct`
  - `addCartItem`, `removeCartItem`

### Va en `features/<flow>/api` si…

- Es un endpoint “de flujo” que mezcla entidades
- O el archivo define un **hook** `useMutation/useQuery` con:
  - cache updates (`invalidateQueries`, `setQueryData`)
  - optimistic updates
  - side effects del flujo (toasts, tracking)

**Regla corta para PR**

- **Fetcher** → entity
- **Hook de TanStack (behavior)** → feature (si es específico del flujo)

## 6) Public API (`index.ts`) sin “barrel hell”

### Qué hacemos en este proyecto

- ✅ `index.ts` **por slice** como contrato (Public API)
- ✅ `index.ts` **delgado** (exporta solo lo que se usa fuera)
- ❌ No `index.ts` globales por layer (no `features/index.ts` exportando todo)
- ❌ No re-export masivo de 50 cosas

### Por qué sigue siendo buena práctica aquí

En FSD, el objetivo no es “barrel por comodidad”, es **enforzar límites**:

- no deep imports
- slices removibles
- API estable para consumo

## 7) Estructura final (ejemplo completo ya armado)

```text
src/
  app/
    (dashboard)/
      products/
        page.tsx

  pages/
    products/
      ui/
        ProductsPage.tsx
      index.ts

  widgets/
    page-header/
      ui/
        PageHeader.tsx
      index.ts
    product-filters-panel/
      ui/
        ProductFiltersPanel.tsx
      index.ts
    product-list/
      ui/
        ProductList.tsx
      index.ts
    cart-summary-bar/
      ui/
        CartSummaryBar.tsx
      index.ts

  features/
    cart/
      add-to-cart/
        api/
          use-add-to-cart.ts
        ui/
          AddToCartButton.tsx
        index.ts

  entities/
    product/
      model/
        types.ts
      api/
        product.query.ts
        get-products.ts
      ui/
        ProductCard.tsx
      index.ts
    cart/
      api/
        cart.query.ts
        add-cart-item.ts
      index.ts

  shared/
    api/
      apiClient.ts
      index.ts
    ui/
      button/
        Button.tsx
      index.ts
```
