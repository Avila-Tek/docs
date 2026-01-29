---
title: Átomos y bases (Shadcn)
sidebar_position: 4
slug: /frontend/components/base
---

# Átomos y bases (Shadcn)

## 🔎 Overview

[**shadcn/ui**](https://ui.shadcn.com/) es un conjunto de componentes de interfaz modernos y accesibles para React, construidos sobre primitives como Radix UI y estilizados con Tailwind CSS. A diferencia de una librería tradicional, shadcn no se consume como una dependencia externa: los componentes se copian directamente al código del proyecto, pasando a formar parte del mismo.

Este enfoque nos da control total sobre los componentes, permitiendo modificarlos, extenderlos o adaptarlos sin depender de abstracciones opacas ni ciclos de actualización de terceros.

### Beneficios clave

- **Propiedad del código:** los componentes viven en el repositorio, lo que facilita el versionado, la personalización y el debugging.

- **Alta personalización:** estilos y comportamiento pueden ajustarse libremente según las necesidades del producto.

- **Accesibilidad por defecto:** los componentes están construidos sobre primitives accesibles, siguiendo buenas prácticas de a11y.

- **Consistencia visual y funcional:** promueve patrones claros de UI y reduce inconsistencias entre vistas.

- **Buen equilibrio entre velocidad y control:** acelera el desarrollo sin sacrificar flexibilidad ni calidad del código.

En el proyecto, shadcn/ui se utiliza como base para construir y estandarizar componentes de UI, sirviendo como punto de partida que luego puede ser extendido o adaptado según los requerimientos específicos de cada caso.

## 🎥 Tutorial

### 1. Buscar el componente en shadcn

Ingresar a https://ui.shadcn.com/docs/components y elegir el componente a instalar.

### 2. Agregar el componente al repo

Para esto, debes ejecutar `npx shadcn@canary add <component-id> --cwd packages/ui`, donde `component-id` es el slug del componente en shadcn.

:::note
Este comando debe apuntar a **packages/ui** para que el componente y sus dependencias queden instalados en ese paquete.
:::

### 3. Exportar el componente del paquete

Como instalamos el componente en packages/ui, debemos exportarlo para que esté disponible para las aplicaciones y los demás paquetes. Se hace de la siguiente forma:

```json
// package.json de packages/ui
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "dependencies": {
    "@radix-ui/react-slot": "1.2.3",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "lucide-react": "0.548.0",
    "next-themes": "0.4.6",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "tailwind-merge": "3.3.1",
    "tw-animate-css": "1.4.0",
    "zod": "4.1.12"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "4.1.16",
    "@turbo/gen": "2.5.8",
    "@types/node": "24.9.2",
    "@types/react": "19.2.2",
    "@types/react-dom": "19.2.2",
    "@repo/typescript-config": "*",
    "tailwindcss": "4.1.16",
    "typescript": "5.9.3"
  },
  "exports": {
    "./globals.css": "./src/styles/globals.css",
    "./postcss.config": "./postcss.config.mjs",
    "./lib/*": "./src/lib/*.ts",
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts"
  }
}
```

### 4. Costumizar componente

Con el componente creado, ¡puedes comenzar a modificar sus estilos y usarlo en el resto del proyecto! 🥳

### Video demostrativo

<video width="90%" height="600" controls>
  <source src="https://cdn.avilatek.com/docs/frontend/shadcn_components.mov"/>
</video>

_Tooltip en Mercantil Seguros. Valeria Trotta._

---

:::info
Para más información, referirse a la documentación oficial de **shadcn/ui**: https://ui.shadcn.com/
:::
