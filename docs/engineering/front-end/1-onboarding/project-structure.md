---
title: Estructura del proyecto
sidebar_position: 2
slug: /frontend/onboarding/project-structure
---

# Estructura del proyecto

**Nuetros proyectos emplean [Turborepo](https://turborepo.com/)**

Monorepo es un enfoque de gestión de código fuente donde el código de múltiples proyectos se almacena en un único repositorio. Esta estrategia permite una mejor colaboración entre equipos, facilita el manejo de dependencias compartidas y simplifica procesos como la refactorización y el seguimiento de cambios a través de proyectos. Al centralizar el código, los equipos pueden trabajar más eficientemente y mantener una visión unificada de sus proyectos y bibliotecas.

Turborepo es una herramienta de construcción de alta performance diseñada específicamente para monorepositorios. Ofrece una forma eficiente de gestionar proyectos que comparten código, optimizando tareas como la construcción, prueba y despliegue de software. Turborepo aprovecha el almacenamiento en caché y la ejecución paralela de tareas para acelerar estos procesos, lo que resulta en una mejora significativa de la velocidad de desarrollo en entornos de monorepo.

El root del repositorio se verá más o menos de la siguiente forma:

![Repo root](/img/frontend/code-blocks/project-structure_repo-root.PNG)

## ./apps

Esta carpeta contiene cada una de las aplicaciones que forman parte del monorepo:

![Apps directory](/img/frontend/code-blocks/project-structure_apps.PNG)

En algunos casos existirán otras carpetas adicionales o las de frontend tendrán nombres diferentes a los de la imagen (como merchant-center y storefront, por ejemplo).

### Aplicaciones

Cada aplicación o proyecto tendrá la siguiente estructura:

![Client app](/img/frontend/code-blocks/project-structure_client_app.PNG)

Algunos comentarios sobre su contenido:

- **messages** solo existirá si el proyecto incluye internacionalización.
- **public** contiene todas las imágenes y cualquier otro asset que se requiera en la aplicación.
- **src** tendrá todo lo relacionado con el código como tal de la aplicación.
- **routes.tsx** contiene las rutas que se le pasarán a los componentes de navegación (navbar, sidebar, footer) para acceder a las diferentes páginas de la aplicación. En el siguiente enlace, un ejemplo: [routes.tsx para Fírmalo admin](https://github.com/Avila-Tek/firmalo/blob/development/apps/admin/routes.tsx).
- **tailwind.config.js** sirve para configurar Tailwind CSS en el proyecto. Aquí está la documentación para hacer esto: Tailwind CSS.
- **tsconfig.json** especifica los archivos del proyecto y las opciones requeridas para compilarlo.

#### ./apps/[app]/src

La mayoría del tiempo estaremos trabajando en este directorio. Su estructura es la siguiente:

![Src directory](/img/frontend/code-blocks/project-structure_src.PNG)

:::tip Algunos archivos como i18n.ts, middleware.ts y navigation.ts solo son necesarios si el proyecto incluye internacionalización.
:::

##### ./apps/[app]/src/app

Contiene todas las páginas de la aplicación a las que podrá acceder el usuario. Aquí también se define el favicon de la aplicación.

![Src/App directory](/img/frontend/code-blocks/project-structure_src_app_1.PNG)

![Src/App directory](/img/frontend/code-blocks/project-structure_src_app_2.PNG)

Comentarios sobre el contenido:

- **api** tiene un archivo de configuración de Next Auth en la siguiente ruta: `./apps/[app]/src/app/api/auth/[...nextauth]/route.ts`. Un ejemplo: [route.ts para Fírmalo admin](https://github.com/Avila-Tek/firmalo/blob/development/apps/admin/src/app/api/auth/%5B...nextauth%5D/route.ts).
- **[locale]** se utiliza cuando se trabaja con internacionalización.
- Cada carpeta corresponde a una ruta, y dentro de esa carpeta se alojan los archivos page.tsx (con el contenido de la página) y, de ser necesario, layout.tsx, con el layout que envolverá a lo que se encuentra en page.tsx.
- El archivo layout.tsx base contiene todos los contextos y wrappers que requiera la aplicación globalmente. También se crea el queryClient (en caso de usar React Query), se establece el archivo CSS de donde se sacarán los estilos y se definen las tipografías de la aplicación:

```typescript
'use client';

import React from 'react';
import { Montserrat, Work_Sans } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApolloWrapper } from '@/context/ApolloContext';
import { NextAuthProvider } from '@/context/AuthContext';
import { ToastContextProvider } from '@/context/ToastContext';
import '@/styles/index.css';
import Loading from './loading';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-workSans',
});

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  });
  return (
    <html lang={locale}>
      <style jsx global>{`
        :root {
          --font-montserrat: ${montserrat.style.fontFamily};
          --font-workSans: ${workSans.style.fontFamily};
        }
      `}</style>
      <body>
        <QueryClientProvider client={queryClient}>
          <ToastContextProvider>
            <ApolloWrapper>
              <NextAuthProvider>
                <React.Suspense fallback={<Loading />}>
                  {children}
                </React.Suspense>
              </NextAuthProvider>
            </ApolloWrapper>
          </ToastContextProvider>
        </QueryClientProvider>
        <div id="toast" />
      </body>
    </html>
  );
}
```

##### ./apps/[app]/src/components

Aquí están los componentes que usaremos para construir la aplicación. Van agrupados en carpetas según la sección a la que pertenezcan o la función que cumplan:

![Src/Components directory](/img/frontend/code-blocks/project-structure_src_components.PNG)

##### ./apps/[app]/src/context

Están todos los contextos que creemos para la aplicación, cada contexto debe tener su respectibo hook (Pronfundizaremos en Estándares de programación):

![Src/Context directory](/img/frontend/code-blocks/project-structure_src_context.PNG)

##### ./apps/[app]/src/graphql

Si la comunicación con la api se hace con GraphQL, esta carpeta será usada para alojar todos los fragmentos, mutaciones y queries:

![Src/Graphql directory](/img/frontend/code-blocks/project-structure_src_graphql.PNG)

##### ./apps/[app]/src/hooks

Están todos los hooks que creemos para usarlos en el proyecto:

![Src/Hooks directory](/img/frontend/code-blocks/project-structure_src_hooks.PNG)

##### ./apps/[app]/src/lib

Aquí tendremos archivos con funciones que usualmente sirven para hacer configuraciones globales y funciones referentes a librerias:

![Src/Lib directory](/img/frontend/code-blocks/project-structure_src_lib.PNG)

Comentarios sobre el contenido:

- **api.ts** tiene la inicialización de axios para poder hacer peticiones a una API REST.
- **auth.ts** se usa para configurar Next Auth. Aquí la documentación: Next Auth
- **config.ts** exporta las variables de entorno que necesitemos en el front. Un ejemplo: [config.ts en Fírmalo admin](https://github.com/Avila-Tek/firmalo/blob/development/apps/admin/src/lib/config.ts).
- **env.ts** define la disponibilidad de las variables de entorno para client y server components.

##### ./apps/[app]/src/services

Si la API es de tipo REST, aquí guardaremos todas las peticiones fetch que hagamos y las exportaremos para ser utilizadas en la aplicación.

![Src/Services directory](/img/frontend/code-blocks/project-structure_src_services.PNG)

##### ./apps/[app]/src/styles

Contiene el (o los) archivo(s) CSS requeridos. Usualmente solo está index.css con la implementación de Tailwind y las configuraciones globales del proyecto.

![Src/Styles directory](/img/frontend/code-blocks/project-structure_src_styles.PNG)

##### ./apps/[app]/src/types

Si el proyecto lleva Next Auth, aquí se guarda el archivo next-auth.d.ts, con la customización de lo que se quiera almacenar en la session. Aquí la documentación: Next Auth

![Src/Types directory](/img/frontend/code-blocks/project-structure_src_types.PNG)

## ./packages

Un package en el contexto de Turborepo se refiere a un proyecto individual o una biblioteca dentro de un monorepositorio que gestiona Turborepo. En un monorepositorio, es común tener múltiples packages, cada uno con su propio propósito, como una aplicación web, un servicio backend, o una biblioteca compartida. Cada package puede tener sus propias dependencias, scripts de construcción y configuraciones, pero se beneficia de la gestión centralizada que ofrece Turborepo para tareas como la construcción, pruebas, y despliegue.

Este directorio contiene paquetes creados por nosotros, a los que podemos acceder desde cualquiera de nuestras aplicaciones. De esta forma, los recursos utilizados por todas ellas vienen de un mismo lugar, evitando discrepancias y retrabajo.
Usualmente, nuestros proyectos contienen los siguientes paquetes:

- **eslint-config-avila-tek**: Configuración de ESLint para el proyecto.
- **models**: Modelos de datos, types, enums, dtos, etc.
- **tsconfig**: Configuración de TypeScript para el proyecto.
- **ui**: Paquete de componentes comunes (Button, Input, Table, Card, etc).
  En el siguiente documento se encuentra documentado a detalle cómo configurar y utilizar paquetes customizados: Internal packages
