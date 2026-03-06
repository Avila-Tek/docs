---
title: Edge Functions
sidebar_position: 6
slug: /basic-concepts/edge-functions
---

# Edge Functions

Esta guía explica qué son las **Edge Functions**, por qué importan y cómo se ve este concepto en proyectos de Landscapes.

La idea no es aprender a desarrollarlas desde cero, sino entender para qué sirven, cuándo suelen aparecer y por qué muchas tareas importantes del sistema dependen de ellas aunque no se vean en pantalla.

---

## Qué es

Una Edge Function es una función que corre **del lado del servidor** para ejecutar lógica específica.

Dicho simple:  
es una pieza de código que se usa cuando una acción no debería resolverse solo en frontend o cuando hace falta hacer algo de forma más segura y controlada.

Una Edge Function puede, por ejemplo:

- procesar una acción,
- validar información,
- conectarse con servicios externos,
- transformar datos,
- ejecutar lógica del negocio,
- o responder a una petición del sistema.

---

## Por qué importa

Entender qué es una Edge Function ayuda a:

- distinguir cuándo un cambio ya no es solo de frontend,
- entender por qué algunas acciones necesitan lógica del lado servidor,
- detectar mejor el impacto real de ciertos prompts,
- y trabajar con más criterio cuando una funcionalidad toca integraciones, seguridad o procesamiento.

En Landscapes esto importa mucho porque las Edge Functions suelen ser una de las herramientas principales para resolver lógica más compleja dentro de Lovable y Supabase.

---

## Cómo pensar una Edge Function de forma simple

Una forma fácil de verlo es esta:

- el usuario hace una acción,
- el frontend dispara un flujo,
- una Edge Function recibe esa acción,
- ejecuta la lógica necesaria,
- y devuelve un resultado.

Es decir, la Edge Function funciona como una pieza que toma una solicitud, hace trabajo del lado servidor y responde.

---

## Cuándo suele usarse una Edge Function

Normalmente se usa cuando hace falta hacer algo que no conviene dejar solo en frontend.

Por ejemplo:

### Validaciones importantes

- validar permisos,
- revisar condiciones antes de ejecutar una acción,
- evitar operaciones inválidas,
- proteger lógica sensible.

### Procesamiento de lógica

- calcular valores,
- encadenar varios pasos,
- transformar datos antes de guardarlos,
- ejecutar flujos con varias decisiones.

### Integraciones externas

- llamar un servicio externo,
- enviar datos a otra plataforma,
- recibir una respuesta y procesarla,
- sincronizar información.

### Operaciones sensibles

- usar secrets,
- ejecutar lógica que no debería exponerse al navegador,
- controlar mejor qué se permite hacer y cómo.

---

## Qué cosas no deberían resolverse solo en frontend

Hay casos donde el frontend puede mostrar la acción, pero no debería ser quien resuelva todo.

Por ejemplo:

- validar permisos reales,
- usar credenciales privadas,
- enviar datos a servicios externos,
- ejecutar lógica importante del negocio,
- hacer procesos que no deberían depender del navegador del usuario.

En esos casos, una Edge Function suele ser una mejor opción.

---

## Ejemplo simple

Supongamos que un usuario presiona un botón para aprobar una solicitud.

En frontend puede existir:

- el botón,
- el modal de confirmación,
- el mensaje de éxito o error.

Pero al hacer clic, una Edge Function podría encargarse de:

- validar que el usuario tenga permiso,
- confirmar que la solicitud sigue disponible,
- actualizar el estado,
- guardar quién aprobó,
- registrar la fecha,
- notificar un sistema externo si hace falta.

La parte visible está en frontend, pero la lógica importante puede vivir en una Edge Function.

---

## Cómo se ve esto en Landscapes

En Landscapes, las Edge Functions suelen aparecer cuando hace falta:

- ejecutar lógica del lado servidor,
- hacer integraciones,
- proteger procesos más sensibles,
- procesar acciones que van más allá de mostrar una pantalla,
- usar variables privadas o secrets,
- conectar varios pasos dentro de un mismo flujo.

Muchos prompts pueden implicar una Edge Function aunque no la nombren explícitamente.

Por ejemplo:

- “cuando se cree este registro, envía esta información a otro sistema”,
- “al aprobar esto, actualiza varios datos y registra el evento”,
- “valida esta condición antes de permitir la acción”,
- “procesa este flujo antes de guardar”.

Ese tipo de solicitud normalmente ya entra en terreno de Edge Functions o backend del lado servidor.

---

## Qué señales indican que probablemente hace falta una Edge Function

Estas son algunas señales comunes:

- hay lógica que no debería vivir en el navegador,
- hay que usar un secret o credencial privada,
- hay que integrar un servicio externo,
- hay que ejecutar varios pasos en cadena,
- hay que proteger una acción sensible,
- hay que validar algo del lado servidor,
- hay que transformar o procesar datos antes de devolverlos,
- hay que controlar mejor cómo se ejecuta una operación.

---

## Qué señales indican que probablemente no hace falta una Edge Function

No todos los cambios la necesitan.

Por ejemplo, probablemente no hace falta una Edge Function si el cambio es solo:

- visual,
- de textos,
- de layout,
- de navegación,
- de orden de componentes,
- de estados visuales simples,
- o de formularios que aún no requieren lógica especial.

En esos casos, podría ser un cambio de frontend o una consulta simple a datos existentes.

---

## Confusiones comunes

### “Edge Function es lo mismo que API”

No exactamente.

Una Edge Function puede formar parte de un flujo tipo API porque recibe una petición y devuelve una respuesta, pero el concepto no es exactamente el mismo.

La Edge Function es una pieza concreta de lógica del lado servidor.  
La API es la forma de comunicación entre partes del sistema.

Muchas veces se relacionan, pero no son sinónimos.

---

### “Si el botón existe, ya el flujo está listo”

No.

El botón solo inicia la acción.  
La lógica real puede depender de una Edge Function que procese y valide todo correctamente.

---

### “Todo lo puedo resolver desde frontend”

No siempre.

Hay cosas que pueden funcionar visualmente en frontend, pero que por seguridad, control o complejidad deberían ejecutarse del lado servidor.

---

### “Las Edge Functions solo sirven para cosas muy complejas”

No necesariamente.

A veces se usan para integraciones o flujos complejos, pero también pueden ser útiles para resolver lógica específica que simplemente no conviene exponer en el cliente.

---

## Qué puede fallar en una Edge Function

Cuando una Edge Function falla, los síntomas pueden verse como:

- una acción que no termina,
- datos que no se actualizan,
- integraciones que no se ejecutan,
- errores inesperados,
- respuestas incompletas,
- loaders que se quedan activos,
- mensajes de fallo al guardar o procesar.

Por eso, aunque no se vean directamente en pantalla, las Edge Functions suelen explicar muchos errores operativos.

---

## Cómo pensar un cambio relacionado con Edge Functions

Cuando vayas a pedir o revisar un cambio, ayuda hacerse estas preguntas:

- ¿Esta lógica debería vivir en frontend o del lado servidor?
- ¿La acción usa información sensible?
- ¿Hay que usar un secret?
- ¿Hay una integración externa involucrada?
- ¿Hay varios pasos que deben ejecutarse juntos?
- ¿Hace falta validar permisos o reglas importantes?
- ¿El flujo necesita más control que un cambio visual simple?

Estas preguntas ayudan a detectar mejor cuándo una Edge Function es parte del alcance real.

---

## Ejemplos de cambios típicos relacionados con Edge Functions

- enviar datos a un sistema externo,
- procesar una aprobación,
- ejecutar una lógica antes de guardar,
- validar permisos del lado servidor,
- transformar información,
- correr un flujo de sincronización,
- registrar eventos importantes,
- centralizar una operación sensible,
- usar secrets para integraciones,
- conectar varios pasos en una sola acción.

---

## Relación entre Edge Functions, frontend, backend y base de datos

Estos conceptos suelen trabajar juntos:

- El **frontend** muestra la acción al usuario.
- La **Edge Function** ejecuta lógica del lado servidor.
- El **backend** es la lógica general del sistema.
- La **API** es el canal por el que se comunica una parte con otra.
- La **base de datos** guarda la información.

Por eso, una Edge Function rara vez vive aislada.  
Normalmente forma parte de un flujo más grande.

---

## Ideas clave para recordar

- Una Edge Function es una función que corre del lado del servidor.
- Sirve para ejecutar lógica que no conviene dejar solo en frontend.
- Suele usarse para validaciones, integraciones, procesamiento y operaciones sensibles.
- Puede formar parte de un flujo tipo API, pero no es exactamente lo mismo que una API.
- Muchas acciones importantes del sistema dependen de Edge Functions aunque el usuario no las vea.
- En Landscapes, entender Edge Functions ayuda a detectar cuándo un cambio toca lógica sensible o integraciones y no es solo un cambio visual.