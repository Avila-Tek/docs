---
title: Estilos y Tailwind
sidebar_position: 1
slug: /frontend/components/tailwind
---

Es indispensable para una aplicacion tener estilos estandarizados, puesto que afecta directamente la velocidad de desarrollo y la satisfacción del usuario, ademas, nos permite estar preparados para posibles cambios y asegura consistencia en los estilos. 

## Configuracion de colores
Se declaran los colores que seran implementados en nuestra configuracion para el sistema
```tsx
// 📁 /apps/clients/src/css/color-variables.css

@theme {
  /* Gray Dark Mode Alpha Colors */
  --color-gray-dark-alpha-950: #ffffff00;

  /* Gray Dark Mode Colors */
  --color-gray-dark-50: #fafafa;

  /* Gray Light Mode Colors */
  --color-gray-light-900: #fcfcfd;

  --color-gray-light-mode-900: var(--color-gray-light-900);

  --color-gray-dark-mode-50: var(--color-gray-dark-50);

  --color-gray-dark-alpha-mode-950: var(--color-gray-dark-alpha-950);
}
```

## Configuracion light/dark mode para texto
```tsx
// 📁 /apps/clients/src/css/text-variables.css

// estas son las clases que usaremos en nuestros componentes
@utility txt-primary-900 {
  @apply text-gray-light-mode-900;
  @apply dark:text-gray-dark-mode-50;
}
```

## Configuracion light/dark mode para bordes
```tsx
// 📁 /apps/clients/src/css/border-variables.css

// estas son las clases que usaremos en nuestros componentes
@utility border-primary {
  @apply border-gray-light-mode-300;
  @apply dark:border-gray-dark-mode-700;
}
```

## Configuracion light/dark mode para background
```tsx
// 📁 /apps/clients/src/css/bg-variables.css

// estas son las clases que usaremos en nuestros componentes
@utility bg-surface {
  @apply bg-base-white;
  @apply dark:bg-gray-dark-mode-950;
}
```

## Configuracion light/dark mode para fg
```tsx
// 📁 /apps/clients/src/css/fg-variables.css

// estas son las clases que usaremos en nuestros componentes
@utility fg-primary-900 {
  @apply border-gray-light-mode-900;
  @apply dark:border-base-white;
  @apply bg-gray-light-mode-900;
  @apply dark:bg-base-white;
}
```

## Configuracion globales
Por ultimo hacemos creamos un archivo que contenga toda la configuracion previamente establecida para nuestro proyecto y este archivo deber aser importado en el layout de la aplicacion, para asi aplicar los estilos en todo el sistema.

```tsx
// 📁 /apps/clients/src/apps/globals.css

/* Tailwind v4 entrypoint (CSS-first) */
@import "tailwindcss";

/* Source paths for Tailwind v4 scanning (monorepo) */
@source "../../**/*.{ts,tsx}";
@source "../../../../packages/ui/src/**/*.{ts,tsx}";

/* UI package theme tokens and base styles (must be after @import tailwindcss) */
@import "@repo/ui/globals.css";

/* Design tokens (ajusta estas rutas si tu carpeta css está en otro lugar) */
@import "../css/color-variables.css";
@import "../css/bg-variables.css";
@import "../css/fg-variables.css";
@import "../css/border-variables.css";
@import "../css/text-variables.css";

@layer utilities {
  .scrollbar-color-gray::-webkit-scrollbar-thumb {
    background-color: gray;
  }
}
```