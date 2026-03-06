---
title: Frontend
sidebar_position: 2
slug: /basic-concepts/frontend
---

# Frontend

Esta guía explica qué es el **frontend**, por qué importa y cómo se ve este concepto en proyectos de Landscapes.

La idea no es aprender desarrollo frontend, sino entender qué tipo de cosas pertenecen a esta parte de una aplicación y qué tipo de cambios solemos hacer ahí cuando trabajamos con Lovable.

---

## Qué es

El frontend es la parte de la aplicación que el usuario **ve y usa**.

Es decir, todo lo que aparece en pantalla y con lo que una persona puede interactuar desde el navegador.

Por ejemplo:

- páginas,
- botones,
- formularios,
- tablas,
- menús,
- modales,
- mensajes de error,
- loaders,
- validaciones visuales.

Dicho simple:  
si el usuario lo ve o lo toca, probablemente estamos hablando de frontend.

---

## Por qué importa

Entender qué es frontend ayuda a:

- pedir cambios con más claridad,
- distinguir entre un problema visual y un problema de lógica,
- saber cuándo un cambio parece simple pero puede tocar otras capas,
- y evitar asumir que todo lo que se ve en pantalla se resuelve solo “cambiando la UI”.

En Landscapes esto importa mucho porque muchos cambios empiezan en algo visual, pero no siempre terminan ahí.

---

## Qué tipo de cosas suelen ser frontend

Algunos ejemplos comunes:

### Pantallas y navegación

- login,
- registro,
- dashboard,
- listados,
- detalle de registros,
- rutas entre páginas.

### Componentes visuales

- botones,
- cards,
- tablas,
- tabs,
- modales,
- inputs,
- selectores.

### Formularios

- campos de texto,
- selects,
- checkboxes,
- validaciones,
- mensajes de error,
- estados de carga.

### Estados visuales

- loaders,
- empty states,
- mensajes de éxito,
- mensajes de error,
- deshabilitar botones,
- feedback visual después de guardar algo.

### Experiencia de usuario

- orden de los elementos,
- claridad de los textos,
- facilidad para completar una acción,
- responsive,
- comportamiento en mobile.

---

## Qué cosas no son solo frontend

Aunque algo se vea en pantalla, eso no significa que sea únicamente frontend.

Por ejemplo, una pantalla puede necesitar:

- consultar datos,
- guardar información,
- validar permisos,
- ejecutar lógica,
- conectarse con una edge function,
- usar una API,
- leer o modificar datos de la base de datos.

Eso significa que muchas veces el frontend es solo la parte visible de un flujo más grande.

---

## Ejemplo simple

Supongamos que queremos agregar un formulario para crear una tarea.

En frontend podrían existir cosas como:

- el campo de título,
- el campo de descripción,
- el botón de guardar,
- el mensaje visual si falta un dato,
- el loader mientras se envía la información,
- el mensaje de éxito cuando termina.

Todo eso pertenece al frontend.

Pero si además necesitamos:

- guardar la tarea en base de datos,
- validar permisos,
- asignar la tarea a un usuario,
- ejecutar reglas del negocio,

entonces ya no estamos hablando solo de frontend.

---

## Cómo se ve esto en Landscapes

En Landscapes, cuando hablamos de frontend normalmente hablamos de:

- pantallas construidas o modificadas con Lovable,
- cambios en formularios,
- cambios en tablas o vistas,
- mejoras visuales,
- ajustes de flujo del usuario,
- cambios en navegación,
- validaciones visibles,
- mensajes y feedback en pantalla.

Muchos prompts van a pedir cambios que parecen frontend, por ejemplo:

- “agrega un campo al formulario”,
- “cambia el orden de las secciones”,
- “muestra un modal de confirmación”,
- “mejora esta tabla”,
- “agrega un estado vacío cuando no haya resultados”.

Eso sí es frontend.

Pero hay que recordar que algunos de esos cambios pueden requerir además cambios en backend, base de datos o APIs.

---

## Qué señales indican que probablemente sí es un cambio de frontend

Estas son algunas señales comunes:

- cambia el diseño o la estructura visual,
- cambia el texto visible al usuario,
- se agrega o modifica un botón,
- se reorganiza una pantalla,
- se agrega un campo a un formulario,
- cambia el comportamiento visual de una tabla o listado,
- mejora la experiencia de uso,
- cambia cómo se muestran errores o estados de carga.

---

## Qué señales indican que probablemente no es solo frontend

Estas señales suelen indicar que hay algo más:

- hay que guardar nueva información,
- hay que cambiar permisos,
- hay que aplicar reglas de negocio,
- hay que integrar un servicio externo,
- hay que modificar una edge function,
- hay que cambiar el schema de la base de datos,
- hay que procesar información antes de guardarla,
- hay que validar algo de forma segura del lado servidor.

---

## Confusiones comunes

### “Frontend es solo diseño”

No.

El frontend incluye lo visual, pero también incluye interacción, navegación, formularios, estados de carga, validaciones visibles y experiencia de usuario.

---

### “Si algo se ve en pantalla, el problema está en frontend”

No necesariamente.

A veces el frontend solo está mostrando que algo falló en otra parte, por ejemplo:

- una API,
- una edge function,
- permisos,
- base de datos,
- lógica del servidor.

---

### “Agregar un campo es un cambio pequeño”

A veces sí, pero no siempre.

Agregar un campo puede implicar:

- mostrarlo en frontend,
- validarlo,
- guardarlo,
- leerlo después,
- actualizar tablas,
- cambiar base de datos,
- tocar APIs o funciones.

---

### “Si la pantalla quedó bien, el cambio está completo”

No siempre.

Un flujo puede verse correcto en UI, pero fallar al:

- guardar,
- editar,
- filtrar,
- sincronizar,
- validar permisos,
- leer datos reales.

---

## Cómo pensar un cambio de frontend

Cuando vayas a pedir o revisar un cambio, ayuda hacerse estas preguntas:

- ¿Qué ve el usuario?
- ¿Qué acción debe poder hacer?
- ¿Qué debería pasar cuando hace clic?
- ¿Qué pasa si falta un dato?
- ¿Qué mensaje debería mostrarse si algo falla?
- ¿Esto solo cambia la pantalla o también cambia la lógica?
- ¿Este dato ya existe o también hay que guardarlo?

Estas preguntas ayudan a escribir mejores prompts y a detectar si el alcance real es mayor.

---

## Ejemplos de cambios típicos de frontend

- cambiar el texto de un botón,
- reorganizar una pantalla,
- agregar una columna a una tabla,
- mejorar un formulario,
- agregar un modal de confirmación,
- mostrar mejor los errores,
- agregar un estado vacío,
- hacer una vista más clara en mobile,
- cambiar el orden de secciones,
- mejorar la navegación entre pantallas.

---

## Ideas clave para recordar

- El frontend es la parte que el usuario ve y usa.
- No es solo diseño: también incluye interacción y experiencia de usuario.
- Muchos cambios visuales pueden requerir otras capas del sistema.
- Un problema visible en pantalla no siempre nace en frontend.
- Entender frontend ayuda a pedir cambios mejor y a detectar mejor el alcance real de una tarea.
- En Landscapes, gran parte del trabajo diario toca frontend, aunque muchas veces también involucra backend, base de datos o APIs.