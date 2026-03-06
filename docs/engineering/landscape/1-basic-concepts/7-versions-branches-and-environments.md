---
title: Versiones, ramas y entornos
sidebar_position: 7
slug: /basic-concepts/versions-branches-and-environments
---

# Versiones, ramas y entornos

Esta guía explica qué significan las **versiones**, las **ramas** y los **entornos**, por qué importan y cómo se ven estos conceptos en proyectos de Landscapes.

La idea no es aprender Git en profundidad, sino entender cómo se organiza el trabajo para poder hacer cambios con más claridad, menos riesgo y mejor control.

---

## Por qué importa

En Landscapes trabajamos en proyectos que cambian rápido y muchas veces son modificados por personas no técnicas a través de Lovable.

Por eso, no basta con pensar en “hacer el cambio”. También hace falta entender:

- sobre qué versión se está trabajando,
- dónde se está probando,
- qué diferencia hay entre un entorno de prueba y uno real,
- y por qué no conviene mezclar cambios sin control.

Entender esto ayuda a reducir errores, evitar confusiones y proteger mejor producción.

---

## Qué es una versión

Una versión es simplemente un **estado del proyecto en un momento determinado**.

Dicho simple:  
cada vez que el proyecto cambia, existe una nueva versión de cómo está construido en ese momento.

Por ejemplo:

- una versión puede tener un formulario sin validaciones,
- otra versión puede agregar un nuevo campo,
- otra puede corregir un bug,
- otra puede incluir una refactorización más grande.

Pensarlo como “versiones” ayuda a entender que un proyecto no es algo fijo: va evolucionando con cada cambio.

---

## Qué es una rama

Una rama es una forma de separar líneas de trabajo dentro de un mismo proyecto.

Dicho simple:  
permite trabajar cambios sin afectar inmediatamente la versión que se considera estable.

En desarrollo tradicional, esto suele estar muy asociado a Git.  
En Landscapes no hace falta entrar en ese nivel técnico, pero sí entender la idea general:

- hay una versión más estable,
- puede haber una versión donde se están haciendo cambios,
- y luego esos cambios se llevan a la versión estable cuando ya están listos.

---

## Cómo pensar una rama de forma simple

Una forma fácil de verlo es esta:

- existe una versión base del proyecto,
- alguien trabaja cambios nuevos aparte,
- prueba esos cambios,
- y luego decide cuándo pasarlos a la versión más estable.

La idea principal es evitar que cualquier cambio en proceso afecte directamente lo que ya debería funcionar bien.

---

## Qué es un entorno

Un entorno es una **instancia separada del proyecto**.

En Landscapes, los entornos más importantes son:

- **Test**
- **Prod**

Cada entorno representa un espacio distinto para usar o probar la aplicación.

---

## Test

**Test** es el entorno donde se prueban cambios antes de llevarlos a producción.

Sirve para:

- construir funcionalidades,
- validar flujos,
- revisar si algo funciona,
- detectar errores,
- probar cambios con más seguridad.

Dicho simple:  
Test es el lugar para experimentar, validar y corregir antes de publicar.

---

## Prod

**Prod** es el entorno real de producción.

Es donde vive la versión que realmente se considera publicada o activa.

Los cambios que se hacen aquí tienen más impacto, porque pueden afectar directamente la operación real del proyecto.

Dicho simple:  
Prod no es para probar ideas. Es donde debería vivir lo que ya está listo para usarse.

---

## Diferencia entre ramas y entornos

Estos conceptos se relacionan, pero no son exactamente lo mismo.

### Ramas

Hablan más de cómo se organiza el trabajo y las versiones del código.

### Entornos

Hablan más de dónde está corriendo una versión del proyecto.

Dicho simple:

- una **rama** organiza el trabajo,
- un **entorno** es el lugar donde ese trabajo existe o se prueba.

No hace falta dominar el detalle técnico para entender la idea general:  
hay una separación entre “trabajo en progreso” y “versión publicada”.

---

## Cómo se ve esto en Landscapes

En Landscapes, este tema es especialmente importante porque:

- se trabaja con Lovable,
- los cambios pueden tocar frontend, backend, base de datos y edge functions,
- y un cambio aparentemente pequeño puede tener impacto real.

Por eso, la lógica general que buscamos seguir es:

- trabajar primero en **Test**,
- validar los cambios ahí,
- y pasar a **Prod** solo cuando el cambio esté listo.

Esto ayuda a evitar que producción se convierta en el lugar donde se prueba por primera vez algo.

---

## Por qué no conviene trabajar directo en Prod

Trabajar directo en Prod aumenta mucho el riesgo de:

- romper flujos reales,
- afectar usuarios o datos reales,
- mezclar cambios sin validar,
- hacer más difícil detectar de dónde vino un problema,
- publicar algo incompleto,
- ejecutar cambios sensibles sin suficiente control.

En proyectos rápidos, esto puede pasar fácilmente si no existe una disciplina mínima de entornos.

Por eso, aunque operativamente exista mucha autonomía, igual conviene sostener la regla de que **Prod no debe ser el lugar principal de trabajo**.

---

## Ejemplo simple

Supongamos que queremos agregar un nuevo campo en un formulario y además guardarlo.

Un flujo más sano sería:

1. hacer el cambio en **Test**,
2. validar que el campo se vea bien,
3. confirmar que guarda correctamente,
4. revisar que no rompa otras partes del flujo,
5. y solo después llevarlo a **Prod**.

Un flujo más riesgoso sería:

1. hacer el cambio directo en **Prod**,
2. descubrir ahí mismo que faltaba guardar el dato,
3. corregir sobre la marcha,
4. y terminar mezclando pruebas con operación real.

---

## Qué señales indican que hay que tener más cuidado

Estas señales suelen indicar que no basta con “probar rápido”:

- el cambio toca base de datos,
- el cambio toca edge functions,
- el cambio afecta permisos,
- el cambio impacta integraciones,
- el cambio modifica un flujo crítico,
- el cambio puede ser no reversible,
- el cambio altera algo que ya se usa en producción.

En esos casos, entender bien versiones, ramas y entornos es todavía más importante.

---

## Confusiones comunes

### “Test y Prod son casi lo mismo”

No.

Aunque puedan parecerse, cumplen funciones distintas.

- **Test** es para probar y validar.
- **Prod** es para operar con la versión publicada.

---

### “Si el cambio es pequeño, da igual dónde hacerlo”

No siempre.

Hay cambios pequeños en apariencia que pueden tener impacto grande, especialmente si tocan datos, lógica o integraciones.

---

### “Si funciona visualmente, ya se puede pasar a Prod”

No necesariamente.

También hace falta revisar:

- si guarda bien,
- si no rompió otros flujos,
- si los permisos siguen correctos,
- si la lógica funciona,
- si no hay efectos secundarios.

---

### “Ramas es solo un concepto técnico de developers”

No solo eso.

Aunque el detalle técnico sea más de ingeniería, la idea de separar trabajo en progreso de una versión estable sí es muy relevante para cualquier persona que haga cambios en un proyecto.

---

## Cómo pensar un cambio usando estos conceptos

Cuando vayas a hacer o revisar un cambio, ayuda hacerse estas preguntas:

- ¿Estoy trabajando sobre una versión de prueba o sobre la versión real?
- ¿Este cambio ya fue validado?
- ¿Qué pasa si esto rompe algo?
- ¿Este cambio toca algo sensible?
- ¿Estoy mezclando varias cosas al mismo tiempo?
- ¿Este cambio está listo para pasar a producción o todavía está en trabajo?

Estas preguntas ayudan a tomar decisiones con más criterio, incluso sin un contexto técnico profundo.

---

## Relación con cambios sensibles

Este tema se vuelve todavía más importante cuando el cambio es sensible o no reversible.

Por ejemplo:

- eliminar columnas,
- cambiar estructura de base de datos,
- modificar lógica crítica,
- tocar integraciones importantes,
- ejecutar cambios que no tienen rollback simple.

En esos casos, trabajar con cuidado entre Test y Prod no es opcional: es una parte importante del control de riesgo.

---

## Ideas clave para recordar

- Una versión es un estado del proyecto en un momento dado.
- Una rama es una forma de separar trabajo en progreso de una versión más estable.
- Un entorno es una instancia separada del proyecto, como Test o Prod.
- Test se usa para probar y validar.
- Prod es el entorno real y requiere más cuidado.
- En Landscapes, conviene trabajar primero en Test y evitar usar Prod como espacio principal de experimentación.
- Entender estos conceptos ayuda a reducir errores y a tomar mejores decisiones al momento de hacer cambios.