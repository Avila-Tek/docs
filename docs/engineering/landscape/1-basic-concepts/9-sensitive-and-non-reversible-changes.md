---
title: Cambios sensibles y no reversibles
sidebar_position: 9
slug: /basic-concepts/sensitive-and-non-reversible-changes
---

# Cambios sensibles y no reversibles

Esta guía explica qué son los **cambios sensibles** y los **cambios no reversibles**, por qué importan y cómo se ven estos conceptos en proyectos de Landscapes.

La idea no es volver el trabajo más lento, sino entender qué tipo de cambios requieren más cuidado porque pueden tener impacto real en el sistema, en los datos o en producción.

---

## Por qué importa

En Landscapes trabajamos con mucha autonomía y velocidad.

Eso significa que muchas personas pueden hacer cambios relevantes en:

- frontend,
- backend,
- base de datos,
- edge functions,
- integraciones,
- configuración del proyecto.

En este contexto, no todos los cambios tienen el mismo nivel de riesgo.

Hay cambios que son fáciles de ajustar o deshacer.  
Y hay otros que, una vez ejecutados, pueden:

- romper flujos,
- afectar datos existentes,
- cambiar el comportamiento de producción,
- o ser difíciles de revertir.

Por eso es importante entender cuándo un cambio entra en una zona más delicada.

---

## Qué es un cambio sensible

Un cambio sensible es un cambio que requiere **más cuidado del normal** porque su impacto potencial es alto.

No significa necesariamente que esté prohibido.  
Significa que no debería ejecutarse sin pensar bien:

- qué toca,
- qué puede romper,
- qué dependencias tiene,
- y qué pasa si sale mal.

Dicho simple:  
un cambio sensible es un cambio donde un error puede costar más.

---

## Qué es un cambio no reversible

Un cambio no reversible es un cambio que **no se puede deshacer fácilmente** o que no tiene una vuelta atrás simple.

En algunos casos sí se puede corregir después, pero no de forma limpia, inmediata o segura.

Por ejemplo:

- si se borra información,
- si se elimina una columna,
- si se cambia una estructura y otras partes empiezan a depender de eso,
- si se publica una lógica nueva que altera datos reales,
- si una integración envía información incorrecta a otro sistema.

Dicho simple:  
un cambio no reversible es uno donde “deshacerlo” no es tan fácil como volver al estado anterior.

---

## Relación entre ambos conceptos

No todo cambio sensible es no reversible.  
Y no todo cambio no reversible se ve peligroso a primera vista.

Pero en la práctica, en Landscapes, los cambios **no reversibles** suelen ser una de las formas más claras de identificar que estamos frente a un cambio **sensible**.

Por eso, cuando un cambio no tiene rollback simple, debería tratarse con más cuidado.

---

## Ejemplos de cambios menos sensibles

Estos cambios suelen tener menos riesgo si están bien acotados:

- cambiar un texto visible,
- ajustar el orden de una pantalla,
- mover un botón,
- mejorar un empty state,
- cambiar un color o estilo,
- mejorar un mensaje de error visual,
- reorganizar una tabla sin cambiar la lógica.

Eso no significa que nunca puedan generar problemas, pero en general su impacto suele ser más fácil de corregir.

---

## Ejemplos de cambios más sensibles

Estos cambios suelen requerir más cuidado:

- agregar o modificar lógica crítica,
- cambiar permisos,
- tocar flujos de autenticación,
- modificar edge functions,
- cambiar integraciones,
- alterar cómo se guardan datos,
- tocar configuración de entornos,
- modificar comportamiento usado en producción,
- cambiar estructura de base de datos.

---

## Ejemplos de cambios no reversibles o difíciles de revertir

Algunos ejemplos comunes:

### Cambios destructivos en base de datos

- borrar tablas,
- borrar columnas,
- sobrescribir información existente,
- transformar datos sin una vuelta atrás clara,
- cambiar tipos de datos de forma incompatible.

### Cambios que afectan producción directamente

- ejecutar cambios en Prod sin validarlos antes,
- publicar lógica nueva sobre flujos críticos,
- cambiar configuración sensible en el entorno real.

### Cambios en integraciones

- enviar datos incorrectos a un sistema externo,
- modificar una integración que dispara acciones reales,
- sincronizar información de forma equivocada.

### Cambios de lógica con impacto operativo

- alterar reglas de negocio existentes,
- cambiar validaciones importantes,
- cambiar cómo se calculan montos, estados o decisiones,
- modificar permisos de forma incorrecta.

---

## Por qué estos cambios requieren más cuidado

Porque pueden afectar cosas como:

- datos reales,
- usuarios reales,
- operación del proyecto,
- integraciones externas,
- seguridad,
- consistencia del sistema,
- capacidad de rollback.

En muchos casos, el problema no es solo que “algo falle”, sino que el sistema quede en un estado difícil de corregir.

---

## Cómo se ve esto en Landscapes

En Landscapes, este tema es especialmente importante porque:

- se trabaja con Lovable,
- los cambios pueden ejecutarse rápido,
- muchas personas que hacen cambios no tienen contexto técnico profundo,
- y un cambio pequeño en apariencia puede tocar partes muy sensibles.

Además, en Landscapes no siempre hay una revisión previa formal de cada cambio.  
Por eso, el control no depende solo de supervisión humana, sino también de:

- trabajar primero en **Test**,
- entender el impacto del cambio,
- seguir las guidelines ya definidas,
- y prestar atención cuando Lovable detecta un cambio delicado.

---

## Qué hacer cuando un cambio es sensible

Cuando un cambio entra en una zona sensible, la idea no es detener todo automáticamente, sino **trabajar con más cuidado**.

Eso significa, por ejemplo:

- entender mejor el alcance real,
- no asumir que el cambio es pequeño solo porque la UI se ve simple,
- revisar si toca datos, lógica o integraciones,
- probar mejor en **Test**,
- validar efectos secundarios,
- seguir las guías de Lovable para ese tipo de cambio,
- y apoyarse en las guidelines internas del proyecto.

Dicho simple:  
si el cambio es más riesgoso, el nivel de cuidado también debe subir.

---

## Qué señales indican que probablemente el cambio es sensible

Estas son algunas señales comunes:

- toca base de datos,
- toca estructura, no solo datos,
- modifica una edge function,
- cambia permisos,
- cambia autenticación,
- toca una integración externa,
- afecta un flujo crítico,
- impacta producción,
- no tiene rollback claro,
- puede borrar o sobrescribir información,
- cambia cómo funciona algo que ya está en uso.

---

## Qué señales indican que un cambio puede ser no reversible

Estas señales suelen ser especialmente importantes:

- elimina algo existente,
- reemplaza datos actuales,
- modifica estructura usada por otras partes,
- cambia tipos de datos incompatibles,
- dispara acciones reales en sistemas externos,
- altera información de producción sin copia o salida clara,
- no existe una forma simple de volver al estado anterior.

---

## Ejemplo simple

Supongamos que se quiere eliminar una columna de base de datos porque “ya no se usa”.

A primera vista, puede parecer un cambio pequeño.

Pero antes de hacerlo habría que preguntarse:

- ¿esa columna realmente no se usa en ningún flujo?
- ¿alguna edge function la sigue leyendo?
- ¿algún reporte depende de ella?
- ¿alguna pantalla la muestra indirectamente?
- ¿qué pasa con los datos que ya existen?
- ¿si la eliminamos y algo falla, cómo volvemos atrás?

Ese es un buen ejemplo de un cambio que puede parecer pequeño, pero ser sensible y no reversible.

---

## Otro ejemplo simple

Supongamos que se modifica una edge function para que, al aprobar una solicitud, también envíe información a un sistema externo.

Ese cambio puede ser sensible porque:

- altera lógica real,
- toca integración,
- puede afectar datos fuera del sistema,
- y un error puede dejar inconsistencias o registros incorrectos.

Aunque visualmente no cambie casi nada en la UI, el impacto puede ser alto.

---

## Confusiones comunes

### “Si el cambio es pequeño visualmente, no es sensible”

No necesariamente.

Hay cambios casi invisibles en pantalla que pueden tener impacto alto en backend, base de datos o integraciones.

---

### “Si Lovable lo puede hacer, entonces no hay riesgo”

No.

Lovable ayuda muchísimo, pero eso no elimina el riesgo del cambio.  
Sigue siendo importante entender qué se está tocando.

---

### “Si algo sale mal, después lo arreglamos”

A veces sí, pero no siempre de forma simple.

Hay cambios que, una vez ejecutados, ya alteraron datos, comportamiento o integraciones de una manera difícil de revertir.

---

### “Solo los cambios grandes son sensibles”

No.

Un cambio puede ser pequeño en tamaño, pero muy sensible por su impacto.

---

## Cómo pensar un cambio antes de ejecutarlo

Cuando vayas a pedir o revisar un cambio, ayuda hacerse estas preguntas:

- ¿Este cambio toca datos reales?
- ¿Toca estructura o solo contenido?
- ¿Toca un flujo crítico?
- ¿Toca permisos, autenticación o seguridad?
- ¿Toca una edge function o una integración?
- ¿Se puede revertir fácilmente?
- ¿Qué pasa si esto falla en producción?
- ¿Ya fue validado en Test?
- ¿Estoy entendiendo el alcance real o solo la parte visible?
- ¿Lovable está marcando este cambio como delicado?

Estas preguntas ayudan a detectar mejor el nivel de riesgo.

---

## Relación con Test y Prod

Este tema está muy conectado con entornos.

Una parte importante del control de riesgo en Landscapes es:

1. trabajar primero en **Test**,
2. validar el cambio ahí,
3. entender si el cambio es sensible o no reversible,
4. y solo después moverlo a **Prod** con más criterio.

Mientras más sensible sea el cambio, menos sentido tiene usar producción como lugar de prueba.

---

## Relación con las guidelines del proyecto

En Landscapes ya existen guidelines para este tipo de casos.

Además, Lovable también suele detectar cambios delicados y dar orientación cuando una operación puede ser riesgosa.

Por eso, cuando un cambio entra en esta categoría, no conviene improvisar.  
Lo correcto es apoyarse en:

- las alertas y guías de Lovable,
- las guidelines internas,
- y una validación más cuidadosa del impacto real.

---

## Ideas clave para recordar

- Un cambio sensible es un cambio con mayor riesgo o mayor impacto potencial.
- Un cambio no reversible es un cambio que no tiene una vuelta atrás simple.
- En Landscapes, los cambios no reversibles suelen requerir especial cuidado.
- No todo cambio riesgoso se ve grande en pantalla.
- Base de datos, edge functions, integraciones, permisos y producción suelen ser zonas especialmente delicadas.
- Cuando un cambio es sensible, la respuesta no es frenar siempre, sino trabajar con más criterio, mejor validación y más cuidado.