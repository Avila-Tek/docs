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

- Frontend
- Backend
- Base de datos
- Edge functions
- Integraciones
- Configuración del proyecto

En este contexto, no todos los cambios tienen el mismo nivel de riesgo.

Hay cambios que son fáciles de ajustar o deshacer y hay otros que, una vez ejecutados, pueden:

- Romper flujos
- Afectar datos existentes
- Cambiar el comportamiento de producción
- Ser difíciles de revertir

Por eso es importante entender cuándo un cambio entra en una zona más delicada.

---

## Qué es un cambio sensible

Un cambio sensible es un cambio que requiere **más cuidado del normal** porque su impacto potencial es alto.

---

## Qué es un cambio no reversible

Un cambio no reversible es un cambio que **no se puede deshacer fácilmente** o que no tiene una vuelta atrás simple.

En algunos casos sí se puede corregir después, pero no de forma limpia, inmediata o segura.

Por ejemplo:

- Si se borra información
- Si se elimina una columna
- Si se cambia una estructura y otras partes empiezan a depender de eso
- Si se publica una lógica nueva que altera datos reales
- Si una integración envía información incorrecta a otro sistema

En pocas palabras, un cambio no reversible es uno donde “deshacerlo” no es tan fácil como volver al estado anterior.

---

## Relación entre ambos conceptos

No todo cambio sensible es no reversible y no todo cambio no reversible se ve peligroso a primera vista.

Pero en la práctica, en Landscapes, los cambios **no reversibles** suelen ser una de las formas más claras de identificar que estamos frente a un cambio **sensible**.

Por eso, cuando un cambio no tiene rollback simple, debería tratarse con más cuidado.

---

## Ejemplos de cambios sencillos

Estos cambios suelen tener menos riesgo si están bien acotados:

- Cambiar un texto visible
- Ajustar el orden de una pantalla
- Mover un botón
- Mejorar un empty state
- Cambiar un color o estilo
- Mejorar un mensaje de error visual
- Meorganizar una tabla sin cambiar la lógica

Eso no significa que nunca puedan generar problemas, pero en general su impacto suele ser más fácil de corregir.

---

## Ejemplos de cambios sensibles

Estos cambios suelen requerir más cuidado:

- Agregar o modificar lógica crítica
- Cambiar permisos
- Tocar flujos de autenticación
- Modificar edge functions
- Cambiar integraciones
- Alterar cómo se guardan datos
- Tocar configuración de entornos
- Modificar comportamiento usado en producción
- Cambiar estructura de base de datos

---

## Ejemplos de cambios no reversibles o difíciles de revertir

Algunos ejemplos comunes:

### Cambios destructivos en base de datos

- Borrar tablas
- Borrar columnas
- Sobrescribir información existente
- Transformar datos sin una vuelta atrás clara
- Cambiar tipos de datos de forma incompatible

### Cambios que afectan producción directamente

- Ejecutar cambios en Producción sin validarlos antes
- Publicar lógica nueva sobre flujos críticos
- Cambiar configuración sensible en el entorno real

### Cambios en integraciones

- Enviar datos incorrectos a un sistema externo
- Modificar una integración que dispara acciones reales
- Sincronizar información de forma equivocada

### Cambios de lógica con impacto operativo

- Alterar reglas de negocio existentes
- Cambiar validaciones importantes
- Cambiar cómo se calculan montos, estados o decisiones
- Modificar permisos de forma incorrecta

---

## Por qué estos cambios requieren más cuidado

Porque pueden afectar cosas como:

- Datos reales
- Usuarios reales
- Operación del proyecto
- Integraciones externas
- Seguridad
- Consistencia del sistema
- Capacidad de rollback

En muchos casos, el problema no es solo que “algo falle”, sino que el sistema quede en un estado difícil de corregir.

---

## Qué hacer cuando un cambio es sensible

Cuando un cambio entra en una zona sensible, la idea no es detener todo automáticamente, sino **trabajar con más cuidado**.

Eso significa, por ejemplo:

- Entender mejor el alcance real
- No asumir que el cambio es pequeño solo porque la UI se ve simple
- Revisar si toca datos, lógica o integraciones
- Probar con más detalle en **Test**
- Validar efectos secundarios
- Seguir las guías de Lovable para ese tipo de cambio
- Apoyarse en las guidelines internas del proyecto

En pocas palabras, si el cambio es más riesgoso, el nivel de cuidado también debe subir.

---

## Qué señales indican que probablemente el cambio es sensible

Estas son algunas señales comunes:

- Toca base de datos
- Toca estructura, no solo datos
- Modifica una edge function
- Cambia permisos
- Cambia autenticación
- Toca una integración externa
- Afecta un flujo crítico
- Impacta producción
- No tiene rollback claro
- Puede borrar o sobrescribir información
- Cambia cómo funciona algo que ya está en uso

---

## Qué señales indican que un cambio puede ser no reversible

Estas señales suelen ser especialmente importantes:

- Elimina algo existente
- Reemplaza datos actuales
- Modifica estructura usada por otros módulos
- Cambia tipos de datos incompatibles
- Dispara acciones reales en sistemas externos
- Altera información de producción sin copia o salida clara
- No existe una forma simple de volver al estado anterior

---

## Ejemplo simple

Supongamos que se quiere eliminar una columna de base de datos porque “ya no se usa”.

A primera vista, puede parecer un cambio pequeño.

Pero antes de hacerlo habría que preguntarse:

- ¿Esa columna realmente no se usa en ningún flujo?
- ¿Alguna edge function la sigue leyendo?
- ¿Algún reporte depende de ella?
- ¿Alguna pantalla la muestra indirectamente?
- ¿Qué pasa con los datos que ya existen?
- ¿Si la eliminamos y algo falla, cómo volvemos atrás?

Ese es un buen ejemplo de un cambio que puede parecer pequeño, pero ser sensible y no reversible.

---

## Otro ejemplo simple

Supongamos que se modifica una edge function para que, al aprobar una solicitud, también envíe información a un sistema externo.

Ese cambio puede ser sensible porque:

- Altera lógica real
- Toca integración
- Puede afectar datos fuera del sistema
- Un error puede dejar inconsistencias o registros incorrectos

Aunque visualmente no cambie casi nada en la UI, el impacto puede ser alto.

---

## Confusiones comunes

### “Si el cambio es pequeño visualmente, no es sensible”

No necesariamente, hay cambios casi invisibles en pantalla que pueden tener impacto alto en backend, base de datos o integraciones.

---

### “Si Lovable lo puede hacer, entonces no hay riesgo”

No, Lovable ayuda muchísimo, pero eso no elimina el riesgo del cambio. Sigue siendo importante entender qué se está tocando.

---

### “Si algo sale mal, después lo arreglamos”

A veces sí, pero no siempre de forma simple. Hay cambios que, una vez ejecutados, ya alteraron datos, comportamiento o integraciones de una manera difícil de revertir.

---

### “Solo los cambios grandes son sensibles”

No, un cambio puede ser pequeño en tamaño, pero muy sensible por su impacto.

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

## Relación con Test y Producción

Este tema está muy conectado con entornos.

Una parte importante del control de riesgo en Landscapes es:

1. Trabajar primero en **Test**
2. Validar el cambio ahí
3. Entender si el cambio es sensible o no reversible
4. Solo después de validar el correcto funcionamiento de la funcionalidad, desplegarlo a **Producción** con más criterio.

Mientras más sensible sea el cambio, menos sentido tiene usar producción como lugar de prueba.

---

## Relación con las guidelines del proyecto

En Landscapes ya existen guidelines para que Lovable maneje este tipo de casos.

Además, Lovable también suele detectar cambios delicados y dar orientación cuando una operación puede ser riesgosa.

Por eso, cuando un cambio entra en esta categoría, no conviene improvisar, lo correcto es apoyarse en:

- Las alertas y guías de Lovable
- Las guidelines internas
- Una validación más cuidadosa del impacto real

---

## Ideas clave para recordar

- Un cambio sensible es un cambio con mayor riesgo o mayor impacto potencial.
- Un cambio no reversible es un cambio que no tiene una vuelta atrás simple.
- En Landscapes, los cambios no reversibles suelen requerir especial cuidado.
- No todo cambio riesgoso se ve grande en pantalla.
- Base de datos, edge functions, integraciones, permisos y producción suelen ser zonas especialmente delicadas.
- Cuando un cambio es sensible, la respuesta no es frenar siempre, sino trabajar con más criterio, mejor validación y más cuidado.
