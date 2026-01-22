---
title: Crear proyecto y team
sidebar_position: 2
slug: /frontend/quality/error-handling/create-sentry-team
---

# Crear proyecto y team en Sentry

## 1. Crear Team y agregar Members correspondientes

- Debes tener acceso a la organización de [Sentry de **Avila Tek**](https://avilatek.sentry.io/auth/login/avilatek/?referrer=alert_email).

### Crear un nuevo Team

Si es un proyecto nuevo:

- Crear un [**Team**](https://avilatek.sentry.io/settings/teams/) (grupo de personas que comparte responsabilidad sobre uno o varios proyectos).
- Al crear el Team:
  - Agregar como **members** a las personas que forman parte del proyecto.
  - Agregar las **aplicaciones correspondientes** (ver detalles más adelante).

### Verificar un Team existente

Si el Team ya existe:

- Verificar que contiene el equipo correcto:

  - Developers del proyecto.
  - Leads correspondientes.
  - Cuenta de DevOps.

- Verificar que el Team tiene asociadas las aplicaciones correctas.  
  _(Si aún no existen aplicaciones, deberán agregarse posteriormente)_

### Ejemplo de composición del Team

![sentry team](/img/frontend/error-handling/sentry-team.png)

### Ejemplo de aplicaciones asociadas

![sentry project](/img/frontend/error-handling/sentry-projects.png)
