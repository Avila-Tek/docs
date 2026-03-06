---
title: Cómo se compone una aplicación web
sidebar_position: 1
slug: /basic-concepts/how-web-apps-work
---

# Cómo se compone una aplicación web

Esta guía explica, de forma simple, **cómo se compone una aplicación web** y cómo se conectan sus partes.

La idea no es aprender a programar, sino tener un **mapa mental básico** para entender mejor qué estamos cambiando cuando trabajamos con Lovable, dónde puede estar un problema y qué impacto puede tener una decisión.

---

## Idea rápida

Una aplicación web normalmente tiene estas piezas:

- **Frontend:** lo que ve y usa el usuario.
- **Backend:** la lógica que procesa reglas y acciones.
- **Base de datos:** donde se guarda la información.
- **API:** la forma en que unas partes se comunican con otras.

Dicho simple:  
el usuario interactúa con una pantalla, esa pantalla puede pedir o enviar información, el sistema la procesa y luego la guarda o la devuelve.

---

## Glosario

- **Aplicación web:** Software que se usa desde el navegador.
- **Frontend:** Parte visual e interactiva de la aplicación.
- **Backend:** Parte que procesa lógica, validaciones y operaciones internas.
- **Base de datos:** Lugar donde se almacena la información.
- **API:** Medio por el que una parte del sistema le pide algo a otra.
- **Edge Function:** Función del backend que corre del lado del servidor para ejecutar lógica específica.
- **Entorno:** Versión separada del proyecto, por ejemplo **Test** o **Prod**.

---

## Las piezas principales

### Frontend

Es la parte que el usuario ve y toca:

- pantallas,
- botones,
- formularios,
- tablas,
- mensajes,
- validaciones visuales.

Ejemplos:

- una pantalla de login,
- un formulario para crear un registro,
- una tabla con una lista de pedidos.

---

### Backend

Es la parte que resuelve lógica del sistema.

Por ejemplo:

- validar si un usuario tiene permiso,
- calcular un monto,
- decidir qué datos se pueden modificar,
- procesar una acción más compleja,
- conectarse con otros servicios.

El usuario normalmente **no ve** el backend, pero muchas acciones importantes dependen de él.

---

### Base de datos

Es donde vive la información del sistema.

Por ejemplo:

- usuarios,
- pedidos,
- tareas,
- pagos,
- configuraciones.

La base de datos no es “la pantalla”; es el lugar donde se guardan los datos que luego aparecen en la pantalla.

---

### API

Una API es el **puente de comunicación** entre partes del sistema.

Por ejemplo:

- el frontend le pide al backend la lista de pedidos,
- una edge function guarda información en la base de datos,
- el sistema consulta un servicio externo.

No hace falta pensarla como algo complicado.  
En la práctica, una API es simplemente una forma ordenada de **pedir datos o ejecutar acciones**.

---

## Cómo se conectan estas piezas

Una forma simple de verlo es así:

```mermaid
flowchart LR
    U[Usuario] --> F[Frontend]
    F --> A[API / Backend]
    A --> D[Base de datos]
    A --> S[Servicios externos]
```

Ejemplo:

1. El usuario llena un formulario.
2. El frontend envía esa información.
3. El backend o una edge function valida la acción.
4. Si todo está bien, se guarda en la base de datos.
5. El sistema responde.
6. El frontend muestra el resultado al usuario.

---

## Ejemplo simple

Supongamos que un usuario crea una tarea en una app.

### Lo que ve el usuario

Ve un formulario con campos como:

- título,
- descripción,
- fecha.

Eso es **frontend**.

### Lo que pasa al guardar

Cuando presiona “Guardar”, el sistema puede:

- validar que el título no esté vacío,
- revisar si el usuario tiene permiso,
- asignar datos automáticos,
- guardar la tarea.

Eso ya involucra **backend** y **base de datos**.

### Cómo viaja la información

Ese envío normalmente ocurre a través de una **API**.

---

## Cómo se ve esto en Landscapes

En Landscapes, este mapa suele verse así:

- **Lovable** nos ayuda a construir y modificar la aplicación.
- El **frontend** es la parte visual del proyecto.
- **Supabase** nos ayuda con base de datos y otros servicios.
- Las **Edge Functions** se usan cuando hace falta lógica de servidor.
- Los cambios se prueban en **Test** antes de pasar a **Prod**.

Entonces, aunque alguien no programe de forma tradicional, igual puede terminar tocando partes distintas del sistema:

- una pantalla,
- una tabla de base de datos,
- una edge function,
- una integración,
- o un flujo completo.

Por eso es importante entender este mapa general.

---

## Qué cosas suelen confundirse

### “Si cambia la pantalla, solo cambió el frontend”

No siempre.

A veces un cambio visual también requiere:

- guardar nuevos datos,
- cambiar reglas,
- modificar permisos,
- actualizar una edge function,
- cambiar la base de datos.

---

### “La base de datos es lo mismo que la app”

No.

La app es la experiencia que usa el usuario.  
La base de datos es donde se guarda la información que esa app usa.

---

### “La API es otra cosa aparte que no me afecta”

Sí afecta.

Aunque no la veas, muchas veces los errores de:

- carga,
- guardado,
- sincronización,
- permisos,
- integraciones

pasan por una API o por lógica de backend.

---

### “Todo se resuelve solo con frontend”

No.

Hay cosas que sí son solo de interfaz, pero otras necesitan lógica del lado servidor o cambios en la base de datos.

---

## Cómo pensar un problema usando este mapa

Cuando algo falla, ayuda hacerse estas preguntas:

- ¿El problema está en lo que se ve en pantalla?
- ¿El dato no se está guardando?
- ¿La acción depende de permisos o validaciones?
- ¿La información existe en la base de datos pero no aparece?
- ¿La app está fallando al comunicarse con otra parte del sistema?

No hace falta saber programar para pensar así.  
Solo necesitas ubicar **en qué parte del flujo podría estar el problema**.

---

## Ideas clave para recordar

- Una aplicación web no es solo una pantalla.
- El frontend muestra y captura acciones del usuario.
- El backend procesa lógica y reglas.
- La base de datos guarda información.
- La API conecta unas partes con otras.
- Un mismo cambio puede tocar varias capas al mismo tiempo.
- En Landscapes, entender este mapa ayuda a usar mejor Lovable y a reducir errores.