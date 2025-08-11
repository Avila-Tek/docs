---
title: Cómo empezar un proyecto
sidebar_position: 1
slug: /front-end/onboarding/starting-a-project
---

# Cómo empezar un proyecto

## Estructura del proyecto

Nuestros proyectos web están alojados en un monorepo.

> Un monorepo es un repositorio único que contiene múltiples proyectos y componentes. En lugar de dividir el código en varios repositorios independientes, todas las partes del software se almacenan en una ubicación centralizada.
>
> - Bambu Editorial (2023)

De esta forma, tendremos los proyectos tanto de frontend web como de backend en un mismo repositotio.
Para optimizar la gestión y configuración del monorepo, utilizamos una herramienta llamada [Turborepo](https://turbo.build/docs).

## Next.js

Nuestros proyectos de frontend se realizan con Next.js, un popular framework de desarrollo web de código abierto basado en React.js, diseñado para ayudar a los equipos de desarrollo frontend a construir aplicaciones web modernas de manera eficiente y escalable. Acá una introducción a Nextjs 13, al Avila Way Next.js 13

### Estructura del proyecto

En el siguiente documento se explica detalladamente cómo se estructuran nuestros proyectos: Estructura del proyecto para que conozcas a qué se refiere cada folder y file.
Variables de entorno
Las variables de entorno se ubicarán en los siguientes directorios:

- Para un proyecto con los directorios **admin**, **api** y **client**:
  - Admin: `./apps/admin/.env`
  - Api: `./apps/api/.env`
  - Client: `./apps/client/.env`
- **Nota**: toma en cuenta que esto puede cambiar según el proyecto

### Configuraciones

#### Tailwind CSS

En el siguiente documento se encuentra documentado a detalle cómo configurar e implementar Tailwind CSS: Tailwind

#### Next Auth

En el siguiente documento se encuentra documentado a detalle cómo configurar e implementar Next Auth: Next Auth

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
