---
title: Backend
sidebar_position: 3
slug: /basic-concepts/backend
---

# Backend

Esta guía explica qué es el **backend**, por qué importa y cómo se ve este concepto en proyectos de Landscapes.

La idea no es aprender desarrollo backend, sino entender qué tipo de cosas pertenecen a esta parte de una aplicación y por qué muchos cambios que parecen simples en realidad dependen de lógica que no se ve en pantalla.

---

## Qué es

El backend es la parte del sistema que **procesa lógica, reglas y operaciones internas**.

A diferencia del frontend, el backend normalmente no es visible para el usuario. El usuario ve el resultado de lo que hace el backend, pero no interactúa directamente con él como interactúa con una pantalla.

Dicho simple:  
el backend es la parte que decide **qué puede pasar, cómo debe pasar y qué se puede guardar o devolver**.

---

## Por qué importa

Entender qué es backend ayuda a:

- distinguir entre un problema visual y un problema de lógica,
- entender por qué algunas acciones requieren más que un cambio de pantalla,
- pedir cambios con más contexto,
- y detectar mejor cuándo un flujo necesita validaciones, permisos o procesamiento adicional.

En Landscapes esto importa mucho porque una gran parte del trabajo puede empezar en frontend, pero terminar dependiendo del backend para funcionar correctamente.

---

## Qué tipo de cosas suelen ser backend

Algunos ejemplos comunes:

### Reglas de negocio

Son decisiones que el sistema debe tomar.

Por ejemplo:

- si un usuario puede o no hacer una acción,
- si una compra cumple ciertas condiciones,
- si una tarea puede cambiar de estado,
- cómo se calcula un monto o una comisión.

### Validaciones del lado servidor

Son validaciones que no deberían depender solo de lo que se ve en pantalla.

Por ejemplo:

- verificar permisos reales,
- revisar que un dato exista,
- evitar guardar información inválida,
- confirmar que una acción esté permitida.

### Procesamiento de acciones

Cuando el sistema necesita ejecutar algo más que mostrar una pantalla.

Por ejemplo:

- crear un registro,
- actualizar varios datos,
- disparar una integración,
- transformar información antes de guardarla,
- ejecutar un flujo interno.

### Seguridad y permisos

El backend suele encargarse de validar cosas sensibles como:

- qué usuario está haciendo la acción,
- qué rol tiene,
- a qué datos puede acceder,
- qué operaciones tiene permitidas.

### Integraciones

Cuando la aplicación necesita comunicarse con otros servicios.

Por ejemplo:

- enviar información a un sistema externo,
- consultar un servicio de terceros,
- procesar una respuesta externa,
- sincronizar datos.

---

## Qué cosas no son solo backend

Que algo tenga lógica no significa que viva completamente aislado.

Muchos flujos reales conectan varias partes:

- el frontend captura la acción,
- el backend procesa la lógica,
- la base de datos guarda la información,
- una API o edge function conecta el flujo,
- y el frontend muestra el resultado.

Por eso, backend no debe verse como “algo separado”, sino como una parte central del funcionamiento de la aplicación.

---

## Ejemplo simple

Supongamos que un usuario quiere aprobar una solicitud.

En pantalla puede existir:

- un botón de “Aprobar”,
- un modal de confirmación,
- un mensaje de éxito o error.

Eso es la parte visible.

Pero cuando el usuario aprieta el botón, el backend puede necesitar:

- verificar si ese usuario tiene permiso,
- confirmar que la solicitud todavía esté pendiente,
- registrar quién la aprobó,
- actualizar el estado,
- guardar la fecha,
- notificar otro flujo o integración.

Todo eso ya es backend.

---

## Cómo se ve esto en Landscapes

En Landscapes, cuando hablamos de backend normalmente hablamos de cosas como:

- lógica que no vive solo en la pantalla,
- validaciones importantes,
- permisos,
- procesamiento de acciones,
- integraciones,
- flujos que pasan por APIs,
- y especialmente **Edge Functions** cuando hace falta lógica del lado servidor.

Muchas veces un prompt puede sonar simple, por ejemplo:

- “haz que al aprobar esto se actualicen otros datos”,
- “evita que un usuario haga esta acción si no cumple cierta condición”,
- “cuando se cree este registro, dispara este otro proceso”.

Ese tipo de cambio ya no es solo frontend.  
Eso normalmente implica backend o lógica de servidor.

---

## Qué señales indican que probablemente sí es backend

Estas son algunas señales comunes:

- hay reglas que decidir,
- hay permisos que validar,
- hay datos que procesar antes de guardar,
- hay que conectar varios pasos en un mismo flujo,
- hay que integrar un servicio externo,
- hay que evitar acciones inválidas,
- hay que proteger una operación sensible,
- hay que ejecutar lógica que no debería depender del navegador.

---

## Qué señales indican que probablemente no es solo backend

Estas señales suelen indicar que también hay otras capas involucradas:

- el usuario necesita una nueva pantalla,
- hay que agregar un nuevo campo visible,
- hay que reorganizar una vista,
- hay que mostrar mensajes de error o estados de carga,
- hay que guardar nueva información en la base de datos,
- hay que modificar un formulario,
- hay que cambiar cómo se muestra el resultado.

En esos casos, probablemente el cambio toca frontend, backend y quizás base de datos al mismo tiempo.

---

## Confusiones comunes

### “Backend es lo mismo que base de datos”

No.

La base de datos guarda información.  
El backend procesa lógica, reglas y acciones.

Muchas veces trabajan juntos, pero no son lo mismo.

---

### “Si algo no se ve, entonces no importa tanto”

Sí importa.

Muchas veces lo más crítico del sistema vive en backend:

- permisos,
- seguridad,
- validaciones,
- cálculos,
- integraciones,
- consistencia de datos.

---

### “Si el formulario existe, ya el flujo está listo”

No necesariamente.

La pantalla puede estar lista, pero todavía faltar:

- validaciones reales,
- permisos,
- procesamiento,
- guardado correcto,
- manejo de errores,
- lógica del negocio.

---

### “Todo se puede resolver desde frontend”

No.

Hay acciones que deben resolverse del lado servidor porque:

- son sensibles,
- necesitan validación segura,
- dependen de reglas del sistema,
- o requieren integraciones y procesamiento adicional.

---

## Cómo pensar un cambio de backend

Cuando vayas a pedir o revisar un cambio, ayuda hacerse estas preguntas:

- ¿Qué regla debe cumplir el sistema?
- ¿Quién puede hacer esta acción y quién no?
- ¿Qué debe pasar internamente cuando ocurre esta acción?
- ¿Qué validaciones no deberían depender solo del frontend?
- ¿Hay que calcular, transformar o conectar información?
- ¿Hay que ejecutar varios pasos en cadena?
- ¿Esto afecta permisos, seguridad o integraciones?

Estas preguntas ayudan a detectar si el cambio realmente necesita lógica de backend.

---

## Ejemplos de cambios típicos de backend

- validar permisos antes de ejecutar una acción,
- impedir duplicados,
- calcular un valor automáticamente,
- cambiar estados según reglas del negocio,
- ejecutar lógica al crear o editar un registro,
- integrar un servicio externo,
- transformar datos antes de guardarlos,
- controlar qué información se devuelve,
- manejar un flujo de aprobación,
- proteger operaciones sensibles.

---

## Relación entre backend, API y Edge Functions

Estos conceptos suelen estar conectados:

- El **backend** es la lógica y las operaciones internas.
- Una **API** es la forma en que una parte del sistema le pide algo a otra.
- Una **Edge Function** es una forma de ejecutar lógica del lado servidor.

No son exactamente lo mismo, pero en la práctica muchas tareas de backend terminan pasando por APIs y Edge Functions.

---

## Ideas clave para recordar

- El backend es la parte que procesa lógica, reglas y operaciones internas.
- No se ve en pantalla, pero muchas veces define lo más importante del flujo.
- No es lo mismo que frontend ni que base de datos.
- Un cambio visual puede depender de backend para funcionar de verdad.
- Validaciones, permisos, cálculos e integraciones suelen vivir en backend.
- En Landscapes, entender backend ayuda a detectar mejor el alcance real de una tarea y a escribir prompts con más contexto.