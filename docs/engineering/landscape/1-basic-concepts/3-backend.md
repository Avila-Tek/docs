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

A diferencia del frontend, el backend no es visible para el usuario. El usuario ve el resultado de lo que hace el backend, pero no interactúa directamente con él.

En pocas palabras, el backend es la parte que decide **qué puede pasar, cómo debe pasar y qué se puede guardar o devolver**.

---

## Por qué importa

Entender qué es backend ayuda a:

- Distinguir entre un problema visual y un problema de lógica
- Entender por qué algunas acciones requieren más que un cambio de pantalla
- Pedir cambios con más contexto
- Detectar mejor cuándo un flujo necesita validaciones, permisos o procesamiento adicional

En Landscapes esto importa mucho porque una gran parte del trabajo puede empezar en frontend, pero terminar dependiendo del backend para funcionar correctamente.

---

## Qué tipo de cosas suelen ser backend

Algunos ejemplos comunes:

### Reglas de negocio

Son decisiones que el sistema debe tomar.

Por ejemplo:

- Si un usuario puede o no hacer una acción
- Si una compra cumple ciertas condiciones
- Si una tarea puede cambiar de estado
- Cómo se calcula un monto o una comisión

### Validaciones del lado servidor

Son validaciones que no deberían depender solo de lo que se ve en pantalla.

Por ejemplo:

- Verificar permisos reales
- Revisar que un dato exista
- Evitar guardar información inválida
- Confirmar que una acción esté permitida

### Procesamiento de acciones

Cuando el sistema necesita ejecutar algo más que mostrar una pantalla.

Por ejemplo:

- Crear un registro
- Actualizar varios datos
- Disparar una integración
- Transformar información antes de guardarla
- Ejecutar un flujo interno

### Seguridad y permisos

El backend suele encargarse de validar cosas sensibles como:

- Qué usuario está haciendo la acción
- Qué rol tiene
- A qué datos puede acceder
- Eué operaciones tiene permitidas

### Integraciones

Cuando la aplicación necesita comunicarse con otros servicios.

Por ejemplo:

- Enviar información a un sistema externo
- Consultar un servicio de terceros
- Procesar una respuesta externa
- Sincronizar datos

---

## Qué cosas no son solo backend

Que algo tenga lógica no significa que viva completamente aislado.

Muchos flujos reales conectan varias partes:

- El frontend captura la acción
- El backend procesa la lógica
- La base de datos guarda la información
- Una API o edge function conecta el flujo
- Finalmente, el frontend muestra el resultado

Por eso, backend no debe verse como “algo separado”, sino como una parte central del funcionamiento de la aplicación.

---

## Ejemplo simple

Supongamos que un usuario quiere aprobar una solicitud.

En una pantalla puede existir:

- Un botón de “Aprobar”
- Un modal de confirmación
- Un mensaje de éxito o error

Eso es la parte visible.

Pero cuando el usuario aprieta el botón, el backend puede necesitar:

- Verificar si ese usuario tiene permiso
- Confirmar que la solicitud todavía esté pendiente
- Registrar quién la aprobó
- Actualizar el estado
- Guardar la fecha
- Notificar otro flujo o integración

Todo eso ya es backend.

---

## Cómo se ve esto en Landscapes

En Landscapes, cuando hablamos de backend normalmente hablamos de cosas como:

- Lógica que no vive solo en la pantalla
- Validaciones importantes
- Permisos
- Procesamiento de acciones
- Integraciones
- Flujos que pasan por APIs
- Y cuando usamos **Lovable**, de **Edge Functions** cuando hace falta lógica del lado servidor

Muchas veces un prompt puede sonar simple, por ejemplo:

- “Haz que al aprobar esto se actualicen otros datos”
- “Evita que un usuario haga esta acción si no cumple cierta condición”
- “Cuando se cree este registro, dispara este otro proceso”

Ese tipo de cambio ya no es solo frontend.  
Eso normalmente implica backend o lógica del lado del servidor.

---

## Qué señales indican que probablemente sí es backend

Estas son algunas señales comunes:

- Hay permisos que validar
- Hay datos que procesar antes de guardar
- Hay que integrar un servicio externo
- Hay que evitar acciones inválidas
- Hay que proteger una operación sensible
- Hay que ejecutar lógica que no debería depender del navegador

---

## Qué señales indican que probablemente no es solo backend

Estas señales suelen indicar que también hay otras capas involucradas:

- El usuario necesita una nueva vista
- Hay que agregar un nuevo campo a un formulario
- Hay que reorganizar una vista
- Hay que mostrar mensajes de error o estados de carga
- Hay que guardar nueva información en la base de datos
- Hay que modificar un formulario
- Hay que cambiar cómo se muestra el resultado

En esos casos, probablemente el cambio toca frontend, backend y quizás base de datos al mismo tiempo.

---

## Confusiones comunes

### “Backend es lo mismo que base de datos”

No, la base de datos guarda información.

El backend procesa lógica, reglas y acciones. Muchas veces trabajan juntos, pero no son lo mismo.

---

### “Si el formulario existe, ya el flujo está listo”

No necesariamente, la pantalla puede estar lista, pero todavía puede faltar:

- Validación de permisos
- Guardado de datos
- Manejo de errores
- Lógica del negocio

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

- Validar permisos antes de ejecutar una acción
- Impedir duplicados
- Calcular un valor automáticamente
- Cambiar estados según reglas del negocio
- Ejecutar lógica al crear o editar un registro
- Integrar un servicio externo
- Transformar datos antes de guardarlos
- Controlar qué información se devuelve
- Manejar un flujo de aprobación
- Proteger operaciones sensibles

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
