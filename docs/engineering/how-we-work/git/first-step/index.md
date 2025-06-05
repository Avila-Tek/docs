---
sidebar_position: 1
title: 🍼 Primeros pasos
---

# 🍼 Primeros pasos

## Requisitos para empezar

Como sabes, nuestros repositorios remotos se encuentran alojados en GitHub, lo primero y más importante es tener un cuenta dentro de la plataforma, considere los siguiente aspectos:

1. Deberá tener un nombre de usuario claro.
2. Deberá agregar una foto profesional.
3. Deberá agregar su correo corporativo (`<nombre>@avilatek.dev`) al listado de correos disponibles.
4. Deberá activar la autenticación de dos factores (2FA).

## Como manejar ramas

En Avila Tek manejamos un flujo de trabajo basado en ramas, algo que es una adaptación de gitflow; para ello creamos ramas a partir de development, asignándoles como nombres los id de las HUs e.g. PRO-001. (Este valor puede encontrarse en la información ampliada de la HU)

Así entonces, cada rama tendra las actividades de frontend y backend relacionadas con esta HUs, idealmente la rama la debería empezar a hacer el desarrollador backend y realizar un push con un plateanmiento inicial del endpoint (sin implementación); es decir, el desarrollador backend se encarga de de crear la rama y hacer la ruta, controlador, servicio y dtos; sin implementar propiamente el servicio sino que dejando data dummy; esto para que desde un inicio crear el diseño del endpoint y luego para implementar propiamente el servicio.

## Como manejar los commits

En Avila Tek, es muy importante que regularmente subamos los cambios al repo para evitar cualquier inconvenietes en el futuro. Para poder hacer esto es importante entender que nuestros commit se hacen utilizando la metodología de conventional commits.

## Conventional commits

Lea lo que establece la guía para poner en contexto
https://www.conventionalcommits.org/en/v1.0.0/#summary

Se puede apoyar con la siguiente extensión de vscode para construir sus mensajes de commit:
https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits
