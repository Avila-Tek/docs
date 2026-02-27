---
title: Modelado de Contenido en Strapi
sidebar_position: 5
slug: /strapi/content-modeling
---

# Modelado de Contenido en Strapi

## Objetivo de este documento

Este documento explica **cómo organizamos el contenido en Strapi** para que:

- Sea fácil de editar por personas no técnicas.
- Sea fácil de mantener por el equipo.
- Sea fácil de conectar con el frontend.

La idea principal: una página no es “un bloque gigante”, sino una **lista de secciones**.

---

## Cómo se organiza el contenido

En Strapi vamos a ver estos conceptos. No hace falta memorizar nombres, solo entender la idea:

1) **Página / Template**  
   Es el “contenido principal” de una landing. Ej: Home, Pricing, About.

2) **Secciones**  
   Son los bloques grandes de una página. Ej: Hero, Features, Testimonios, FAQ.

3) **Items repetibles**  
   Son las piezas que se repiten dentro de una sección. Ej: cards, logos, pasos, planes.

4) **Globales**  
   Contenido compartido por todo el sitio. Ej: Footer (y a veces Header).

---

## Cómo modelamos una página

### 1) Cada template de Figma = una página en Strapi

- Si en Figma existe un template llamado “Home Global”, “Pricing Global”, etc., Strapi debe crear **una página por cada uno**.
- El nombre en Strapi debe ser el mismo nombre del template de Figma.

> Nota: Esto nos ayuda a mantener consistencia entre diseño y CMS.

### 2) Cada página se compone por secciones (en orden)

- Cada página debe tener un campo llamado `sections` que funciona como una “lista ordenada”.
- Ahí se agregan las secciones en el orden en el que aparecen en la landing.
- Idealmente también se puede reordenar secciones desde el panel (si aplica al proyecto).

---

## Cómo modelamos una sección

Una sección debe permitir editar **todo lo visible** dentro de ese bloque.

Ejemplos de campos comunes (esto se infiere del diseño, no hay una lista fija):

- Títulos y subtítulos
- Texto principal / descripción
- Imágenes (hero, background, íconos)
- Etiquetas (badges, tags)
- Items repetibles (cards, listas)

### Regla clave: no colapsar todo en una sola sección genérica

- Una landing debe tener **múltiples secciones**.
- Si la integración solo manda una imagen, igual hay que “partir” la página en secciones (aunque algunas queden con nombres genéricos).

---

## Items repetibles (cards, listas, grids)

Cuando algo se repite (por ejemplo 6 cards), lo modelamos como:

- Una lista de “items” dentro de la sección.

Esto permite:

- Agregar o quitar cards sin tocar código.
- Mantener consistente el formato del contenido.
- Editar cada item por separado.

**Regla**: evitar guardar estas listas en formatos raros.  
Debe ser editable de forma normal desde Strapi.

---

## Imágenes y accesibilidad (alt text)

Cada imagen debe ser editable y tener su **alt text**.

¿Por qué?

- Accesibilidad (lectores de pantalla).
- SEO (cuando aplica).
- Buenas prácticas de producto.

**Regla**: cada imagen que se guarda en Strapi debe tener un campo de alt.

---

## Footer y Navbar globales (muy importante)

El Footer y el Navbar:

- Es **uno solo** para todo el sitio.
- Debe ser un modelo global separado (no repetido por página).
- Las páginas lo “referencian” para mostrarlo.

Además:

- Debe soportar estructura flexible (por ejemplo columnas variables).
- Evitar “footer con 4 columnas fijas” porque luego es difícil cambiar.

---

## Links: el contenido es editable, pero los destinos no

En Landscapes vamos a manejar los links así:

- El texto del botón o link (label) puede ser editable si lo necesitamos.
- El destino (href / URL) **se define en el código**.

Esto evita que:

- Alguien rompa la navegación por error.
- Tengamos que validar URLs en el CMS.
- Se mezclen responsabilidades (contenido vs navegación).

---

## Convención de nombres (para no perdernos)

Como vamos a tener muchas páginas y secciones, seguimos una regla simple:

- Todo se nombra basado en cómo está en Figma.
- Las secciones deben incluir el nombre del template + el nombre de la sección.

Ejemplo:

- Template: “Home Global”
- Secciones: “Home Global Hero Section”, “Home Global FAQ Section”, etc.

Esto hace que:

- Sea fácil encontrar cosas en Strapi.
- El CMS se mantenga ordenado.
- El equipo se entienda con el diseño.

---

## Checklist rápido de modelado

Antes de dar por listo el modelado:

- [ ] Existe una página en Strapi por cada template en Figma.
- [ ] Cada página tiene una lista ordenada de `sections`.
- [ ] Hay múltiples secciones (no una sola genérica).
- [ ] Lo repetible se modeló como items repetibles (no “pegado en un texto”).
- [ ] Todas las imágenes tienen alt text.
- [ ] Footer es global y separado.
- [ ] No se modelaron rutas/redirects.
- [ ] No se guardaron hrefs/URLs (links son estáticos en código).
