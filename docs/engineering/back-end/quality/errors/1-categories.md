---
title: Categorías de errores
sidebar_position: 4
slug: /backend/errors/categories
keywords: [quality, errors, categories]
---

Primero debemos empezar por entender las categorías de errores que podemos tener dentro de nuestros sistemas. Esta segmentación se puede dar de diferentes maneras, pero nosotros estaremos trabajando con las siguientes nueve:

### A. Errores de validación

**Definición:** Estos son errores relacionados entre los datos entregados directamente por el cliente y lo que la API esperaba. No se deben ejecutar ninguna lógica de negocio hasta validar que la petición está libre de estos errores.

**Status:** `400 Bad Request`

**Ejemplos:**

- Falta de parámetros requeridos.
- Enums con valores incorrectos.

### B. Error de autentificación

**Definición:** Este error ocurre para endpoints donde se requiere un inicio de sesión por parte del usuario para disponer del recurso.

**Status:** `401 Unauthorized`

**Ejemplos**

- Falta del header Authorization
- Valor inválido en el mismo header
- Token expirado.

### C. Error de autorización

**Definición:** A diferencia del error de autentificación, este error ocurre cuando sí se provee un JWT válido, pero los permisos del usuario no son válidos para el endpoint.

**Status:** `403 Forbidden`

**Ejemplos**

- Clientes accediendo a un endpoint del admin.
- Admins accediendo a endpoints del superadmin.

### D. Errores por no encontrar el recurso

**Definición:** Este es el típico 404 que ocurre al no encontrar lo que el usuario estaba solicitando. Este error debemos tratarlo con cuidado, puesto que retornar 404 por no encontrar algo dentro de nuestro flujo, pero que el usuario desconoce que estamos buscando, no debe ocurrir.

**Status:** `404 Not Found`

**Ejemplos**

- Clientes solicitando un producto en específico.
- Admins revisando el perfil de algún usuario ya eliminado o con errores en su URL.

### E. Errores de conflicto

**Definición:** Nos encontramos este tipo de errores cuando la solicitud del usuario es correcta, pero al revisar el estado de la base de datos, por alguna razón no podemos ejecutar la solicitud.

**Status:** `409 Conflict`

**Ejemplos**

- Un cliente registrando un correo ya existente.
- Un admin tratando de aprobar una orden que ya fue rechazada.

### F. Errores por límite de intentos

**Definición:** Estos errores principalmente nos ayudan a evitar un web scrapping de nuestra API o incluso un DoS simple (para un DDoS necesitamos más ayuda).

**Status:** `429 Too Many Requests ó 403 Forbidden`

**Ejemplos**

- Un hacker realizando múltiples peticiones a endpoints aleatorios buscando una vulnerabilidad.
- Algún cliente fastidiado dándole a un botón una y otra vez.

### G. Errores de negocio

**Definición:** Este error es el hermano mayor de los errores por conflicto y por validación. Ocurre cuando no hubo errores en el input de la petición, tampoco hubo errores de conflicto, pero la lógica de negocio asociada indica que no se puede realizar la petición.

**Status:** `422 Unprocessable Content`

**Ejemplos**

- Clientes tratando de cancelar una orden cuando ya fue despachada.

### H. Errores internos

**Definición:** Error genérico para atrapar errores inesperados o para ocultar errores de servicios externos en producción.

**Status:** `500 Internal Server Error`

**Ejemplos**

- Accediendo a una propiedad de un valor undefined.

### I. Errores de servicios externos

**Definición:** Errores relacionados con servicios externos

**Status:** El estatus de estos errores puede varios entre los siguientes tres, dependiendo de la respuesta del proveedor.

- `500 Internal Server Error en producción`
- `502 Bad Gateway`
- `503 Service Unavailable en desarrollo`

**Ejemplos**

- Una respuesta inesperada de Ubii.
- Error al subir documentos a S3.

---
