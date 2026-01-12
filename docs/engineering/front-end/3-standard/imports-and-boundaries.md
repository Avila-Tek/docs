---
slug: /frontend/standards/imports-and-boundaries
title: Imports y boundaries
sidebar_position: 1
---

## Use Absolute Paths (obligatorio)

**Regla**

- ✅ Importa usando alias `@/` (rutas absolutas).
- ❌ Evita `../../..` fuera de la carpeta local.

**Por qué**

- Mejora refactors, reduce errores, acelera lectura en PR.

**Ejemplos**

```ts
// ✅ bien
import { Button } from '@/shared/ui/button';
import { ProductCard } from '@/entities/product';
import { AddToCartButton } from '@/features/cart/add-to-cart';

// ❌ mal
import { Button } from '../../../shared/ui/button';
```

## Manage Dependencies Between Modules (evitar spaghetti)

**Regla**

✅ Consumir otros módulos solo por su Public API (index.ts del slice).

❌ No hacer deep imports a archivos internos de otro slice.

**Ejemplos**

```ts
// ✅ bien
import { ProductCard } from '@/entities/product';

// ❌ mal: deep import (rompe encapsulación)
import { ProductCard } from '@/entities/product/ui/ProductCard';
```

Estándar

Cada slice decide qué exporta. Lo no exportado = privado.

Cambios internos no deben romper consumidores.

## Keep Things Close to Where They’re Used

**Regla**

- ✅ Helpers y lógica que solo usa un componente/slice, viven dentro del slice.
- ❌ No mover a shared/ “por si acaso”.

Guía práctica

Si solo se usa en un lugar → queda local (mismo slice/segment).

Si se usa en 2 lugares, pero mismos dominios → evaluar subir al mismo slice (lib/model).

Si se usa en múltiples dominios (sin negocio) → shared/lib.

**Ejemplo**

```ts
// ✅ bien: helper cerca del uso
// src/features/cart/add-to-cart/model/formatQuantity.ts
export function formatQuantity(qty: number) {
  return Math.max(1, Math.floor(qty));
}
```
