---
title: Strapi AI + Figma
sidebar_position: 5
slug: /strapi/strapi-ai-figma
---

# Strapi AI + Figma

## Objetivo

Esta guía explica cómo usar **Strapi AI** para generar la estructura de contenido en Strapi a partir de un diseño en **Figma**.

La meta es que, al importar desde Figma:

- Se creen las **páginas/templates** correctas (según el nombre en Figma).
- Cada página quede dividida en **secciones** (no un bloque gigante).
- El contenido sea editable (textos, imágenes, listas repetibles).
- El **Navbar** y el **Footer** quede como contenido global separado.
- Evitemos “cosas fuera de alcance” (rutas, redirects, links con URL).

---

## Configurar la integración con Figma (setup inicial)

Antes de usar Strapi AI con links de Figma, necesitas crear un **Access Token** en Figma para que Strapi pueda leer los archivos.

### 1) Genera el token en Figma

1. Abre Figma y haz click en tu **avatar** (arriba a la derecha).
2. Entra en **Settings / Ajustes**.
3. Ve a **Security / Seguridad**.
4. Busca la sección de **Personal access tokens** (o “Tokens de acceso”).
5. Haz click en **Generate token**.

### 2) Permisos (muy importante)

Al crear el token, selecciona **únicamente** este permiso:

- `file_content: read`

> No agregues permisos extra. Con ese es suficiente para que Strapi lea el contenido del archivo.

### 3) Guarda el token y configúralo en Strapi

- Copia el token generado e ingrésalo en Strapi (Figma lo muestra una sola vez).

Con esto, ya puedes usar la integración normalmente.

## Antes de importar: cómo preparar el Figma

### 1) Nombra bien cada template/página

- Cada template/página debe tener un nombre claro (ej: “Home Global”, “Pricing Global”, etc.).
- Ese nombre será el que Strapi use para crear el Content Type.

---

## Importar desde Figma a Strapi

La integración termina pasando imágenes/previews

- Strapi AI no “lee” la estructura real (solo ve el diseño como foto).
- Aun así, debe dividir la página en secciones “por bloques” (segmentación visual).
- En este caso, algunas secciones pueden salir con nombres genéricos, pero la estructura igual debe quedar bien.

> Nota: nuestro prompt base está escrito para que Strapi AI NO se trabe si recibe imágenes.

---

## Cómo usar la integración (paso a paso)

Esta es la forma recomendada de usar **Strapi AI + Figma** para que el resultado salga consistente.

### 1) Abre Figma y selecciona el template correcto

1. Entra a tu archivo de Figma.
2. Busca la **pantalla / frame** que quieres convertir en contenido (el template/página).
3. Haz **click** sobre esa pantalla para asegurarte de que quede seleccionada (idealmente el frame principal).

> Tip: si el frame tiene un nombre claro (ej: “Home Global”), ese nombre es el que Strapi usará para crear el template en el CMS.

### 2) Copia el link de Figma

- Con la pantalla seleccionada, copia el link desde Figma (Share/Copy link o desde la barra del navegador).

### 3) Pega el link en Strapi AI (usando el clip)

1. Ve al chat de **Strapi AI**.
2. Haz click en el **icono del clip (adjuntar)**.
3. Pega / inserta el **link de Figma** y envíalo.

### 4) Reemplaza el mensaje autogenerado con el prompt base

Cuando Strapi AI procese el link, normalmente genera un mensaje autogenerado

**No lo uses tal cual.**

- Copia el **prompt base** de abajo
- Sustituye el mensaje autogenerado por el prompt base
- Envíalo para que Strapi AI genere el schema siguiendo nuestras reglas

> Importante: esto asegura que el resultado sea consistente (secciones, naming, navbar global, footer global, sin slugs, links estáticos, etc.).

---

## Prompt base

Usa este prompt tal cual cuando ejecutes Strapi AI.

```txt
Listo, este fue el prompt final
NON-NEGOTIABLE: The result is NOT complete unless you create (1) the Template Content Type(s) and (2) the Section Components connected via Dynamic Zone(s). Do NOT generate only components.

INPUT MODE
- If you have Figma URL / node structure: infer everything from frames/sections/components.
- If you ONLY have image previews: still infer the page structure by visually segmenting each template into multiple sections (do NOT refuse, do NOT collapse everything into one generic section).

SCOPE
- There will be MANY templates/pages.
- Detect each template name from the top-level Figma page/frame name and use it exactly (display name).
- Do NOT create a generic content type called "Page" unless the Figma template is literally named "Page".

CRITICAL CONSTRAINTS
- NO routing/redirect customization: no slug, no UID, no path, no redirects, no route config.
- Avoid JSON arrays for structured content (links/items/cards). Use repeatable components instead.

LINKS ARE STATIC (IMPORTANT)
- All navigation links / hrefs will be defined statically in code, NOT in Strapi.
- Therefore: DO NOT create link fields (href/URL) for menus, buttons, CTAs, cards, navbar or footer links.
- You may keep editable link LABELS only if they exist as visible text in Figma, but do not model destinations/URLs.

GLOBAL NAVBAR and FOOTER
- Create Navbar and Footer as their own SEPARATE models (Single Types preferred).
- Every template must reference/use the global Navbar and Footer (do not embed navbar or footer content inside each template).

NAMING CONVENTION (CRITICAL) — DERIVED FROM FIGMA TEMPLATE NAME
Let <TemplateName> be the exact Figma page/template name.
1) Content Types
- Display name: exactly <TemplateName>
- Technical API id: normalized from <TemplateName> (kebab-case)

2) Section components
- Display name format: "<TemplateName> <SectionName> Section"
- Technical UID/API id format: <template-name-normalized>.<section-name-normalized>

3) Nested/repeatable components inside a section
- Display name: "<TemplateName> <SectionName> <ItemName>"
- Technical: <template-name-normalized>.<section-name-normalized>-<item-name-normalized>

4) Shared reusable components (ONLY if truly reused across many templates)
- Use Global__ prefix (example: Global__ImageItem, Global__SEO)
- Do NOT create per-template duplicates of global components.

SECTION GENERATION RULES
- For each template: create one section component per top-level section/frame detected in Figma.
- If only image previews exist: create MULTIPLE sections by visually segmenting the template into blocks (minimum 6 sections, more if clearly needed).
- Prefer section names from visible headings; if unclear, use numbered placeholders:
  "<TemplateName> Section 01 Section", "<TemplateName> Section 02 Section", etc.
- IMPORTANT: Every generated "<TemplateName> * Section" component MUST be included in that template’s Dynamic Zone `sections`.

INFERENCE RULES (DO NOT HARD-CODE FIELDS)
- Infer the Content Type fields (other than `sections` and the Navbar and Footer references) from Figma.
- Infer the fields inside each Section component from Figma.
- Infer repeatable items/cards/logos/etc. as repeatable components (no JSON).
- Infer images as Media fields with editable alt text.

NAVBAR and FOOTER (INFER, BUT MUST BE FLEXIBLE)
- Navbar and Footer must each be a Single Type.
- Footer must support flexible columns (repeatable columns + repeatable labels), not hardcoded column1/column2/column3/column4.
- Navbar must support flexible navigation groups/items (repeatable), not hardcoded navItem1/navItem2/etc.
- Because links are static in code: store only editable labels/text and images/icons; do NOT store href/URLs.
- Infer the rest of the navbar and footer fields from Figma.

FINAL VALIDATION (MUST CONFIRM BEFORE FINISHING)
Confirm all of the following:
- Every detected Figma template has its own Content Type (named exactly like the Figma template).
- Each Content Type has a Dynamic Zone `sections` including ALL of its generated Section components.
- Navbar and Footer exist as separate Single Types and are referenced by every template.
- There are NO slug/UID/path/redirect fields anywhere.
- No JSON arrays were used for structured lists/links/items (repeatable components only).
- No href/URL fields were created (links are static in code).
```

## Checklist rápido (para validar que salió bien)

> Importante: **siempre revisa el output con calma**. Strapi AI puede interpretar mal algunas estructuras del diseño (sobre todo elementos repetidos).  
> Un caso común: un **carrusel** o una lista de cards puede quedar modelado como **un solo elemento** en vez de una **lista (array) de elementos**. Si pasa, hay que ajustar el schema para que sea “repetible”.

Después de generar el schema, revisa:

- [ ] Se crearon Content Types con el mismo nombre que los templates en Figma.
- [ ] Cada Content Type tiene un sections (Dynamic Zone).
- [ ] La página quedó dividida en varias secciones.
- [ ] El Footer y el Navbar existen como Single Type separados y están referenciados por cada template.
- [ ] No hay slug/uid/path/redirects en ningún lado.
- [ ] No hay campos href/url (los links van estáticos en código).
- [ ] No hay JSON arrays para listas (todo es “repetible”).
