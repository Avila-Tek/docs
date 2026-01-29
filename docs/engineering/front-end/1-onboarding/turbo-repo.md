---
title: Cómo empezar un proyecto
sidebar_position: 1
slug: /frontend/onboarding/starting-a-project
---

# Cómo empezar un proyecto

### Estructura del proyecto

**Nuetros proyectos emplean [Turborepo](https://turborepo.com/)**

Monorepo es un enfoque de gestión de código fuente donde el código de múltiples proyectos se almacena en un único repositorio. Esta estrategia permite una mejor colaboración entre equipos, facilita el manejo de dependencias compartidas y simplifica procesos como la refactorización y el seguimiento de cambios a través de proyectos. Al centralizar el código, los equipos pueden trabajar más eficientemente y mantener una visión unificada de sus proyectos y bibliotecas.

Turborepo es una herramienta de construcción de alta performance diseñada específicamente para monorepositorios. Ofrece una forma eficiente de gestionar proyectos que comparten código, optimizando tareas como la construcción, prueba y despliegue de software. Turborepo aprovecha el almacenamiento en caché y la ejecución paralela de tareas para acelerar estos procesos, lo que resulta en una mejora significativa de la velocidad de desarrollo en entornos de monorepo.

El root del repositorio se verá más o menos de la siguiente forma:

![Repo root](/img/frontend/code-blocks/project-structure_repo-root.PNG)

## ./apps

Esta carpeta contiene cada una de las aplicaciones que forman parte del monorepo:

![Apps directory](/img/frontend/code-blocks/project-structure_apps.PNG)

En algunos casos existirán otras carpetas adicionales o las de frontend tendrán nombres diferentes a los de la imagen (como merchant-center y storefront, por ejemplo).

Las variables de entorno se ubicarán en los siguientes directorios:

- Para un proyecto con los directorios **admin**, **api** y **client**:
  - Admin: `./apps/admin/.env`
  - Api: `./apps/api/.env`
  - Client: `./apps/client/.env`
- **Nota**: toma en cuenta que esto puede cambiar según el proyecto

#### Packages

Sabemos que en nuestros proyectos nos encontramos constantemente reutilizando código y apoyándonos de librerías externas. Dichas librerías nos permiten acceder a funciones y componentes generados por otras personas y que de alguna forma podemos integrar en nuestro proyecto para ayudarnos a construir o mejorar las funcionalidades que implementemos.
Así como podemos importar elementos de paquetes externos, también podemos generar nuestros propios paquetes, que contengan todo aquello que consideremos común entre todas las aplicaciones alojadas en el repositorio.

Turborepo nos permite construir nuestras propias librerías dentro de nuestros proyectos. Acá la documentación oficial

- [Conceptos clave de paquetes internos](https://turborepo.dev/docs/core-concepts/internal-packages)
- [Cómo crear un paquete interno en tu repositorio](https://turborepo.dev/docs/crafting-your-repository/creating-an-internal-package)

#### Dependencias

Para instalar dependencias en nuestras aplicaciones escribimos lo siguiente en el root del proyecto:

```sh
npm i <dependencia> --workspace=<nombre del workspace>
```

Por ejemplo, para instalar Framer Motion en el client:

```sh
npm i framer-motion --workspace=@avila-tek/client
```

Para instalar Day.js en el paquete UI:

```sh
npm i dayjs --workspace=@avila-tek/ui
```

El nombre del workspace lo puedes conseguir en el package.json de dicho workspace
