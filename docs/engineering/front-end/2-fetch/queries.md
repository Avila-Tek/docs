---
slug: /frontend/fetch/queries
title: Query
sidebar_position: 3
---

## Queries

- Obtener data del servidor.

Primero realizaremos un prefetching de los datos que deseamos desde el servidor; esto cargará nuestro caché con la respuesta de la consulta deseada.

```tsx
// 📁 /app/client/src/app/users/page.tsx
import { paginationInputSchema } from '@repo/schemas';
import React from 'react';
import z from 'zod';
import { getQueryClient } from '@/src/lib/get-query-client';
import { usersQueries } from '@/src/services/user/queries';
import { UsersQuery } from './users-query';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: Props) {
  const qs = await searchParams;
  const queryClient = getQueryClient();
  const parsed = paginationInputSchema.safeParse(qs);
  if (!parsed.success) {
    return (
      <p className="error">
        Error parsing params {z.prettifyError(parsed.error)}
      </p>
    );
  }
  void queryClient.prefetchQuery(
    usersQueries.pagination({
      page: parsed.data.page,
      perPage: parsed.data.perPage,
    }),
  );
  return <UsersQuery page={parsed.data.page} perPage={parsed.data.perPage} />;
}
```

<p align="right"><small>- Al hacer un prefetching, la data "Viajará" a nuestras queries en client-side 😊</small></p>

Y ahora procedemos a leer la data del cache sin problema alguno, para ello hacemos uso de useSuspenseQuery (también podríamos haber hecho uso de useQuery).

```tsx
// 📁 apps\client\src\app\users\users-query.tsx
'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';
import { usersQueries } from '@/src/services/user/queries';

export function UsersQuery({
  page,
  perPage,
}: {
  page: number;
  perPage: number;
}) {
  const query = useSuspenseQuery(usersQueries.pagination({ page, perPage }));
  if (query.error) {
    <p className="error">{query.error.message}</p>;
  }
  return <code>{JSON.stringify(query.data, null, 2)}</code>;
}
```

<p align="right"><small>- El prefetching funcionará siempre y cuando sus queryKeys sean iguales, en este ejemplo lo declaramos en el objeto userQueries 😜</small></p>

- Obtener desde el client.

Haremos uso de useQuery. Es importante mencionar que, si hiciéramos un prefetching desde el servidor de ciertos datos y se consultan en el cliente con useQuery, recibiríamos los datos de la caché, tal como en el caso de useSuspenseQuery. La diferencia entre ambas es cómo se gestiona el estado de carga (loading state).

```tsx
// 📁 apps\client\src\app\users\users-query.tsx
const query = useQuery(usersQueries.pagination({ page, perPage }));
```

- Manejar el loading state

Con useQuery, el estado de carga (loading state) se manejaría de forma manual; en cambio, con useSuspenseQuery, se haría a través de React.Suspense.
