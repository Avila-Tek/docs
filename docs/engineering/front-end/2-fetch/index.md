---
sidebar_position: 2
title: 🔌 Cómo integramos una API
slug: /frontend/fetch
keywords: ['fetch']
tags: ['avila-tek', 'fetch']
---

# 🔌 Cómo integramos una API

En esta sección definimos cómo nuestra aplicación **se comunica con el backend** de forma consistente, segura y escalable.

El objetivo no es solo “hacer requests”, sino **establecer un flujo claro de datos** que:

- aísle a la UI de los detalles del API,
- centralice configuraciones y transformaciones,
- y permita manejar queries y mutations de forma predecible.

Para lograrlo, separamos responsabilidades en tres niveles:
**cliente compartido**, **servicios de dominio** y **configuración de queries/mutations**, utilizando React Query como capa de orquestación.

Esta sección se divide en los siguientes apartados:

- **Packages Service**  
  Cliente compartido y servicios base que centralizan la comunicación con la API.  
  👉 [/frontend/standards/fetch/packages](/docs/frontend/fetch/packages)

- **React Query**  
  Libreria para cache, query keys, invalidation, retries, y patrones que seguimos.  
  👉 [docs/frontend/standards/fetch/react-query](/docs/frontend/fetch/react-query)

- **Queries**  
  Obtención de datos desde el servidor, manejo de caché, prefetching y lectura desde client-side.  
  👉 [docs/frontend/standards/fetch/queries](/docs/frontend/fetch/queries)

- **Mutations**  
  Operaciones de escritura hacia el backend, manejo de errores y configuración de mutaciones.  
  👉 [docs/frontend/standards/fetch/mutations](/docs/frontend/fetch/mutations)
