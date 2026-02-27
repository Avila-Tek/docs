---
title: Strapi (CMS)
sidebar_position: 5
slug: /strapi
---

# Strapi (CMS) — Introducción

## ¿Qué es Strapi?

Strapi es un CMS, una herramienta que nos permite **editar el contenido** de una web sin tocar el código.  
Piensa en Strapi como un “panel de administración” donde podemos cambiar textos, imágenes y secciones de una landing o sitio, y esos cambios luego se ven reflejados en el producto.

En Landscapes lo usamos para que:

- El contenido (copy, imágenes, secciones) se pueda ajustar rápido.
- No dependamos de un deploy para cambios simples.
- Las páginas queden organizadas con una estructura clara y mantenible.

---

## ¿Qué problemas nos ayuda a resolver?

Strapi nos ayuda especialmente cuando:

- Hay muchas páginas o landings parecidas.
- El equipo quiere iterar el texto e imágenes con frecuencia.
- Queremos separar **contenido** (editable) de **lógica** (código).

Ejemplos típicos:

- Cambiar títulos, subtítulos, descripciones.
- Cambiar imágenes (hero, logos, backgrounds).
- Reordenar secciones de una landing.
- Activar/desactivar secciones sin borrar código.

---

## Qué **sí** manejamos en Strapi

En general, Strapi será la “fuente de verdad” para:

- Textos visibles en la UI (títulos, descripciones, etiquetas).
- Imágenes e íconos (y su texto alternativo / alt).
- Listas repetibles (cards, features, items, etc.).
- La composición de la página por secciones (qué secciones existen y en qué orden).

---

## Qué **NO** manejamos en Strapi (importante)

Hay cosas que **no queremos modelar en Strapi** porque hacen el sistema más complejo o se vuelven difíciles de mantener.

### 1) Rutas / redirecciones

Strapi **no** define:

- URLs dinámicas (slug)
- paths
- redirects
- reglas de navegación

Eso se define en el código del frontend.

---

## Cómo encaja Strapi con Figma y la IA

Nuestro flujo usual será:

1) **Diseño en Figma**  
   Figma representa cómo se verá la landing y cómo se divide por secciones.

2) **Import a Strapi usando Strapi AI**  
   Strapi AI toma el diseño y genera una estructura para poder editar contenido:
   - páginas/templates
   - secciones
   - imágenes
   - listas repetibles

3) **Frontend (y luego Lovable) consume Strapi**  
   El frontend lee los datos desde Strapi y renderiza la página.

> Lo importante: Strapi es para **contenido**, Lovable/Frontend es para **comportamiento** y **experiencia**.

---

## Principios simples que seguiremos

- **Contenido editable, código estable**: cambios simples van al CMS; lógica y navegación se quedan en el frontend.
- **Separar páginas en secciones**: una página no debe ser “un bloque gigante”; debe ser una lista de secciones.
- **Evitar estructuras raras**: no usar JSON para listas (mejor componentes repetibles).
- **Imágenes siempre con alt**: todo media debe tener alt text editable.
