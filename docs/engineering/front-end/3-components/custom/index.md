---
title: Custom
sidebar_position: 2
slug: /frontend/components/custom
---

# Custom components

## 🔎 Overview

A medida que vayamos desarrollando nuevos softwares, se hará más evidente para nosotros que hay ciertas piezas que siempre formarán parte de ellos. De aquí viene la importancia de identificar cuáles son dichas piezas y cómo podemos darles forma para que éstas puedan adaptarse a cualquier parte de nuestra aplicación. Estas piezas son a las que estaremos llamando componentes reutilizables.

> Un componente reutilizable es un componente lo suficientemente genérico que puede utilizarse en muchos casos y situaciones diferentes.
> 
> *Ada ITW*

Trabajar con estos componentes nos permite:
- **Ahorrar tiempo y esfuerzo:** solo se genera el componente una vez, en lugar de escribir casi el mismo código cada vez que se necesite.
- **Mejorar la consistencia y facilidad de mantenimiento de las aplicaciones:** si se requiere hacer algún arreglo, refactor o actualización, se hace solo una vez, sabiendo que lo que sea que se haga cambiará en todos los lugares que haya sido implementado el componente.


## Antes de empezar
Es recomendable hacernos estas preguntas antes de construir nuestros componentes, para saber cuál será nuestro approach a la hora de darles forma:

**1. ¿Dónde voy a volver a necesitarlo?**

Esto determinará en qué directorio del proyecto estará y si realmente hace falta generalizarlo.

**2. ¿Qué es y qué no es reutilizable?**

Hay partes del componente que siempre serán iguales y otras que variarán según el proyecto o su ubicación.

**3. ¿Qué necesita para funcionar y adaptarse al proyecto?**

Con esto sabremos cuándo enviar props y cuándo enviar children.


## Tips
Algunas cosas que pueden darnos algo de guidance cuando queramos construir un componente de este estilo son:

### Reemplazar cosas específicas por props
Enviar como props cosas como los classNames, iconos, acciones, etc., nos permite costumizar los componentes sin perder su estructura base.

#### 🚫 Sin props
```typescript
import React from 'react';
import { HomeIcon } from '@avila-tek/ui';

export default function SidebarItem() {
  return (
    <div className="flex gap-4 items-center rounded h-fit w-fit px-4 py-2 bg-pink-100 text-pink-800">
      <HomeIcon className="size-6" />
      Item
    </div>
  );
}
```

Aquí el icono siempre será HomeIcon y el texto será "Item", cosa que no nos sirve porque cada item debería llevar info diferente. Además, el color de fondo y de texto del elemento también son fijos, haciendo que debamos modificarlos directamente en el componente si queremos usarlo en otra parte de la aplicación o en una completamente diferente.

#### ✅ Con props
```typescript
import React from 'react';

export default function SidebarItem({ item, className }: { item: { text: string; icon: React.ReactNode }; className?: string }) {
  return (
    <div className={`flex gap-4 items-center rounded h-fit w-fit px-4 py-2 ${className}`}>
      {item.icon}
      {item.text}
    </div>
  );
}
```

De esta forma, el componente recibe el contenido del componente y los estilos que se le quieran aplicar al contenedor. Algunos estilos pueden quedar fijos según el rol que cumpla el componente, pero otros sí pueden admitir variaciones.

:::tip
Ojo! Tampoco deberíamos abusar del uso de props. Si usamos muchos props, terminamos embasurando el código.
:::

Es importante detenernos a pensar qué props necesita el componente y qué props no deberían ser props sino variables u otras cosas contenidas en el componente.

Si hay que mandar varios classNames, por ejemplo, podemos mandarlos como un objeto en lugar de mandar varios classNames separados:
```typescript
type ClassNames = {
  accordionClassName?: string;
  buttonClassName?: string;
  panelClassName?: string;
  iconClassName?: string;
}

interface AccordionProps {
  list: TListItem[];
  classNames?: ClassNames;
  iconButtonOpen?: React.ReactNode;
  iconButtonClose?: React.ReactNode;
}
```

### Usar enums para permitir variaciones limitadas
Ya para este punto sabemos que estamos buscando que nuestros componentes sean muy flexibles y costumizables. Sin embargo, hay casos en los que no debería admitirse tanta variación, según sea el caso. Para lograr que nuestros componentes admitan variaciones limitadas podemos utilizar enums cuando hagamos el tipado de nuestros props.
Un ejemplo:
```typescript
import React from 'react';

const ToastTypesEnum = 'success' | 'error' | 'info' | 'warning';

export default function Toast({ type = 'info', props }: { type: ToastTypesEnum; props: any }){
  ...
}
```

Por ejemplo, un componente Toast tiene 4 types: success, warning, error e info. No se le debería permitir al usuario enviar como prop un string cualquiera, por lo que es preferible limitarlo usando algo como `type TypesEnum = | 'success' | 'warning' | 'error' | 'info';`.

### Evitar estilos de layout
Los **estilos de layout** son aquellos que determinan cómo se va a comportar nuestro componente respecto al lugar donde se vaya a utilizar. Algunos ejemplos podrían ser márgenes, ancho, alto, etc.

Como es bastante probable que estas propiedades varíen para cada caso en el que se utilice el componente, lo ideal es que no pertenezcan a él, sino a su contenedor.

A continuación un ejemplo:

#### 🚫 Con estilos de layout
```typescript
import React from 'react';

export default function Card({ children }) {
  return (
    <div className="mx-8 h-24 w-1/2 p-4 rounded bg-background-100">
      {children}
    </div>
  );
}
```

Este componente siempre va a tener margen en x, una altura fija y la mitad del ancho de su contenedor. En algunos casos nos puede servir pero en otros necesitaremos que el ancho sea completo, por ejemplo, o que el margen no sea tan grande.

#### ✅ Sin estilos de layout
```typescript
import React from 'react';

export default function Card({ children }) {
  return (
    <div className="h-full w-full p-4 rounded bg-background-100">
      {children}
    </div>
  );
}
```

```typescript
import React from 'react';
import { Card } from '@Avila-Tek-UI';

export default function Component() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* sección A */}
      <div className="w-full flex justify-between gap-2">
        {/* sección A.1 con x información */}
        <div className="w-full">
          ...
        </div>
        {/* sección A.2 con el componente Card */}
        <div className="w-full h-fit mx-2 my-1">
          <Card>
            children de la card
          </Card>
        </div>
      </div>
      {/* sección B */}
      <div className="h-40 w-2/3">
        <Card>
          children de la card
        </Card>
      </div>
    </div>
  );
}
```

Aquí, el componente ProfileHeader hace que Card, en la sección A.2, ocupe la mitad de la vista (horizontalmente), y que su altura se ajuste a su contenido. A su vez, se vuelve a usar el mismo componente en la sección B, pero con una altura fija y un ancho de 2/3 de la vista.

### Incorporar composición
A veces, tenemos componentes muy complejos o que internamente varias de sus partes pueden presentarse u ordenarse de forma distinta según el uso que se le de al componente en la aplicación.

Aquí surge entonces el concepto de componentes compuestos. Los componentes compuestos son aquellos que están formados por múltiples componentes que comparten y manejan los mismos estados y lógica.

Un ejemplo de esto podría ser el componente Table. Table tiene filas, paginación, header, etc., y cada uno de estos elementos tiene cierta complejidad y requiere cierto nivel customización que hace que tener todas estas partes de la tabla en un solo componente sea engorroso y poco práctico. De igual forma, tendremos casos en los que la tabla no lleve paginación o no tenga un search, por ejemplo, por lo que deberíamos poder decidir qué partes de todas las posibles va a llevar la tabla en la que estamos trabajando, sin tener que modificar directamente el componente original.

A continuación, un ejemplo de la estructura del componente Table y su implementación en un proyecto:
```
/* packages/ui/src/components */

table/
  index.ts
  Table.tsx
  TableContent.tsx
  TableFooter.tsx
  TableHeader.tsx
  TablePagination.tsx
  TableSearchInput.tsx
```

```typescript
/* ../../../ClientTable.tsx */


'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Table } from '@avila-tek/ui';
import { PageInfo, TUser } from '@avila-tek/models';
import { useClientsPagination } from '@/services/clients';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const columnHelper = createColumnHelper<any>();
const columns = [
  columnHelper.accessor((row) => `${row?.firstName} ${row?.lastName ?? ''}`, {
    header: 'Nombre',
  }),

  columnHelper.accessor((row) => row?.email, {
    header: 'Correo electrónico',
  }),

  columnHelper.accessor(
    (row) =>
      dayjs(new Date(row?.createdAt)?.toISOString().slice(0, 10))
        .utc()
        .format('ll')
        .toString(),
    {
      header: 'Fecha de registro',
    }
  ),
];

export default function ClientTable() {
  const router = useRouter();
  const [pagination, setPagination] = React.useState<Partial<PageInfo>>({
    page: 1,
    perPage: 10,
  });
  const [search, setSearch] = React.useState<string>('');
  const { data, isLoading } = useClientsPagination({
    page: pagination.page,
    perPage: pagination.perPage,
    orderBy: JSON.stringify({ createdAt: 'desc' }),
    where: JSON.stringify({
      AND: [
        { type: 'client' },
        {
          OR: [
            { email: { contains: search } },
            { firstName: { contains: search } },
            { lastName: { contains: search } },
          ],
        },
      ],
    }),
  });

  const onClickRow = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
    e.preventDefault();
    const { id } = e.currentTarget.dataset;
    router.push(`/app/clients/${id}`);
  };

  const handleGoToPage = (value: number) => {
    setPagination({
      ...pagination,
      page: Number(value) > 0 ? Number(value) : 1,
    });
  };

  if (data && !isLoading)
    return (
      <Table
        data={data?.data?.items ?? []}
        columns={columns}
        manualPagination
        href="/app/clients"
      >
        <Table.Header className="p-6 w-full flex flex-row gap-3 justify-between">
          <div className="flex gap-2 items-center">
            <h2 className="table-title">Tabla de clientes</h2>
            {data?.data?.count ? (
              <Badge>
                {data?.data?.count}
                {data?.data?.count === 1 ? ' cliente' : ' clientes'}
              </Badge>
            ) : null}
          </div>
          <div className="md:w-2/5 w-full">
            <Table.SearchInput
              manualSearch
              value={search}
              setValue={setSearch}
            />
          </div>
        </Table.Header>
        <Table.Content onClickRow={onClickRow} />
        <Table.Footer>
          <Table.Pagination
            paginationInfo={{
              count: data?.data?.count,
              pageInfo: data?.data?.pageInfo,
            }}
            handleGoToPage={handleGoToPage}
            className="w-full"
          />
        </Table.Footer>
      </Table>
    );
  else if (isLoading) return <div className="">loading</div>;
}

```

Otro ejemplo sería el componente Tabs, proporcionado por **shadcn/ui**. Tabs es un componente compuesto porque:
- Tiene múltiples subcomponentes (TabsList, TabsTrigger, TabsContent)
- Comparten estado internamente (tab activa)
- Puedes reordenar, omitir o extender partes sin tocar el componente base
- Evita props condicionales y configuraciones rígidas

Ejemplo de implementación:

```typescript
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Cuenta</TabsTrigger>
    <TabsTrigger value="password">Contraseña</TabsTrigger>
  </TabsList>

  <TabsContent value="account">
    <AccountForm />
  </TabsContent>

  <TabsContent value="password">
    <PasswordForm />
  </TabsContent>
</Tabs>
```

## Referencias
- Ada Itw. (n.d.). *Componentes Reutilizables.* Ada Frontend. https://frontend.adaitw.org/docs/react/react24 
- Chinonso, I. (2021, August 27). *Compound components in react.* Smashing Magazine. https://www.smashingmagazine.com/2021/08/compound-components-react/ 
- Imagina Formación. (n.d.). *Creación de Componentes Reutilizables en react JS.* https://imaginaformacion.com/tutoriales/como-crear-componentes-reutilizables-en-react-js 