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

Dicho simple:  
son datos que el proyecto necesita conocer, pero que no forman parte directa de la lógica o de la interfaz.

Por ejemplo:

- URLs,
- keys públicas,
- nombres de entornos,
- identificadores de servicios,
- configuraciones de conexión,
- secrets o credenciales privadas.

La aplicación lee esos valores y los usa para saber cómo conectarse, a dónde apuntar o qué comportamiento seguir.

---

## Por qué importan

Entender qué son las variables de entorno ayuda a:

- saber de dónde salen ciertas configuraciones del proyecto,
- distinguir entre datos públicos y datos sensibles,
- entender por qué una integración puede fallar aunque la app se vea bien,
- y reducir errores al trabajar con frontend, edge functions o servicios externos.

En Landscapes esto importa mucho porque gran parte de los proyectos necesita conectarse con Supabase, APIs externas u otros servicios, y esas conexiones suelen depender de variables de entorno.

---

## Cómo pensar una variable de entorno de forma simple

Una forma fácil de verlo es esta:

la aplicación necesita ciertos valores para funcionar, pero esos valores no siempre deberían estar escritos directamente dentro del código.

Entonces se guardan aparte como configuración.

Dicho simple:  
en vez de poner un valor fijo dentro de la app, se define como variable para que el proyecto lo pueda leer cuando lo necesite.

---

## Ejemplo simple

Supongamos que una aplicación necesita conectarse a Supabase.

Para eso puede necesitar cosas como:

- la URL del proyecto,
- una key pública para el frontend,
- un secret para una edge function.

La app usa esas variables para conectarse correctamente.

Si una de esas variables está mal configurada, el resultado puede ser que:

- no carguen datos,
- fallen los guardados,
- una integración no funcione,
- o una edge function dé error.

---

## Qué tipo de información suele vivir en variables de entorno

Algunos ejemplos comunes:

### Configuración pública

Son valores que la app necesita usar y que pueden estar visibles en frontend.

Por ejemplo:

- URL pública de un servicio,
- identificadores públicos,
- keys públicas de cliente,
- flags de configuración no sensibles.

### Configuración sensible

Son valores que no deberían exponerse al navegador ni al usuario.

Por ejemplo:

- tokens privados,
- secrets,
- credenciales de integraciones,
- claves de acceso con permisos altos.

### Configuración por entorno

Son valores que cambian según dónde esté corriendo el proyecto.

Por ejemplo:

- una URL para Test,
- otra URL para Prod,
- un servicio de prueba,
- una credencial distinta por entorno.

---

## Públicas vs privadas

Esta es una de las distinciones más importantes.

### Variables públicas

Son variables que pueden usarse desde el frontend.

Como el frontend corre en el navegador del usuario, hay que asumir que lo que viva ahí puede quedar expuesto.

Por eso, solo deberían usarse ahí valores que realmente puedan ser públicos.

---

### Variables privadas

Son variables que deberían usarse solo del lado servidor.

Por ejemplo:

- en backend,
- en edge functions,
- en integraciones seguras.

Estas variables no deberían exponerse en el navegador porque pueden dar acceso sensible a servicios o datos.

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

- credenciales,
- tokens privados,
- secrets,
- o lógica más protegida,

normalmente conviene que eso viva del lado servidor y no en frontend.

---

## Qué puede pasar si una variable de entorno está mal

Cuando una variable está mal configurada, los síntomas pueden verse como:

- la app no conecta con un servicio,
- una pantalla no carga datos,
- un formulario no guarda,
- una edge function falla,
- una integración externa no responde,
- el proyecto apunta al entorno equivocado,
- aparece un error aunque la UI parezca correcta.

Por eso, aunque estas variables no se vean directamente, muchas veces explican errores importantes.

---

## Confusiones comunes

### “Si funciona en pantalla, la configuración está bien”

No siempre.

La UI puede cargar, pero ciertas acciones pueden fallar si una variable de entorno está mal o incompleta.

---

### “Todas las variables son iguales”

No.

Algunas pueden ser públicas y otras privadas.

No todas deberían tratarse de la misma forma.

---

### “Si una variable existe, ya está todo listo”

No necesariamente.

También importa:

- si tiene el valor correcto,
- si está en el entorno correcto,
- si corresponde a Test o Prod,
- si está siendo usada en el lugar adecuado.

---

### “Puedo usar cualquier secret desde frontend”

No.

Frontend no es el lugar para información sensible.

Si una variable expone acceso importante, debería manejarse del lado servidor.

---

## Relación con Test y Prod

Este tema también se conecta con los entornos.

Muchas veces un proyecto necesita valores distintos para:

- **Test**
- **Prod**

Por ejemplo:

- URLs distintas,
- credenciales distintas,
- servicios distintos,
- configuraciones separadas.

Eso ayuda a que el entorno de prueba no mezcle datos o accesos con producción.

---

## Relación con Lovable

En Landscapes, muchas configuraciones pasan por Lovable, pero la lógica sigue siendo la misma:

- el proyecto necesita ciertos valores para funcionar,
- algunos pueden ser públicos,
- otros no,
- y usar el valor incorrecto o exponer algo sensible puede causar problemas.

Por eso no basta con “poner la variable”.  
También hace falta entender qué tipo de dato es y dónde debería vivir.

---

## Qué señales indican que probablemente hay variables de entorno involucradas

Estas son algunas señales comunes:

- el proyecto necesita conectarse con Supabase,
- hay una integración externa,
- una edge function usa credenciales,
- el comportamiento cambia entre Test y Prod,
- la app necesita una URL o identificador configurable,
- algo funciona en un entorno pero no en otro.

---

## Cómo pensar un cambio relacionado con variables de entorno

Cuando vayas a pedir o revisar un cambio, ayuda hacerse estas preguntas:

- ¿Este valor puede ser público o es sensible?
- ¿Debe vivir en frontend o del lado servidor?
- ¿Este valor cambia entre Test y Prod?
- ¿La app depende de esta configuración para conectarse a algo?
- ¿Hay riesgo de exponer un secret?
- ¿Estoy usando la variable correcta en el entorno correcto?

Estas preguntas ayudan a reducir errores y a tomar mejores decisiones.

---

## Ejemplos de uso común

- conectar el frontend con Supabase usando valores públicos,
- guardar credenciales privadas para integraciones en edge functions,
- configurar URLs distintas según el entorno,
- definir identificadores de servicios externos,
- separar configuración de Test y Prod,
- controlar conexiones sin escribir valores fijos en el código.

---

## Ideas clave para recordar

- Las variables de entorno son valores de configuración que la aplicación necesita para funcionar.
- No todas son iguales: algunas pueden ser públicas y otras deben ser privadas.
- Frontend no es un lugar seguro para secrets.
- Las edge functions suelen ser un mejor lugar para variables sensibles.
- Un error de configuración puede romper flujos aunque la pantalla se vea bien.
- En Landscapes, entender variables de entorno ayuda a conectar servicios correctamente y a evitar exposiciones o configuraciones peligrosas.