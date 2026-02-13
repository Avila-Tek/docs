---
title: Configuración de Agent Docs
sidebar_position: 2
slug: /lovable-knowledge
---

# Configuración de Agent Docs (Knowledge de Lovable)

Esta guía explica cómo configurar el **Knowledge** de Lovable para que:

- Siga nuestros estándares sin depender del prompt
- Use *progressive disclosure* (lee solo lo necesario),
- Sea **eficiente en tokens**.

## 1) Copiar la carpeta `agent_docs/` desde `lovable-template` al repo del proyecto

Nuestro estándar es arrancar cualquier proyecto con la carpeta `agent_docs/` (y archivos relacionados) desde el repositorio **lovable-template**.

**Recomendación:** hacerlo directamente con GitHub (más rápido y con menos fricción).

Pasos:

1. Abre el repo **lovable-template** en GitHub.
2. Copia la carpeta `agent_docs/` completa (y cualquier archivo root asociado si aplica).
3. Pégala en el repo del proyecto (el repo que creó Lovable).
4. Haz commit y push a la rama principal (`main`).

> Link del repo: **(https://github.com/landscape-at/lovable-template)**

Reglas:

- Copia la carpeta completa (no solo algunos docs).
- No renombres rutas internas sin actualizar referencias.
- Mantén `agent_docs/` como fuente de verdad de guías.

## 2) Verificar que Lovable lea los Agent Docs desde el repo

Luego del push:

- Abre el proyecto en Lovable.
- Confirma que el sync con GitHub esté activo.
- Si vas a pedirle trabajo a Lovable de inmediato, en el prompt puedes referenciar que ya existen los docs (ej: “Lee agent_docs/…”), pero la idea es que el **Knowledge** lo guíe incluso sin mencionarlo.

## 3) Configurar Custom Knowledge en Lovable

El Knowledge debe ser **muy conciso** para no inflar tokens en cada prompt.

Pasos:

1. En el proyecto de Lovable, entra a **Project Settings → Custom Knowledge**.
2. Copia y pega el contenido de:
   - `agent_docs/00_lovable_knowledge.md`
3. Guarda los cambios.

Reglas:

- En el Knowledge pega **solo** `00_lovable_knowledge.md` (no pegues todos los docs).
- Los demás documentos viven en el repo y se consultan por *progressive disclosure*.

## 4) Checklist final

- [ ] `agent_docs/` copiado desde `lovable-template` al repo del proyecto
- [ ] Commit + push a `main`
- [ ] Contenido de `agent_docs/00_lovable_knowledge.md` pegado en **Custom Knowledge**
- [ ] Lovable sincronizado y listo para seguir estándares sin prompts largos
