---
title: Errores
sidebar_position: 4
slug: /back-end/errors
keywords: [quality, errors]
---

El manejo de errores es una de las partes más importantes al momento de diseñar y desarrollar una API. Esto trae consigo una serie de conceptos y detalles que muchas veces pueden resultar abrumadores si es la primera vez que trabajamos en este tema.

Por esa razón, nuestra documentación está dividida en pequeños documentos que pueden ayudar a cualquier líder técnico o desarrollador entender y enfocarse en aspectos específicos de su manejador de errores. Este primer documento presenta información básica para contextualizar el resto de la documentación.

---

### 🌐 Programación Orientada a Aspectos (AOP)

Antes de entender qué es la programación orientada a aspectos, es mejor explicar cómo este paradigma visualiza los sistemas que diseñamos. Bajo esta idea, lo que buscamos es identificar dos partes de nuestro código: las funciones relacionadas con lógica de negocio y las relacionadas con aspectos más transversales como loggers o, que sorpresa, manejo de errores.

Con esto en mente, la programación orientada a objetos nos indica que debemos modularizar nuestro código lo más que podamos para que la lógica de negocio no se enrede ni entre ella, ni con las funciones transversales a nuestro sistema.

---

### ✉ HTTP Status Codes

Los códigos de estatus de HTTP son una forma de categorizar las respuestas del servidor a través de un parámetro numérico con valores entre 100 y 599. Las categorías para estos valores están definidas en los siguientes rangos

:::info

#### Informativo

Estas respuestas permiten al servidor informar el cliente de ciertos aspectos de la comunicación, como la recepción de un mensaje o mejoras en el protocolo de comunicación.

_Códigos:_ `100 - 199`

:::

:::success

#### Respuestas exitosas

Indican al cliente que su petición fue procesada sin errores por parte del servidor. Adicionalmente suelen incluir información solicitada en los casos que apliquen.

_Códigos:_ `200 - 299`

:::

:::warning

#### Redirecciones

Esta categorías es usada por el servidor cuando el servidor necesita redirigir al cliente a otra URL para poder procesar la solicitud. Esto suele deberse a cambios en la ubicaciones de recursos, integraciones con proveedores, etc.

_Códigos:_ `300 - 399`

:::

:::danger

#### Errores del cliente

De esta manera el servidor le indica al cliente que la petición del cliente no puede ser procesada por algún problema relacionado con lo que el cliente ha entregado dentro del request. Esto puede estar relacionado con permisos, IDs de documentos inexistentes o eliminados, etc.

_Códigos:_ `400 - 499`

:::

:::danger

#### Errores del servidor

Estos errores son usados para indicar que algo salió mal dentro del servidor. Puede deberse a errores de código, funciones no implementadas, etc.

_Códigos:_ `500 - 599`

:::

Estas categorías permiten a los desarrolladores manejar los errores de diferentes maneras del lado del cliente cuando la API está diseñada con REST, pero al momento de utilizar GraphQL las cosas cambian un poquito (lo veremos más en detalle en el apartado de esta arquitectura)

Para efectos de esta documentación, solo nos estaremos enfocando en las categorías **4XX** y **5XX**.

---

### 💬 Manejador de idiomas y códigos

Más allá de los códigos de respuesta, también es importante presentar información clara sobre qué ocurrió. Esto se debe hacer desde tres puntos de vista:

1. Facilitar la integración de los endpoints al momento del desarrollo.
2. Facilitar la corrección de errores una vez el sistema esté operativo.
3. Mejorar la experiencia de usuario, principalmente para errores del cliente.

Con el fin de lograr esto, la API debe proveer al cliente no solo con códigos de error, sin también con mensajes en lenguaje natural. Esto se hace con la intención de centralizar los mensajes que puedan aparecer a lo largo de las diferentes plataformas que se tengan (admin, client, mobile), por lo que debe considerarse el manejo de diferentes idiomas por parte del backend.

---

### 🏠 Arquitecturas y casos de uso

En nuestro ecosistema actual, nos podemos encontrar con tres tipos de sistemas:

- APIs desarrolladas con REST.
- APIs desarrolladas con GraphQL.
- Cronjobs y procesos serverless.

Para el caso de REST las cosas son relativamente como las hemos hablado, debemos tener cuidado con categorizar bien los errores que presentamos a los clientes, proveer información clara pensando en el desarrollador y en el cliente, y manejar el lenguaje natural.

Con GraphQL tenemos una particularidad y es que esta arquitectura solo toma en cuenta los estatus 2XX dentro de su respuesta HTTP. Los creadores de esta arquitectura explican que su intención era simplificar la comunicación cliente-servidor, habilitando solamente este valor como significado de que el servidor está en la capacidad de procesar la solicitud.
De igual forma, GraphQL permite la customización de errores, donde podemos presentar el resto de la información que necesitemos.

Finalmente, los procesos Serverless no tienen la problemática de comunicarse con un cliente, y en cambio presentan el reto de dejar una traza que ayude a los desarrolladores entender qué pudo salir mal durante su ejecución. Esto puede realizar a través de un sistema de loggers o escrituras a una base de datos.
