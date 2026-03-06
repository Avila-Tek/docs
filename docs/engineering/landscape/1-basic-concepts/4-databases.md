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

En palabras sencillas, si una aplicación necesita recordar algo, normalmente lo guarda en una base de datos.

Por ejemplo:

- Usuarios
- Pedidos
- Tareas
- Pagos
- Configuraciones
- Formularios enviados
- Historial de cambios

Sin base de datos, muchas aplicaciones no podrían conservar información entre una sesión y otra.

---

## Por qué importa

Entender qué es una base de datos ayuda a:

- Saber dónde vive realmente la información del sistema
- Distinguir entre un cambio visual y un cambio de datos
- Entender mejor qué impacto tiene agregar, editar o eliminar información
- Detectar cuándo un cambio puede ser sensible o no reversible

En Landscapes esto importa mucho porque no solo se cambia la UI. Muchas veces también se agregan campos, tablas, relaciones o reglas que afectan directamente cómo se guarda la información.

---

## Qué tipo de cosas guarda una base de datos

Una base de datos puede guardar muchos tipos de información.

Algunos ejemplos comunes:

### Datos del negocio

- Clientes
- Productos
- Membresías
- Reservas
- Facturas
- Pedidos

### Datos operativos

- Estados
- Configuraciones
- Relaciones entre registros
- Asignaciones
- Historiales

---

## Conceptos básicos

### Tabla

Una tabla es un conjunto de datos organizados por tema.

Ejemplos:

- Tabla de usuarios
- Tabla de tareas
- Tabla de pedidos

Cada tabla agrupa información parecida.

---

### Registro

Un registro es una fila dentro de una tabla.

Ejemplo:

Si existe una tabla de usuarios, cada usuario guardado sería un registro.

---

### Columna

Una columna es un tipo de dato dentro de una tabla.

Ejemplo:

En una tabla de usuarios podrían existir columnas como:

- Nombre
- Email
- Teléfono
- Fecha de creación

---

### Relación

Una relación conecta información entre tablas.

Por ejemplo:

- Un pedido pertenece a un usuario
- Una tarea pertenece a un workspace
- Una membresía puede estar asociada a un cliente

Esto permite que la información no viva toda mezclada en un solo lugar.

---

### Schema

El schema es la **estructura** de la base de datos.

Incluye cosas como:

- Qué tablas existen
- Qué columnas tiene cada una
- Qué relaciones hay entre ellas
- Qué reglas se aplican

Cuando se cambia el schema, no se está cambiando solo un dato: se está cambiando la forma en que la información se organiza.

---

## Cambiar datos no es lo mismo que cambiar la estructura de los datos

Esta diferencia es muy importante.

### Cambiar datos

Es modificar información que ya existe.

Por ejemplo:

- Editar el nombre de un usuario
- Cambiar el estado de una tarea
- Actualizar un precio
- Borrar un registro

Aquí la estructura no sufre cambios, solo cambia el contenido de la tabla.

---

### Cambiar estructura

Es modificar cómo está organizada la base de datos.

Por ejemplo:

- Crear una nueva tabla
- Agregar una columna
- Eliminar una columna
- Cambiar relaciones
- Modificar tipos de datos

Esto suele ser más delicado porque puede afectar muchas partes del sistema.

---

## Ejemplo simple

Supongamos que tenemos una app de tareas.

Podría existir una tabla llamada `tasks` con columnas como:

- Title
- Description
- Status
- Assigned_user_id
- Created_at

Si creamos una nueva tarea, estamos agregando un **registro**.  
Si cambiamos el título de esa tarea, estamos modificando un **dato**.  
Si agregamos una nueva columna llamada `priority`, estamos cambiando la **estructura**.

---

## Cómo se ve esto en Landscapes

En Landscapes, cuando hablamos de base de datos normalmente hablamos de cosas como:

- Tablas en Supabase
- Columnas nuevas
- Relaciones entre datos
- Campos que se agregan a formularios y luego deben guardarse
- Información que se usa en vistas, listados y dashboards
- Cambios de estructura para soportar nuevas funcionalidades

Muchos prompts pueden implicar base de datos aunque no lo digan de forma explícita.

Por ejemplo:

- “Agrega un campo de prioridad a las tareas”
- “Guarda el motivo de cancelación”
- “Relaciona este registro con el cliente”
- “Muestra quién aprobó esta solicitud”

Todos esos cambios probablemente tocan base de datos.

---

## Qué señales indican que probablemente sí hay un cambio de base de datos

Estas son algunas señales comunes:

- Hay que guardar nueva información
- Hay que agregar un nuevo campo
- Hay que relacionar un dato con otro
- Hay que consultar información que antes no existía
- Hay que soportar una nueva funcionalidad con datos persistentes
- Hay que cambiar cómo se organiza la información
- Hay que migrar o transformar datos existentes

---

## Qué señales indican que probablemente no es solo base de datos

Estas señales suelen indicar que también hay otras capas involucradas:

- Hay que mostrar el dato en pantalla
- Hay que agregar campos a un formulario
- Hay que aplicar validaciones de negocio
- Hay que controlar permisos
- Hay que procesar lógica antes de guardar
- Hay que integrarse con servicios externos

En esos casos, probablemente el cambio toca frontend, backend, API o edge functions además de la base de datos.

---

## Confusiones comunes

### “La base de datos es lo mismo que el backend”

No, La base de datos guarda información, por otro lado, el backend procesa lógica y reglas.

Trabajan juntos, pero no son lo mismo.

---

### “Cambiar una tabla es un cambio pequeño”

No necesariamente, un cambio en base de datos puede impactar:

- Formularios
- Tablas visuales
- Filtros
- Reportes
- Edge functions
- Integraciones
- Lógica existente

---

### “Borrar una columna no debería ser problema”

Puede ser un problema serio, si esa columna ya está siendo usada por otras partes del sistema, eliminarla puede romper flujos existentes y además ser un cambio no reversible.

---

## Cambios sensibles en base de datos

En Landscapes, esta es una de las áreas donde más cuidado hay que tener.

Especialmente cuando el cambio es:

- Destructivo
- Difícil de revertir
- Riesgoso para datos existentes
- Puede romper compatibilidad

Ejemplos de cambios más sensibles:

- Borrar tablas (Este cambio es demasiado delicado, así que hay que evitarlo a toda costa)
- Borrar columnas
- Cambiar tipos de datos de forma incompatible
- Sobrescribir información existente
- Hacer migraciones destructivas
- Romper relaciones existentes

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

- Agregar una columna nueva
- Crear una nueva tabla
- Relacionar dos entidades
- Guardar un nuevo dato de negocio
- Agregar timestamps o campos de auditoría
- Cambiar cómo se estructura una entidad
- Migrar datos de una estructura vieja a una nueva
- Eliminar datos o estructura obsoleta

---

## Relación entre base de datos, frontend y backend

Estos conceptos suelen trabajar juntos:

- El **frontend** muestra y captura información.
- El **backend** aplica lógica y reglas.
- La **base de datos** guarda la información.
- Las **APIs** y **Edge Functions** ayudan a conectar y ejecutar el flujo.

Por eso, un cambio en base de datos rara vez vive totalmente aislado, muchas veces forma parte de un flujo más grande.

---

## Ideas clave para recordar

- La base de datos es donde la aplicación guarda y organiza la información.
- No es lo mismo que frontend ni que backend.
- Cambiar datos no es lo mismo que cambiar estructura.
- Agregar o modificar campos puede impactar varias partes del sistema.
- Los cambios destructivos o no reversibles requieren más cuidado.
