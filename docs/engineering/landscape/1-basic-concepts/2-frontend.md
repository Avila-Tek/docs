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

El frontend es la parte de la aplicación que el usuario **ve y utiliza**.

Es decir, todo lo que aparece en pantalla y con lo que una persona puede interactuar desde el navegador.

Por ejemplo:

- Páginas
- Botones
- Formularios
- Tablas
- Menús
- Modales
- Mensajes de error
- Loaders
- Validaciones visuales

En palabras simples, si el usuario lo ve o lo toca, probablemente estamos hablando de frontend.

---

## Por qué importa

Entender qué es frontend ayuda a:

- Pedir cambios con más claridad
- Distinguir entre un problema visual y un problema de lógica
- Saber cuándo un cambio parece simple pero puede tocar otras capas
- Evitar asumir que todo lo que se ve en pantalla se resuelve solo “cambiando la UI”

En Landscapes esto importa mucho porque muchos cambios empiezan en algo visual, pero no siempre terminan ahí.

---

## Qué tipo de cosas suelen ser frontend

Algunos ejemplos comunes:

### Pantallas y navegación

- Login
- Registro
- Dashboard
- Listados
- Detalle de registros
- Navegación entre páginas

### Componentes visuales

- Botones
- Cards
- Tablas
- Tabs
- Modales
- Inputs
- Selectores

### Formularios

- Campos de texto
- Selects
- Checkboxes
- Validaciones
- Mensajes de error
- Estados de carga

### Estados visuales

- Loaders
- Empty states
- Mensajes de éxito
- Mensajes de error
- Deshabilitar botones
- Feedback visual después de guardar algo

### Experiencia de usuario

- Orden de los elementos
- Claridad de los textos
- Facilidad para completar una acción
- Responsive
- Comportamiento en mobile

---

## Qué cosas no son solo frontend

Aunque algo se vea en pantalla, eso no significa que sea únicamente frontend.

Por ejemplo, una pantalla puede necesitar:

- Consultar datos
- Guardar información
- Validar permisos
- Ejecutar lógica
- Conectarse con una edge function
- Usar una API
- Leer o modificar datos de la base de datos

Eso significa que muchas veces el frontend es solo la parte visible de un flujo más grande.

---

## Ejemplo simple

Supongamos que queremos agregar un formulario para crear una tarea.

En frontend podrían existir cosas como:

- El campo de título
- El campo de descripción
- El botón de guardar
- El mensaje visual si falta un dato
- El loader mientras se envía la información
- El mensaje de éxito cuando termina

Todo eso pertenece al frontend.

Pero si además necesitamos:

- Guardar la tarea en base de datos
- Validar permisos
- Asignar la tarea a un usuario
- Ejecutar reglas del negocio

Entonces en este caso ya no estamos hablando solo de frontend.

---

## Cómo se ve esto en Landscapes

En Landscapes, cuando hablamos de frontend normalmente hablamos de:

- Pantallas construidas o modificadas con Lovable
- Cambios en formularios
- Cambios en tablas o vistas
- Mejoras visuales
- Ajustes de flujo del usuario
- Cambios en navegación
- Validaciones visibles
- Mensajes y feedback en pantalla

---

## Qué señales indican que probablemente sí es un cambio de frontend

Estas son algunas señales comunes:

- Cambia el diseño o la estructura visual
- Cambia el texto visible al usuario
- Se agrega o modifica un botón
- Se reorganiza una pantalla
- Cambia el comportamiento visual de una tabla o listado
- Mejora la experiencia de uso
- Cambia cómo se muestran errores o estados de carga

---

## Qué señales indican que probablemente no es solo frontend

Estas señales suelen indicar que hay algo más:

- Hay que guardar nueva información
- Hay que cambiar permisos
- Hay que aplicar reglas de negocio
- Hay que integrar un servicio externo
- Hay que modificar una edge function
- Hay que cambiar el schema de la base de datos
- Hay que procesar información antes de guardarla
- Hay que validar algo de forma segura del lado servidor

---

## Confusiones comunes

### “Frontend es solo diseño”

El frontend incluye lo visual, pero también incluye interacción, navegación, formularios, estados de carga, validaciones visibles y experiencia de usuario.

---

### “Si algo se ve en pantalla, el problema está en frontend”

No necesariamente, a veces el frontend solo está mostrando que algo falló en otra parte, por ejemplo:

- Una API
- Una edge function
- Permisos
- Base de datos
- Lógica del servidor

---

### “Agregar un campo es un cambio pequeño”

A veces sí, pero no siempre, agregar un campo puede implicar:

- Mostrarlo en frontend
- Validarlo
- Guardarlo
- Leerlo después
- Actualizar tablas
- Cambiar base de datos
- Tocar APIs o funciones

---

### “Si la pantalla quedó bien, el cambio está completo”

No siempre, un flujo puede verse correcto en UI, pero fallar al:

- Guardar
- Editar
- Filtrar
- Sincronizar
- Validar permisos
- Leer datos reales

---

## Ejemplos de cambios típicos de frontend

- Cambiar el texto de un botón
- Reorganizar una pantalla
- Agregar una columna a una tabla
- Mejorar un formulario
- Agregar un modal de confirmación
- Mostrar mejor los errores
- Agregar un estado vacío
- Mejorar el responsive de una vista
- Cambiar el orden de secciones
- Mejorar la navegación entre pantallas

---

## Ideas clave para recordar

- El frontend es la parte que el usuario ve y utiliza.
- No es solo diseño: también incluye interacción y experiencia de usuario.
- Muchos cambios visuales pueden requerir otras capas del sistema.
- Un problema visible en pantalla no siempre nace en frontend.
- Entender frontend ayuda a pedir cambios mejor y a detectar mejor el alcance real de una tarea.
- En Landscapes, gran parte del trabajo diario toca frontend, aunque muchas veces también involucra backend, base de datos o APIs.
