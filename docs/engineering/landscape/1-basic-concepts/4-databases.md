---
title: Bases de datos
sidebar_position: 4
slug: /basic-concepts/databases
---

# Bases de datos

Esta guía explica qué son las **bases de datos**, por qué importan y cómo se ve este concepto en proyectos de Landscapes.

La idea no es aprender administración de bases de datos, sino entender qué tipo de información vive ahí, qué significa cambiarla y por qué tocar esta parte del sistema requiere cuidado.

---

## Qué es

Una base de datos es el lugar donde una aplicación **guarda, organiza y consulta información**.

Dicho simple:  
si una aplicación necesita recordar algo, normalmente lo guarda en una base de datos.

Por ejemplo:

- usuarios,
- pedidos,
- tareas,
- pagos,
- configuraciones,
- formularios enviados,
- historial de cambios.

Sin base de datos, muchas aplicaciones no podrían conservar información entre una sesión y otra.

---

## Por qué importa

Entender qué es una base de datos ayuda a:

- saber dónde vive realmente la información del sistema,
- distinguir entre un cambio visual y un cambio de datos,
- entender mejor qué impacto tiene agregar, editar o eliminar información,
- y detectar cuándo un cambio puede ser sensible o no reversible.

En Landscapes esto importa mucho porque no solo se cambia la UI. Muchas veces también se agregan campos, tablas, relaciones o reglas que afectan directamente cómo se guarda la información.

---

## Qué tipo de cosas guarda una base de datos

Una base de datos puede guardar muchos tipos de información.

Algunos ejemplos comunes:

### Datos del negocio

- clientes,
- productos,
- membresías,
- reservas,
- facturas,
- pedidos.

### Datos operativos

- estados,
- configuraciones,
- relaciones entre registros,
- asignaciones,
- historiales.

### Datos de usuarios

- nombre,
- email,
- teléfono,
- rol,
- permisos asociados.

### Datos generados por flujos

- respuestas de formularios,
- registros creados desde la app,
- resultados de procesos,
- eventos o trazas internas.

---

## Conceptos básicos

### Tabla

Una tabla es un conjunto de datos organizados por tema.

Ejemplos:

- tabla de usuarios,
- tabla de tareas,
- tabla de pedidos.

Cada tabla agrupa información parecida.

---

### Registro

Un registro es una fila dentro de una tabla.

Ejemplo:

si existe una tabla de usuarios, cada usuario guardado sería un registro.

---

### Columna

Una columna es un tipo de dato dentro de una tabla.

Ejemplo:

en una tabla de usuarios podrían existir columnas como:

- nombre,
- email,
- teléfono,
- fecha de creación.

---

### Relación

Una relación conecta información entre tablas.

Por ejemplo:

- un pedido pertenece a un usuario,
- una tarea pertenece a un workspace,
- una membresía puede estar asociada a un cliente.

Esto permite que la información no viva toda mezclada en un solo lugar.

---

### Schema

El schema es la **estructura** de la base de datos.

Incluye cosas como:

- qué tablas existen,
- qué columnas tiene cada una,
- qué relaciones hay entre ellas,
- qué reglas se aplican.

Cuando se cambia el schema, no se está cambiando solo un dato: se está cambiando la forma en que la información se organiza.

---

## Cambiar datos no es lo mismo que cambiar estructura

Esta diferencia es muy importante.

### Cambiar datos

Es modificar información que ya existe.

Por ejemplo:

- editar el nombre de un usuario,
- cambiar el estado de una tarea,
- actualizar un precio,
- borrar un registro.

Aquí la estructura no cambia.  
Solo cambia el contenido.

---

### Cambiar estructura

Es modificar cómo está organizada la base de datos.

Por ejemplo:

- crear una nueva tabla,
- agregar una columna,
- eliminar una columna,
- cambiar relaciones,
- modificar tipos de datos.

Esto suele ser más delicado porque puede afectar muchas partes del sistema.

---

## Ejemplo simple

Supongamos que tenemos una app de tareas.

Podría existir una tabla llamada `tasks` con columnas como:

- title,
- description,
- status,
- assigned_user_id,
- created_at.

Si creamos una nueva tarea, estamos agregando un **registro**.  
Si cambiamos el título de esa tarea, estamos modificando un **dato**.  
Si agregamos una nueva columna llamada `priority`, estamos cambiando la **estructura**.

---

## Cómo se ve esto en Landscapes

En Landscapes, cuando hablamos de base de datos normalmente hablamos de cosas como:

- tablas en Supabase,
- columnas nuevas,
- relaciones entre datos,
- campos que se agregan a formularios y luego deben guardarse,
- información que se usa en vistas, listados y dashboards,
- cambios de estructura para soportar nuevas funcionalidades.

Muchos prompts pueden implicar base de datos aunque no lo digan de forma explícita.

Por ejemplo:

- “agrega un campo de prioridad a las tareas”,
- “guarda el motivo de cancelación”,
- “relaciona este registro con el cliente”,
- “muestra quién aprobó esta solicitud”.

Todos esos cambios probablemente tocan base de datos.

---

## Qué señales indican que probablemente sí hay un cambio de base de datos

Estas son algunas señales comunes:

- hay que guardar nueva información,
- hay que agregar un nuevo campo,
- hay que relacionar un dato con otro,
- hay que consultar información que antes no existía,
- hay que soportar una nueva funcionalidad con datos persistentes,
- hay que cambiar cómo se organiza la información,
- hay que migrar o transformar datos existentes.

---

## Qué señales indican que probablemente no es solo base de datos

Estas señales suelen indicar que también hay otras capas involucradas:

- hay que mostrar el dato en pantalla,
- hay que agregar campos a un formulario,
- hay que aplicar validaciones de negocio,
- hay que controlar permisos,
- hay que procesar lógica antes de guardar,
- hay que integrarse con servicios externos.

En esos casos, probablemente el cambio toca frontend, backend, API o edge functions además de la base de datos.

---

## Confusiones comunes

### “La base de datos es lo mismo que el backend”

No.

La base de datos guarda información.  
El backend procesa lógica y reglas.

Trabajan juntos, pero no son lo mismo.

---

### “Si agrego un campo en la pantalla, ya está listo”

No siempre.

Si ese campo debe guardarse de verdad, probablemente también hace falta:

- agregarlo en la base de datos,
- procesarlo en el flujo,
- validarlo,
- leerlo después para mostrarlo o usarlo.

---

### “Cambiar una tabla es un cambio pequeño”

No necesariamente.

Un cambio en base de datos puede impactar:

- formularios,
- tablas visuales,
- filtros,
- reportes,
- edge functions,
- integraciones,
- lógica existente.

---

### “Borrar una columna no debería ser problema”

Puede ser un problema serio.

Si esa columna ya está siendo usada por otras partes del sistema, eliminarla puede romper flujos existentes y además ser un cambio no reversible.

---

## Cambios sensibles en base de datos

En Landscapes, esta es una de las áreas donde más cuidado hay que tener.

Especialmente cuando el cambio es:

- destructivo,
- difícil de revertir,
- riesgoso para datos existentes,
- o puede romper compatibilidad.

Ejemplos de cambios más sensibles:

- borrar tablas,
- borrar columnas,
- cambiar tipos de datos de forma incompatible,
- sobrescribir información existente,
- hacer migraciones destructivas,
- romper relaciones existentes.

Por eso, aunque se puedan ejecutar cambios desde Lovable, es importante entender cuándo el cambio toca estructura y cuándo además puede ser no reversible.

---

## Cómo pensar un cambio de base de datos

Cuando vayas a pedir o revisar un cambio, ayuda hacerse estas preguntas:

- ¿Qué información nueva necesita guardar el sistema?
- ¿Ese dato ya existe o hay que crear estructura nueva?
- ¿Esto implica una nueva columna o una nueva tabla?
- ¿Hay relaciones con otros datos?
- ¿Qué partes de la app dependen de esta información?
- ¿El cambio es reversible?
- ¿Existe riesgo de perder o romper datos actuales?

Estas preguntas ayudan a detectar mejor el impacto real de un cambio.

---

## Ejemplos de cambios típicos de base de datos

- agregar una columna nueva,
- crear una nueva tabla,
- relacionar dos entidades,
- guardar un nuevo dato de negocio,
- agregar timestamps o campos de auditoría,
- cambiar cómo se estructura una entidad,
- migrar datos de una estructura vieja a una nueva,
- eliminar datos o estructura obsoleta.

---

## Relación entre base de datos, frontend y backend

Estos conceptos suelen trabajar juntos:

- El **frontend** muestra y captura información.
- El **backend** aplica lógica y reglas.
- La **base de datos** guarda la información.
- Las **APIs** y **Edge Functions** ayudan a conectar y ejecutar el flujo.

Por eso, un cambio en base de datos rara vez vive totalmente aislado.  
Muchas veces forma parte de un flujo más grande.

---

## Ideas clave para recordar

- La base de datos es donde la aplicación guarda y organiza la información.
- No es lo mismo que frontend ni que backend.
- Cambiar datos no es lo mismo que cambiar estructura.
- Agregar o modificar campos puede impactar varias partes del sistema.
- Los cambios destructivos o no reversibles requieren más cuidado.
- En Landscapes, entender base de datos ayuda a detectar mejor el alcance y el riesgo real de una tarea.