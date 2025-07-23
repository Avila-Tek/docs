---
title: Estándares de programación
sidebar_position: 3
slug: /front-end/onboarding/coding-standards
---

# Estándares de programación

## Componentes
Intenta descomponer componentes grandes en componentes pequeños de modo que cada componente realice una función tanto como sea posible. Al equipo de desarrollo le resulta más fácil gestionar, probar, reutilizar y crear componentes más pequeños. Puedes revisar una guía para como crear un componente reutilizable acá. La idea es que un componente no exceda las 200 lineas de codigo, lo cual ya se considera abundante por lo que mantenga el componente lo mas pequeño posible.

### Componentes de cliente y de servidor
Existen 2 tipos de componentes. Puede leer mas al respecto acá: Server and Client components.

:::tip Se establece como estándar que los componentes page, alojados en la carpeta app, deben ser server components.
:::

Estableciendo un árbol de componentes genérico de la siguiente manera:

![Component tree](/img/front-end/code-blocks/coding-standards_component-tree.PNG)

:::tip En caso que la page tenga params o query params debern de ser tipados
:::

```typescript
interface EditPageProps {
  searchParams: {
    [key: string]: string | undefined;
  };
  params: { id?: string };
}
```

:::tip La page debe mantenerse  lo más limpia posible (poco código) y en ella debemos de colocar los criterios de aceptación de la HU que estaremos realizando
:::

### Nombrar componentes
Utiliza PascalCase: Todos los nombres de componentes deben comenzar con una letra mayúscula. Si el nombre del componente consta de varias palabras, la primera letra de cada palabra también debe ser mayúscula sin espacios entre ellas. Ejemplo: UserProfile, ShoppingCart, HeaderNavigationcon la extensión tsx.

Toma en cuenta que el folder que agrupa multiples componentes debe estar nombrado en camelCase y debe hacer referencia al sigular del componente.

```
/button
  PrimaryButton.tsx
  SecondaryButton.tsx
```

### Creación
Para la creación de un componente, en primer lugar se recomienda descargar el [pack de extensiones de Avila Tek](https://marketplace.visualstudio.com/items?itemName=AvilaTek.avila-tek-extensions) con él contara con snipets de React. Los componentes deben ser React Funcional Components y pueden ser creados con los snipets rfce o rfc

![Component tree](/img/front-end/code-blocks/coding-standards_rfce.PNG)
