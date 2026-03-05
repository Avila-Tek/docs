---
title: Manejo de ramas
sidebar_position: 4
slug: /lovable-setup/branch-management
---

Esta guía explica cómo vamos a trabajar con **dos ramas** para evitar confusiones y publicar con más control:

- **main**: la versión “estable” (la que consideramos lista para publicar).
- **development**: donde **se trabaja día a día**.

> Regla simple del equipo: **siempre se codea en `development`**. `main` se actualiza solo cuando vamos a liberar cambios.

---

## ¿Por qué hacemos esto?

Porque Lovable puede trabajar con GitHub, y si no definimos una regla clara, es fácil que alguien termine haciendo cambios en la rama equivocada.

Además, Lovable por defecto **solo sincroniza la rama principal del repo (la default, normalmente `main`)**.
Para poder trabajar cómodos en `development`, necesitamos activar el cambio de ramas dentro de Lovable.

---

## Paso a paso (setup)

### 1) Conectar el proyecto a GitHub

Conecta el proyecto a GitHub desde los settings de Lovable.

> Nota: si alguna vez “no ves cambios” en Lovable, normalmente es porque estabas mirando una rama distinta: por defecto Lovable solo sincroniza la rama principal.

---

### 2) Crear la rama `development` en GitHub

En tu repo, crea una rama llamada `development` basada en `main`.

- `main` = estable
- `development` = trabajo diario

---

### 3) Activar el feature para cambiar de rama en Lovable (Labs)

En Lovable, activa **GitHub branch switching** (está en Labs).

Una vez activo, podrás elegir qué rama está editando Lovable desde:
**Project Settings → GitHub → Branch selector**.

---

### 4) Cambiar Lovable a `development`

En el selector de rama, selecciona **`development`**.

✅ A partir de aquí, los cambios que hagas en Lovable se guardan en `development`.

---

## Cómo trabajamos en el día a día

- Siempre trabajar en **`development`**.
- Validar cambios y flujos normalmente (sin tocar `main`).
- Mantener `main` “limpia” para que sea fácil publicar cuando toque.

---

## Cómo liberamos cambios (release)

1) Abrir PR: **`development → main`**  
2) Revisar y mergear el PR (cuando esté listo)
3) En Lovable, cambiar a la rama **`main`**
4) Publicar con **Publish → Update**
5) Cuando ya se hayan publicado los cambios, en Lovable, cambiar a la rama **`development`**

> Importante: al publicar, Lovable despliega **la versión que tienes abierta en ese momento** (“solo la versión actual se despliega”). 
> Por eso es clave publicar estando en `main`.

---

## Checklist rápido (para el equipo)

- [ ] ¿Estoy en `development` antes de empezar a trabajar?
- [ ] ¿Lo que voy a publicar ya está mergeado a `main`?
- [ ] ¿Estoy parado en `main` en Lovable antes de hacer Publish?
