---
title: Feature flags
sidebar_position: 1
slug: /frontend/quality/feature-flags
---

# Feature flags

## 🔎 Overview

Las feature flags, también conocidas como feature toggles o flags, son una técnica de desarrollo de software que permite activar o desactivar funcionalidades específicas de una aplicación sin necesidad de volver a desplegar el código. Se implementan mediante condicionales en el código que verifican el estado de una flag antes de ejecutar una determinada funcionalidad.

### ¿Para qué sirven?

- **Lanzar nuevas funcionalidades de forma controlada**: Permiten liberar una nueva característica a un grupo reducido de usuarios (beta testers) antes de habilitarla para el resto, lo que ayuda a detectar posibles errores o problemas de rendimiento en un entorno real.
- **Realizar pruebas A/B**: Facilitan la comparación del rendimiento de diferentes versiones de una funcionalidad para determinar cuál ofrece mejores resultados.
- **Activar o desactivar funcionalidades según el contexto**: Permiten adaptar el comportamiento de la aplicación en función de factores como la ubicación geográfica, el tipo de usuario o el dispositivo utilizado.
- **Gestionar el riesgo**: Ofrecen la posibilidad de desactivar rápidamente una funcionalidad en caso de que cause problemas o no cumpla las expectativas.
- **Experimentar con nuevas ideas**: Permiten probar nuevas funcionalidades sin comprometer la estabilidad de la aplicación principal.

En resumen, las feature flags son una herramienta muy útil para los desarrolladores de software que buscan mejorar la flexibilidad, el control y la seguridad en el proceso de creación y mantenimiento de aplicaciones.

## 🛠️ Implementación
La versión actual del fullstack template cuenta con un package que maneja todo lo relacionado con las Feature Flags: [Package de Feature Flags | AT Fullstack Template](https://github.com/Avila-Tek/fullstack-template/tree/main/examples/with-restful-prisma/packages/feature-flags)

Para utilizarlas en nuestros proyectos, hacemos lo siguiente:

### 1. Agregar variables de entorno

```
// /client/.env.local

NEXT_PUBLIC_POSTHOG_KEY=<ph_project_api_key>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_APP_ENV=<ambiente_de_la_app> # dev, qa, stg, prod
```

### 2. Agregar el context provider al root layout

```typescript
// /client/src/app/layout.tsx

import dynamic from 'next/dynamic';
import { QueryProvider } from '@/context/query-context';
import './globals.css';
import { type TFeatureFlagConfig, type TFeatureFlagContextProviderProps } from '@mercantil/feature-flags';

const FeatureFlagContextProvider = dynamic<TFeatureFlagContextProviderProps>(
  () =>
    import('@mercantil/feature-flags').then(
      (mod) => mod.FeatureFlagContextProvider
    )/* ,
  {
    ssr: false,
  } */
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const config: TFeatureFlagConfig = {
    provider: 'posthog',
    token: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    env: process.env.NEXT_PUBLIC_APP_ENV || 'qa',
  };

  return (
    <html lang="es">
      <body>
        <FeatureFlagContextProvider config={config}>
          <QueryProvider>
            {children}
          </QueryProvider>
        </FeatureFlagContextProvider>
      </body>
    </html>
  );
}
```

### 3. Usar FeatureFlagWrapper
Este wrapper se encuentra en el package y se ve así:

```typescript
'use client';

import React, { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { Loader } from '@mercantil/ui/loading';
import { useFeatureFlagValue } from '../hooks/useFeatureFlags';

interface FeatureFlagWrapperProps {
  flagName: string;
  redirectTo?: string;
  replaceWith?: ReactNode;
  children: ReactNode;
  loaderType?: 'page' | 'section' | 'component';
}

export default function FeatureFlagWrapper({
  flagName,
  redirectTo,
  replaceWith,
  children,
  loaderType = 'page',
}: FeatureFlagWrapperProps) {
  const [flag, setFlag] = React.useState<boolean | null>(null);
  const ph_flag = useFeatureFlagValue(flagName);

  React.useEffect(() => {
    if (typeof ph_flag !== 'undefined') {
      setFlag(ph_flag);
    }
  });

  if (flag === null) {
    if (loaderType === 'component') return <></>;
    return <Loader />;
  }

  if (!flag) {
    if (redirectTo) return redirect(redirectTo);
    return replaceWith;
  }

  return <>{children}</>;
}
```

#### 3.1 Para mostrar/ocultar un componente
Lo que se busca en este caso es que el usuario se mantenga en la misma página, pero pudiendo ver o no algunos de sus componentes.
En este ejemplo vamos a mostrar/ocultar el botón que lleva al usuario a los productos de colectivo:

```typescript
// /apps/client/src/components/.../.../ProductsNavbarModal.tsx

import React from 'react';
import Link from 'next/link';
import {
  colectivoNavInsurances,
  peopleInsurances,
} from '@/consts/navigation/insurances';
import { FeatureFlagWrapper } from '@mercantil/feature-flags';
import { BuildingIcon, PeopleIcon } from '@mercantil/ui/icons';
import { ModalItem, NavbarModal } from '@mercantil/ui/navbar';
import { Insurance } from '@/models';

export default function ProductsNavbarModal() {
  const [activeInsurances, setActiveInsurances] = React.useState<Insurance[]>(
    []
  );
  return (
    <NavbarModal
      className={{
        content: 'grid grid-cols-1 max-w-[200px]',
      }}
      title={
        <h5>
          Productos <span className="text-blue-light-500">Mercantil</span>
        </h5>
      }
      sideContent={
        activeInsurances.length > 0 ? (
          <div className="flex flex-col gap-2">
            {activeInsurances.map((props, key) => (
              <Link
                key={key}
                href={props.href}
                className="rounded-md bg-white p-2 flex text-sm items-center gap-2 transition-all hover:bg-blue-light-50 hover:text-blue-light-900"
              >
                {props.icon}
                {props.text}
              </Link>
            ))}
          </div>
        ) : null
      }
    >
      <Link
        href={'/productos/personas'}
        onMouseEnter={() => setActiveInsurances(peopleInsurances as any)}
      >
        <ModalItem
          title="Para ti y tu familia"
          description="Tu bienestar es lo más importante. Protege lo que más valoras y asegura tu tranquilidad."
          icon={<PeopleIcon />}
        />
      </Link>
      <FeatureFlagWrapper flagName="prods-colectivo" replaceWith={<></>} loaderType='component'>
        {/* Usamos el wrapper para envolver este Link, solo se muestra si prods-colectivo está activa. Si no, se reemplaza por <></> */}
        <Link
          href={'/productos/colectivo'}
          onMouseEnter={() => setActiveInsurances(colectivoNavInsurances)}
        >
          <ModalItem
            title="Para tu empresa"
            description="Impulsa tu negocio con confianza. Protege tu empresa y todo lo que has construido."
            icon={<BuildingIcon />}
          />
        </Link>
      </FeatureFlagWrapper>
    </NavbarModal>
  );
}
```

#### 3.2 Para mostrar/ocultar una página
Aquí, el objetivo es redireccionar al usuario a otra página, ya que no debería poder ver nada del contenido de la página actual.
En este ejemplo vamos a mostrar/ocultar la página de "Por qué nosotros", con una flag que envuelve a todo lo relacionado con la v2 de la página. Si no está activa, se redirige al usuario a la página principal:

```typescript
// /apps/client/src/app/.../.../por-que-nosotros/page.tsx

import { Metadata } from 'next';
import WhyUsHeroSection from '@/components/sections/nosotros/por-que-nosotros/HeroSection';
import AnimatedDiagramItem from '@/components/animated/proposito/AnimatedDiagram';
import { FeatureFlagWrapper } from '@mercantil/feature-flags';

export const metadata: Metadata = {
  title: 'Por qué nosotros - Mercantil Seguros',
  description:
    'Conoce nuestra historia, nuestros valores y nuestro compromiso con el bienestar de nuestros clientes.',
};

export default async function WhyUsPage() {
  return (
    <FeatureFlagWrapper flagName="v2" redirectTo="/">
      <WhyUsHeroSection />
      <AnimatedDiagramItem />
    </FeatureFlagWrapper>
  );
}

```

## 🤓 Buenas prácticas
### 1. Nombramiento de las flags
La idea de esto es que sean más fáciles de entender y mantener. A continuación, algunas recomendaciones:
- **Nombres descriptivos:** por ejemplo, `is-v2-billing-dashboard-enabled` se entiende mejor que `is-dashboard-enabled`.
- **Separarlas por tipos:** esto aclara su propósito. Los tipos a utilizar serán los siguientes:
  - Experiment
  - Release
  - Permission
  Por ejemplo, en lugar de `new-billing`, serían `new-billing-experiment` o `new-billing-release`.
- Nombre según retorno: de esta forma se entiende mejor lo que se espera recibir del flag.
  - `is-premium-user` para booleanos
  - `enabled-integrations` para un array
  - `selected-theme` para un string
- **Uso de afirmaciones para booleanos**: por ejemplo, es mejor `is-premium-user` en lugar de `is-not-premium-user`, para evitar dobles negaciones.

Con estas bases, nuestras feature flags tendrán la siguiente estructura:
**env-module-feature-version-type-return**


| Item                      | Ambiente | Módulo  | Feature | Versión | Tipo | Retorno | Ejemplo |
|---------------------------|:--------:|:-------:|:-------:|:-------:|:----:|:-------:|---------|
| Módulo entero             | 🟡       | ✅     | 🟡      | 🟡     | ✅   | 🟡     | **dev-auth-v2-release-is-enabled** (En el ambiente DEV, se está desplegando la segunda versión del módulo de autenticación) |
| Funcionalidad específica  | 🟡       | ✅     | ✅      | 🟡     | ✅   | 🟡     | **stg-auth-sign-up-by-role-v1-experiment-enabled-roles** (En el ambiente STG, se está experimentando con la primera versión del registro por rol, se retorna la lista de roles con el feat habilitado) |


:::tip ✅ Requerido 🟡 Opcional
:::

### 2. Centralizar uso de las flags
Si la flag se usa en muchos lugares, se recomienda envolver la flag en una función e invocar a dicha función tantas veces sea necesario. De esta forma, se evitan inconsistencias en su uso.
```typescript
function useBetaFeature() {
    return posthog.isFeatureEnabled('beta-feature')
}
```

### 3. Fallback a código funcional
Las feature flags a veces pueden retornar valores inesperados (cuando hay un error de red, por ejemplo), por lo que es importante validar el retorno de la flag, y en caso de no ser lo esperado, mostrar una UI que sí sea funcional.

### 4. Limpieza de flags
Dejar flags por mucho tiempo en el código genera confusión y deuda técnica. Cuando ya no se necesiten, se pueden quitar.

### 5. Evaluación local de flags
Cada vez que se evalúa una flag, se hace una solicitud a PostHog. Para hacer menos llamados a la API y que la evaluación sea más rápida, PostHog puede hacer solicitudes periódicas y almacenarlas localmente. Más sobre esto aquí: [Server-side local evaluation - Docs - PostHog](https://posthog.com/docs/feature-flags/local-evaluation)

### 6. Identificación del usuario
Esto sirve para que se muestre al usuario (o al grupo) lo que debería ver, aunque tenga diferentes sesiones abiertas. La idea es que los valores que reciba de las flags sean consistentes. Más info aquí: [Identify users - Docs - PostHog](https://posthog.com/docs/getting-started/identify-users)

### 7. Inicialización de flags con valores por defecto en el cliente
Suele suceder que las flags no están disponibles inmediatamente, porque existe un delay al inicializar PostHog y cargar los valores de las flags. Una técnica utilizada es guardar valores por defecto de las flags en el código hasta que se puedan obtener. Por aquí más información: [Client-side bootstrapping - Docs - PostHog](https://posthog.com/docs/feature-flags/bootstrapping)

## 📚 Recursos
- [Next.js - Docs - PostHog](https://posthog.com/docs/libraries/next-js)
- [Feature flag best practices - Docs - PostHog](https://posthog.com/docs/feature-flags/best-practices)
- [Feature Flag Lifespans - Short or Long? | ConfigCat Blog](https://configcat.com/blog/2022/07/08/how-long-should-you-keep-feature-flags/#different-types-of-feature-flags-and-their-various-life-span)
- [Masterig Feature Flags](https://medium.com/@vitorbritto/mastering-feature-flags-056d940ccb48)
- [Feature Flags 101](https://medium.com/jonathans-musings/feature-flags-101-674993352119)