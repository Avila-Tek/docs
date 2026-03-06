---
title: APIs
sidebar_position: 5
slug: /basic-concepts/apis
---

# APIs

Esta guía explica qué es una **API**, por qué importa y cómo se ve este concepto en proyectos de Landscapes.

La idea no es aprender a construir APIs, sino entender qué papel cumplen dentro de una aplicación y por qué muchos flujos dependen de ellas aunque no se vean directamente en pantalla.

---

## Qué es

Una API es una forma ordenada de **comunicación entre partes de un sistema**.

Dicho simple:  
una API permite que una parte de la aplicación le pida algo a otra.

Por ejemplo:

- pedir datos,
- guardar información,
- actualizar un registro,
- ejecutar una acción,
- consultar un servicio externo.

La API no suele ser algo que el usuario vea directamente.  
Lo que ve el usuario es el resultado de esa comunicación.

---

## Por qué importa

Entender qué es una API ayuda a:

- entender cómo se mueve la información dentro del sistema,
- detectar mejor por qué algo no carga o no guarda,
- distinguir entre un problema visual y un problema de comunicación,
- y escribir mejores prompts cuando un flujo depende de datos o acciones.

En Landscapes esto importa mucho porque gran parte de las acciones reales de una aplicación pasan por una API, incluso cuando el cambio parece solo de frontend.

---

## Cómo pensar una API de forma simple

Una forma fácil de verlo es así:

- el **frontend** muestra la pantalla,
- el usuario hace una acción,
- esa acción envía una petición,
- otra parte del sistema responde,
- el frontend muestra el resultado.

La API es ese puente entre quien pide algo y quien responde.

---

## Ejemplo simple

Supongamos que el usuario abre una pantalla con una lista de tareas.

Para mostrar esa lista, el frontend puede pedir:

- “dame las tareas de este usuario”.

La API responde con los datos.  
Luego el frontend los muestra en pantalla.

Si el usuario crea una nueva tarea, el flujo puede ser:

- el frontend envía el título y la descripción,
- la API recibe esa información,
- el sistema la procesa,
- la guarda,
- y devuelve una respuesta.

---

## Request y response

Estos dos conceptos son de los más útiles para entender APIs.

### Request

Es la petición que una parte del sistema hace a otra.

Por ejemplo:

- pedir una lista,
- enviar un formulario,
- actualizar un estado,
- eliminar un registro.

---

### Response

Es la respuesta que devuelve el sistema.

Por ejemplo:

- los datos solicitados,
- una confirmación de éxito,
- un mensaje de error,
- una validación fallida.

Dicho simple:  
**request** es lo que se pide, **response** es lo que vuelve.

---

## Qué tipo de cosas suelen pasar por una API

Algunos ejemplos comunes:

### Consultar datos

- cargar una tabla,
- mostrar un detalle,
- traer filtros,
- consultar reportes.

### Guardar información

- crear registros,
- editar datos,
- cambiar estados,
- enviar formularios.

### Ejecutar acciones

- aprobar una solicitud,
- cancelar una reserva,
- procesar una compra,
- disparar un flujo interno.

### Integrarse con otros servicios

- enviar datos a un sistema externo,
- consultar una integración,
- recibir información de terceros.

---

## Cómo se ve esto en Landscapes

En Landscapes, una API puede aparecer cuando:

- el frontend necesita leer o guardar datos,
- una edge function ejecuta lógica,
- el sistema consulta Supabase,
- se conecta una integración externa,
- se dispara una acción que no vive solo en la UI.

Muchos cambios dependen de APIs aunque no se nombren explícitamente.

Por ejemplo:

- “haz que esta tabla cargue los datos reales”,
- “guarda este formulario”,
- “actualiza el estado al aprobar”,
- “trae esta información al abrir la pantalla”.

Todo eso normalmente implica una API o algún flujo de comunicación similar.

---

## Qué señales indican que probablemente hay una API involucrada

Estas son algunas señales comunes:

- hay que cargar datos desde algún lugar,
- hay que guardar información,
- hay que ejecutar una acción al presionar un botón,
- hay que actualizar un registro,
- hay que mostrar resultados reales en pantalla,
- hay que conectar la app con otro sistema,
- hay que procesar una acción fuera del navegador.

---

## Qué puede fallar en una API

Cuando una API falla, los síntomas pueden verse en pantalla como:

- datos que no cargan,
- formularios que no guardan,
- botones que no completan la acción,
- loaders que quedan eternos,
- errores inesperados,
- respuestas incompletas,
- datos desactualizados.

Por eso, aunque la API no se vea, muchas veces explica por qué un flujo no funciona.

---

## Confusiones comunes

### “API es lo mismo que backend”

No exactamente.

El backend es la lógica y las operaciones internas del sistema.  
La API es una forma de comunicarse con esa lógica o con otra parte del sistema.

Muchas veces trabajan juntas, pero no son lo mismo.

---

### “Si la pantalla no carga, el problema es del frontend”

No necesariamente.

Puede ser que el frontend esté bien, pero la API:

- no respondió,
- devolvió error,
- devolvió datos vacíos,
- tardó demasiado,
- o recibió mal la petición.

---

### “Guardar datos es solo tema de base de datos”

No siempre.

Antes de guardar, normalmente hay una comunicación intermedia.  
Muchas veces el frontend no escribe directo en la base de datos, sino que pasa por una API o una función de backend.

---

### “Si el botón existe, la acción ya está lista”

No.

El botón es solo la parte visible.  
Para que la acción funcione, muchas veces hace falta una API que procese y responda correctamente.

---

## Cómo pensar un problema relacionado con APIs

Cuando algo falla, ayuda hacerse estas preguntas:

- ¿La app está intentando cargar o guardar información?
- ¿La acción depende de una petición a otra parte del sistema?
- ¿Se está enviando la información correcta?
- ¿El sistema está respondiendo con éxito o con error?
- ¿El problema está en la pantalla o en la comunicación?
- ¿La acción depende de backend, edge functions o integraciones?

Estas preguntas ayudan a ubicar mejor el problema sin necesidad de entrar en detalle técnico profundo.

---

## Ejemplos de cambios típicos relacionados con APIs

- conectar una tabla a datos reales,
- hacer que un formulario guarde,
- actualizar un estado desde un botón,
- cargar información al abrir una vista,
- filtrar resultados con datos reales,
- consultar un servicio externo,
- disparar una acción al crear o editar un registro,
- devolver mensajes correctos de éxito o error.

---

## Relación entre APIs, frontend, backend y base de datos

Estos conceptos suelen trabajar juntos:

- El **frontend** muestra la pantalla y captura acciones.
- La **API** comunica una parte del sistema con otra.
- El **backend** procesa la lógica y las reglas.
- La **base de datos** guarda la información.
- Las **Edge Functions** pueden ejecutar parte de esa lógica del lado servidor.

Por eso, una API no suele vivir sola.  
Normalmente forma parte de un flujo más grande.

---

## Ideas clave para recordar

- Una API es un puente de comunicación entre partes del sistema.
- Permite pedir datos, guardar información y ejecutar acciones.
- Request es la petición; response es la respuesta.
- Muchos flujos visibles dependen de APIs aunque el usuario no las vea.
- Cuando algo no carga o no guarda, una API puede estar en el medio.
- En Landscapes, entender APIs ayuda a pensar mejor cómo viaja la información y dónde puede estar fallando un flujo.