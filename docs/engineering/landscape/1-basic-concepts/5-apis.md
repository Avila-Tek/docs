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

En palabras sencillas, una API permite que una parte de la aplicación le pida algo a otra.

Por ejemplo:

- Pedir datos
- Guardar información
- Actualizar un registro
- Ejecutar una acción
- Consultar un servicio externo

La API no suele ser algo que el usuario vea directamente, lo que ve el usuario es el resultado de esa comunicación.

---

## Cómo pensar una API de forma simple

Una forma fácil de entenderlo es pensar en un restaurante:

- El **frontend** es lo que el cliente ve y usa, como el plato que recibe en la mesa
- El **backend** es la cocina o el chef, donde realmente se prepara la orden
- La **API** sería el mesero, que lleva la petición del cliente a la cocina y luego trae de vuelta el resultado

El cliente no entra directamente a la cocina ni prepara la comida por su cuenta.  
Hace una petición, esa petición viaja por el mesero, la cocina la procesa y luego llega la respuesta.

Con una aplicación pasa algo parecido:

- El usuario hace una acción en frontend
- Esa acción viaja por una API
- El backend procesa la solicitud
- Finalmente se devuelve una respuesta para mostrarla en pantalla

---

## Ejemplo simple

Supongamos que el usuario abre una pantalla con una lista de tareas.

Para mostrar esa lista, el frontend puede pedir:

- “Dame las tareas de este usuario”.

La API responde con los datos y luego el frontend los muestra en pantalla.

Si el usuario crea una nueva tarea, el flujo puede ser:

- El frontend envía el título y la descripción
- La API recibe esa información
- El backend la procesa
- Se guarda en la base de datos
- Se devuelve una respuesta
- El frontend muestra la respuesta

---

## Request y response

Estos dos conceptos son de los más útiles para entender APIs.

### Request

Es la petición que una parte del sistema hace a otra.

Por ejemplo:

- Pedir una lista
- Enviar un formulario
- Actualizar un estado
- Eliminar un registro

---

### Response

Es la respuesta que devuelve el sistema.

Por ejemplo:

- Los datos solicitados
- Una confirmación de éxito
- Un mensaje de error
- Una validación fallida

En pocas palabras, **request** es lo que se pide a la API, **response** es lo que devuelve la API.

---

## Qué tipo de cosas suelen pasar por una API

Algunos ejemplos comunes:

### Consultar datos

- Cargar una tabla
- Mostrar un detalle
- Traer filtros
- Consultar reportes

### Guardar información

- Crear registros
- Editar datos
- Cambiar estados
- Enviar formularios

### Ejecutar acciones

- Aprobar una solicitud
- Cancelar una reserva
- Procesar una compra
- Disparar un flujo interno

### Integrarse con otros servicios

- Enviar datos a un sistema externo
- Consultar una integración
- Recibir información de terceros

---

## Cómo se ve esto en Landscapes

En Landscapes, una API puede aparecer cuando:

- El frontend necesita leer o guardar datos,
- Una edge function ejecuta lógica,
- El sistema consulta Supabase,
- Se conecta una integración externa,
- Se dispara una acción que no vive solo en la UI.

Muchos cambios dependen de APIs aunque no se nombren explícitamente.

Por ejemplo:

- “Haz que esta tabla cargue los datos reales”,
- “Guarda este formulario”,
- “Actualiza el estado al aprobar”,
- “Trae esta información al abrir la pantalla”.

Todo eso normalmente implica una API o algún flujo de comunicación similar.

---

## Qué señales indican que probablemente hay una API involucrada

Estas son algunas señales comunes:

- Hay que cargar datos desde algún lugar
- Hay que guardar información
- Hay que ejecutar una acción al presionar un botón
- Hay que actualizar un registro
- Hay que mostrar resultados reales en pantalla
- Hay que conectar la app con otro sistema
- Hay que procesar una acción fuera del navegador

---

## Qué puede fallar en una API

Cuando una API falla, los síntomas pueden verse en pantalla como:

- Datos que no cargan
- Formularios que no guardan
- Botones que no completan la acción
- Loaders que quedan eternos
- Errores inesperados
- Respuestas incompletas
- Datos desactualizados

Por eso, aunque la API no se vea, muchas veces explica por qué un flujo no funciona.

---

## Confusiones comunes

### “API es lo mismo que backend”

No exactamente.

El backend es la lógica y las operaciones internas del sistema. Por otro lado, la API es una forma de comunicarse con esa lógica o con otra parte del sistema.

Muchas veces trabajan juntas, pero no son lo mismo.

---

### “Si la pantalla no carga, el problema es del frontend”

No necesariamente, puede ser que el frontend esté bien, pero la API:

- No respondió
- Devolvió error
- Devolvió datos vacíos
- Tardó demasiado
- Recibió mal la petición

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

- Conectar una tabla a datos reales
- Hacer que un formulario guarde
- Actualizar un estado desde un botón
- Cargar información al abrir una vista
- Filtrar resultados con datos reales
- Consultar un servicio externo
- Disparar una acción al crear o editar un registro
- Devolver mensajes correctos de éxito o error

---

## Relación entre APIs, frontend, backend y base de datos

Estos conceptos suelen trabajar juntos:

- El **frontend** muestra la pantalla y captura acciones.
- La **API** comunica una parte del sistema con otra.
- El **backend** procesa la lógica y las reglas.
- La **base de datos** guarda la información.
- Las **Edge Functions** pueden ejecutar parte de esa lógica del lado servidor.

Por eso, una API no suele vivir sola, normalmente forma parte de un flujo más grande.

---

## Ideas clave para recordar

- Una API es un puente de comunicación entre partes del sistema.
- Permite pedir datos, guardar información y ejecutar acciones.
- Request es la petición; response es la respuesta.
- Muchos flujos visibles dependen de APIs aunque el usuario no las vea.
- Cuando algo no carga o no guarda, una API puede estar en el medio.
