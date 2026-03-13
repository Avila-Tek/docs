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

En pocas palabras, es una pieza de código que se usa cuando una acción no debería resolverse solo en frontend o cuando hace falta hacer algo de forma más segura y controlada.

Una Edge Function puede, por ejemplo:

- Procesar una acción,
- Validar información,
- Conectarse con servicios externos,
- Transformar datos,
- Ejecutar lógica del negocio,
- Responder a una petición del sistema.

---

## Cómo pensar una Edge Function de forma simple

Una forma fácil de verlo es esta:

- El usuario hace una acción
- El frontend dispara un flujo
- Una Edge Function recibe esa acción
- Ejecuta la lógica necesaria
- Devuelve un resultado

Es decir, la Edge Function funciona como una pieza que toma una solicitud, hace trabajo del lado servidor y responde.

---

## Cuándo suele usarse una Edge Function

Normalmente se usa cuando hace falta hacer algo que no conviene dejar solo en frontend.

Por ejemplo:

### Validaciones importantes

- Validar permisos
- Eevisar condiciones antes de ejecutar una acción
- Evitar operaciones inválidas
- Proteger lógica sensible

### Procesamiento de lógica

- Calcular valores
- Encadenar varios pasos
- Transformar datos antes de guardarlos
- Ejecutar flujos con varias decisiones

### Integraciones externas

- Llamar un servicio externo
- Enviar datos a otra plataforma
- Recibir una respuesta y procesarla
- Sincronizar información

### Operaciones sensibles

- Usar secrets
- Ejecutar lógica que no debería exponerse al navegador
- Controlar mejor qué se permite hacer y cómo

---

## Qué cosas no deberían resolverse solo en frontend

Hay casos donde el frontend puede mostrar la acción, pero no debería ser quien resuelva todo.

Por ejemplo:

- Validar permisos reales
- Usar credenciales privadas
- Enviar datos a servicios externos
- Ejecutar lógica importante del negocio
- Hacer procesos que no deberían depender del navegador del usuario

En esos casos, una Edge Function suele ser una mejor opción.

---

## Ejemplo simple

Supongamos que un usuario presiona un botón para aprobar una solicitud.

En frontend puede existir:

- El botón
- El modal de confirmación
- El mensaje de éxito o error

Pero al hacer clic, una Edge Function podría encargarse de:

- Validar que el usuario tenga permiso,
- Confirmar que la solicitud sigue disponible,
- Actualizar el estado,
- Guardar quién aprobó,
- Registrar la fecha,
- Notificar un sistema externo si hace falta.

La parte visible está en frontend, pero la lógica importante puede vivir en una Edge Function.

---

## Qué señales indican que probablemente hace falta una Edge Function

Estas son algunas señales comunes:

- Hay lógica que no debería vivir en el navegador
- Hay que usar un secret o credencial privada
- Hay que integrar un servicio externo
- Hay que ejecutar varios pasos en cadena
- Hay que proteger una acción sensible
- Hay que validar algo del lado servidor
- Hay que transformar o procesar datos antes de devolverlos
- Hay que controlar mejor cómo se ejecuta una operación

---

## Qué señales indican que probablemente no hace falta una Edge Function

No todos los cambios la necesitan. Por ejemplo, probablemente no hace falta una Edge Function si el cambio es solo:

- Visual
- Textos
- Layout
- Navegación
- Orden de componentes
- Estados visuales simples

En esos casos, podría ser un cambio de frontend o una consulta simple a datos existentes.

---

## Confusiones comunes

### “Edge Function es lo mismo que API”

No exactamente, una Edge Function puede formar parte de un flujo tipo API porque recibe una petición y devuelve una respuesta, pero el concepto no es exactamente el mismo.

La Edge Function es una pieza concreta de lógica del lado servidor, mientras que la API es la forma de comunicación entre partes del sistema.

Muchas veces se relacionan, pero no son sinónimos.

---

### “Las Edge Functions solo sirven para cosas muy complejas”

No necesariamente, a veces se usan para integraciones o flujos complejos, pero también pueden ser útiles para resolver lógica específica que simplemente no conviene exponer en el cliente.

---

## Qué puede fallar en una Edge Function

Cuando una Edge Function falla, los síntomas pueden verse como:

- Una acción que no termina
- Datos que no se actualizan
- Integraciones que no se ejecutan
- Errores inesperados
- Respuestas incompletas
- Loaders que se quedan activos
- Mensajes de fallo al guardar o procesar

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

- Enviar datos a un sistema externo
- Procesar una aprobación
- Ejecutar una lógica antes de guardar
- Validar permisos del lado servidor
- Transformar información
- Correr un flujo de sincronización
- Registrar eventos importantes
- Centralizar una operación sensible
- Usar secrets para integraciones
- Conectar varios pasos en una sola acción

---

## Relación entre Edge Functions, frontend, backend y base de datos

Estos conceptos suelen trabajar juntos:

- El **frontend** muestra la acción al usuario.
- La **Edge Function** ejecuta lógica del lado servidor.
- El **backend** es la lógica general del sistema.
- La **API** es el canal por el que se comunica una parte con otra.
- La **base de datos** guarda la información.

Por eso, una Edge Function rara vez vive aislada, normalmente forma parte de un flujo más grande.

---

## Ideas clave para recordar

- Una Edge Function es una función que corre del lado del servidor.
- Sirve para ejecutar lógica que no conviene dejar solo en frontend.
- Suele usarse para validaciones, integraciones, procesamiento y operaciones sensibles.
- Puede formar parte de un flujo tipo API, pero no es exactamente lo mismo que una API.
- Muchas acciones importantes del sistema dependen de Edge Functions aunque el usuario no las vea.
