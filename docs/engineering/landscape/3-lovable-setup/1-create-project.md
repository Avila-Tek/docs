---
title: Crear un proyecto
sidebar_position: 1
slug: /lovable-setup/create-project
---

# Crear un proyecto en Lovable

Esta guía cubre el **setup mínimo** para crear un proyecto en Lovable enfocado en nuestra prioridad #1: **velocidad** (sin sacrificar calidad).

## 1) Crear un proyecto vacío en Lovable

1. Abre Lovable y usa el prompt:
   - **"Crea un nuevo proyecto vacío"**
2. Luego renombralo y ponle un nombre claro y consistente.
3. (Opcional) Agrega una descripción corta: objetivo + stack.

> En este punto el proyecto existe solo en Lovable (aún no hay repo).

## 2) Conectar el proyecto a GitHub (Lovable crea el repo)

> **Importante:** lovable no permite conectar un proyecto con un repo preexistente, **NO creamos el repo antes**.  
> Al conectar GitHub, **Lovable crea un repositorio nuevo** para ese proyecto y empieza el sync.

1. Ve a **Settings → Connectors → GitHub**.
2. **Connect GitHub** (OAuth): autoriza tu cuenta.
3. Dentro del proyecto, conecta GitHub:
   - Usa el ícono de GitHub (arriba a la derecha) o **Settings → Connectors → GitHub → Connect project**.
   - Selecciona la organización/cuenta destino.

Resultado:

- Se crea un repo nuevo en GitHub.
- Inicia el **two-way sync** automáticamente (Lovable ↔ GitHub).
- La rama por defecto es la fuente de verdad (`main`).

Consideraciones:

- Luego de crear el repo podemos renombrarlo (esta acción no rompe el sync).

## 3) Conectar Lovable Cloud (backend y capacidades full-stack)

Lovable Cloud se usa para habilitar backend cuando el proyecto lo requiere (DB, auth, storage, edge functions).

1. Presiona el ícono de la nube en la vista principal del proyecto
2. Presiona el botón de "Enable Cloud" y sigue el proceso de configuración en el chat de Lovable

## 4) Checklist final

- [ ] Proyecto creado en Lovable (vacío)
- [ ] GitHub conectado (OAuth + App instalada)
- [ ] Repo creado por Lovable y sync activo
- [ ] Lovable Cloud configurado (En caso de ser necesario)
