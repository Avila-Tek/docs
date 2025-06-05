---
title: Bienvenida al equipo (versión corta)
slug: /mobile/welcome-tldr
keywords: [onboarding, welcome]
sidebar_class: 'hidden'
---

# Bienvenida al equipo (versión corta)

:::info ¿Buscas la versión completa?
Esta es la versión corta de la guía de bienvenida al equipo. Para la versión completa, lee la guía [aquí](/docs/mobile).
:::

Acá dejaré todos los links a las herramientas que mencionamos en la guía completa. Te recomiendo que lea
s la guía completa.

## **Fundamental**

- [Saber Bloc](https://www.notion.so/Getting-Started-Short-version-922bc044fb4c4ad09269963b46371e55?pvs=21)
- Instalar [mason_cli](https://www.notion.so/Getting-Started-Short-version-922bc044fb4c4ad09269963b46371e55?pvs=21)
- Instalar [melos](https://www.notion.so/Getting-Started-Short-version-922bc044fb4c4ad09269963b46371e55?pvs=21)
- Seguir la convención [Conventional Commits](https://www.notion.so/Getting-Started-Short-version-922bc044fb4c4ad09269963b46371e55?pvs=21)

## Bloc

Bloc es el manejador de estados que implementamos en nuestros proyectos.

Lee la documentación aquí: [https://bloclibrary.dev/#/](https://bloclibrary.dev/#/)

**Si no sabes Bloc**, es vital que leas la documentación completa, y realices al menos uno de los tutoriales para que entiendas como funciona.

### Convenciones

En Bloc seguimos convenciones de nombrado de las clases de Eventos y Estados del Bloc/Cubit. Te aconsejo que la leas aquí:

[BLoC: Convenciones](https://www.notion.so/BLoC-Convenciones-8d92cf330dce4a61a5230e1abe3b6aee?pvs=21)

## Mason

Es el CLI de generación de bloques de código. Necesario para crear los features con la estructura que seguimos en nuestros proyectos con el _brick_ `feature_brick`.

- Link de mason_cli: [https://pub.dev/packages/mason_cli](https://pub.dev/packages/mason_cli)
- Link del feature_brick: [https://brickhub.dev/bricks/feature_brick/0.6.1](https://brickhub.dev/bricks/feature_brick/0.6.1)

## Redacción de los commits

Se redactan siguiendo la convención _Conventional Commits 1.0.0._

**Es obligatorio que lo sigan.**

- Documentación: [https://www.conventionalcommits.org/en/v1.0.0/#summary](https://www.conventionalcommits.org/en/v1.0.0/#summary)

Pueden usar [esta extensión de VSCode](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits) para ayudarlos a seguir la convención.

## Melos

Permite la creación de mono-repos.

- Librería: [https://pub.dev/packages/melos](https://pub.dev/packages/melos)
- Documentación: [https://melos.invertase.dev/](https://melos.invertase.dev/)

## Very Good CLI

Un CLI para crear apps y paquetes de Dart y Flutter que se encarga de configurar automáticamente varios aspectos importantes para el desarrollo.

Lo importante que debes saber es que si vas a crear un nuevo proyecto o un paquete, lo hagas con este CLI.

- Librería: [https://pub.dev/packages/very_good_cli](https://pub.dev/packages/very_good_cli)
