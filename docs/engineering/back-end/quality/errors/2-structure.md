---
title: Estructura
sidebar_position: 4
slug: /back-end/errors/structure
keywords: [quality, errors, structure]
---

## 🏡 La estructura

### Códigos

En base a las categorías que tenemos de los errores, podemos definir los siguientes códigos de error que irán dentro de la respuesta.

- Errores de validación: `VALIDATION_ERROR`
- Errores de autentificación: `AUTHENTICATION_ERROR`
- Errores de autorización: `AUTHORIZATION_ERROR`
- Errores por no encontrar el recurso: `NOT_FOUND_ERROR`
- Errores de conflicto: `CONFLICT_ERROR`
- Errores por límite de intentos: `RATE_LIMIT_ERROR`
- Errores de dominio: `DOMAIN_ERROR`
- Errores internos: `INTERNAL_SERVER_ERROR`
- Errores de servicios externos: `EXTERNAL_SERVICE_ERROR`

### Interfaz

En definitiva, cada respuesta con errores debe seguir la siguiente estructura:

- **Type:** código del tipo de error. Debe ser alguno de los listados arriba.
- **Code:** código directo del error que ocurrió.
- **Title:** mensaje principal que el frontend pueda mostrar al usuario en pantalla.
- **Message:** sub-mensaje que el frontend pueda utilizar para dar más información al usuario.
- **Status:** código HTTP de la respuesta (solo aplicable para GraphQL)
- **Details:** array customizable por error con información adicional que pueda ser de ayuda.
- **Stack:** ubicación del error en el código del proyecto.

```js
interface ErrorResponse {
  type: string;
  code: string;
  title: string;
  message: string;
  status: number;
  details: Record<string, any>[];
  stack?: string; // Solo para entornos de desarrollo
}
```

### Ejemplo

```js
{
  "type": "NOT_FOUND_ERROR",
  "code": "USER_NOT_FOUND",
  "title": "Usuario no encontrado",
  "message": "No encontramos el usuario que buscas",
  "status": 404, // Solo para GraphQL
  "details": [
    {
      "field": "_id",
      "value": "123",
    },
  ],
  "stack": "...",
}
```
