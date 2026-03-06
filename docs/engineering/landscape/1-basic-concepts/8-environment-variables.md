---
title: Variables de entorno
sidebar_position: 8
slug: /basic-concepts/environment-variables
---

# Variables de entorno

Esta guía explica qué son las **variables de entorno**, por qué importan y cómo se ve este concepto en proyectos de Landscapes.

La idea no es aprender configuración avanzada, sino entender para qué sirven, qué tipo de información suelen guardar y por qué hay que tener cuidado con lo que se expone y con lo que no.

---

## Qué son

Las variables de entorno son valores de configuración que una aplicación usa para funcionar.

En pocas palabras, son datos que el proyecto necesita conocer, pero que no forman parte directa de la lógica o de la interfaz.

Por ejemplo:

- URLs
- Keys públicas
- Nombres de entornos
- Identificadores de servicios
- Configuraciones de conexión
- Credenciales privadas

La aplicación lee esos valores y los usa para saber cómo conectarse, a dónde apuntar o qué comportamiento seguir.

---

## Cómo pensar una variable de entorno de forma simple

Una forma fácil de verlo es esta:

La aplicación necesita ciertos valores para funcionar, pero esos valores no siempre deberían estar escritos directamente dentro del código.

Entonces se guardan aparte como configuración, en vez de poner un valor fijo dentro de la app, se define como variable para que el proyecto lo pueda leer cuando lo necesite.

---

## Ejemplo simple

Supongamos que una aplicación necesita conectarse a Supabase.

Para eso puede necesitar cosas como:

- La URL del proyecto,
- Una key pública para el frontend,
- Un secret para una edge function.

La app usa esas variables para conectarse correctamente.

Si una de esas variables está mal configurada, el resultado puede ser que:

- No carguen datos
- Fallen los guardados
- Una integración no funcione
- Una edge function dé error

---

## Qué tipo de información suele vivir en variables de entorno

Algunos ejemplos comunes:

### Configuración pública

Son valores que la app necesita usar y que pueden estar visibles en frontend.

Por ejemplo:

- URL pública de un servicio
- Identificadores públicos
- Keys públicas de cliente
- Flags de configuración no sensibles

### Configuración sensible

Son valores que no deberían exponerse al navegador ni al usuario.

Por ejemplo:

- Tokens privados
- Secrets
- Credenciales de integraciones
- Claves de acceso con permisos altos

### Configuración por entorno

Estos valores pueden cambiar según el entorno donde está corriendo el proyecto.

Por ejemplo:

- Servicios que usan una URL para **Test** y otra para **Producción**
- Credencial distinta por entorno

---

## Cómo se ve esto en Landscapes

En Landscapes, este tema aparece mucho en dos lugares:

### Frontend

El frontend puede necesitar variables públicas para funcionar, por ejemplo para conectarse a ciertos servicios.

Pero como esa parte corre del lado del usuario, hay que asumir que no es un lugar seguro para poner secretos.

---

### Edge Functions

Las edge functions sí suelen ser un lugar más adecuado para usar variables sensibles, porque corren del lado servidor.

Por eso, cuando una integración requiere:

- Credenciales
- Tokens privados
- Secrets

Debe vivir del lado servidor y no en frontend.

---

## Qué puede pasar si una variable de entorno está mal

Cuando una variable está mal configurada, los síntomas pueden verse como:

- La app no conecta con un servicio
- Una pantalla no carga datos
- Un formulario no guarda
- Una edge function falla
- Una integración externa no responde
- El proyecto apunta al entorno equivocado y muestra datos de otro ambiente
- Aparece un error aunque la UI parezca correcta

Por eso, aunque estas variables no se vean directamente, muchas veces explican errores importantes.

---

## Confusiones comunes

### “Puedo usar cualquier secret desde frontend”

NO, Frontend no es el lugar para información sensible.

Si una variable expone acceso importante, debería manejarse del lado servidor.

---

## Relación con Test y Producción

Este tema también se conecta con los entornos.

Muchas veces un proyecto necesita valores distintos para:

- **Test**
- **Producción**

Por ejemplo:

- URLs distintas,
- Credenciales distintas,
- Servicios distintos,
- Configuraciones separadas.

Eso ayuda a que el entorno de prueba no mezcle datos o accesos con producción.

---

## Qué señales indican que probablemente hay variables de entorno involucradas

Estas son algunas señales comunes:

- El proyecto necesita conectarse con Supabase
- Hay una integración externa
- Una edge function usa credenciales
- El comportamiento cambia entre Test y Producción
- La app necesita una URL o identificador configurable
- Algo funciona en un entorno pero no en otro

---

## Cómo pensar un cambio relacionado con variables de entorno

Cuando vayas a pedir o revisar un cambio, ayuda hacerse estas preguntas:

- ¿Este valor puede ser público o es sensible?
- ¿Debe vivir en frontend o del lado servidor?
- ¿Este valor cambia entre Test y Producción?
- ¿La app depende de esta configuración para conectarse a algo?
- ¿Hay riesgo de exponer un secret?
- ¿Estoy usando la variable correcta en el entorno correcto?

Estas preguntas ayudan a reducir errores y a tomar mejores decisiones.

---

## Ideas clave para recordar

- Las variables de entorno son valores de configuración que la aplicación necesita para funcionar.
- No todas son iguales: algunas pueden ser públicas y otras deben ser privadas.
- Frontend no es un lugar seguro para secrets.
- Las edge functions suelen ser un mejor lugar para variables sensibles.
- Un error de configuración puede romper flujos aunque la pantalla se vea bien.
