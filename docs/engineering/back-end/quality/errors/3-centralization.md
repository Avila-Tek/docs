---
title: Centralización de errores
sidebar_position: 4
slug: /back-end/errors/centralization
keywords: [quality, errors, centralization]
---

Partiendo de la lógica de AOP (Aspecto-Oriented Programming), el manejo de errores debe estar lo más centralizado posible y aislado de la lógica de negocio.
Esta idea la logramos creando un manejador de errores global y una serie de funciones que nos permitan detener la ejecución del código a voluntad.

## 🧑🏻‍💻 El caso de ejemplo

Para efectos de hacer esta sección más digerible, comenzaremos con un ejemplo muy sencillo que no aplique la centralización de errores e iremos mejorando poco a poco su implementación.
Este controller consta de tres partes.

1. Una validación del usuario registrado.
2. Una validación de los productos recibidos.
3. La creación de la orden.

```ts
export async function createOrderController(req, res) {
  try {
    const token = req.headers.authorization
    if (!token) {
      reply.status(500).send({
        title: 'Inicio de sesión requerido',
        message: 'Debe iniciar ',
        code: 'login-required',
      });
      return reply;
    }


    const user = await authService.currentUser(token);
    if (!user) {
      Sentry.captureException({...});
      reply.status(500).send({
        message: 'Error interno. Por favor intente más tarde.',
        code: 'internal-server-error',
      });
      return reply;
    }

    if (user.status === 'suspended') {
      reply.status(403).send({
        message: 'Cuenta suspendida',
        code: 'suspended-user',
      });
      return reply;
    }

    const productIds = req.body.productIds;
    const products = await Product.find({ _id: productIds });
    if (!products || products.length !== productIds.length) {
      Sentry.captureException({...});
      reply.status(500).send({
        message: 'Productos no disponibles',
        code: 'unavailable-products',
      });
      return reply;
    }

    const order = await createOrder(req.body);

    return { order };
  } catch (err) {
    Sentry.captureException({...});
    reply.status(500).send({
      message: 'Error interno. Por favor intente más tarde.',
      code: 'internal-server-error',
    });
    return reply;
  }
}
```

Como podemos ver, están ocurriendo varias cosas en paralelo dentro de este código:

**1. Separación de responsabilidades**

Tal como está el controller, éste es responsable no solo de la lógica de negocio, sino también del manejo de los errores tanto de cara al cliente como hacia Sentry.

**2. Múltiples casos de error**

También podemos notar que no todos los errores son tratados de la misma manera. Casos como la falta de un authorization token solo traen consigo una respuesta al cliente sobre la validación, pero la ausencia de un producto de la lista o el error genérico del catch incluyen comunicación con Sentry.

**3. Posible duplicidad**

Al definir los errores directamente en la lógica de negocio, indirectamente estamos causando que si el error se repite en otro lugar, tengamos que duplicar el código.

---

## Paso 1: Centralizar los mensajes de error

La intención será crear un diccionario de errores que queremos manejar en nuestra aplicación. Este diccionario vamos a subdividir en pequeños diccionarios para cada módulo de nuestro proyecto como pueden ser los usuarios, la autentificación, órdenes, etc.

### Typing

Para que el código quede lo más limpio posible, debemos agregar tipado para evitar typos dentro del código que acaben causando internal exceptions:

```ts
export const EntitiesObject = Object.freeze({
  user: 'user',
});

export type EntityType = keyof typeof EntitiesObject;

export type ErrorCodes<T extends EntityType> =
  keyof (typeof errorsDictionary)[T];
```

Este tipado lo utilizaremos para lo que viene.

### Sub-diccionarios

```ts
// amazing-project/apps/api/src/plugins/errors/dictionaries/users.ts

const userErrors = {
  'not-found': {
    status: 404,
    type: 'NOT_FOUND_ERROR',
    code: 'USER_NOT_FOUND',
    title: 'Usuario no encontrado',
    message: 'El usuario que buscas no fue encontrado',
  },
  suspended: {
    status: 403,
    type: 'AUTHORIZATION_ERROR',
    code: 'SUSPENDED_USER',
    title: 'Usuario suspendido',
    message: 'Tu cuenta se encuentra suspendida',
  },
};
```

### Diccionario principal

Con el ejemplo de los errores de usuario en mente y pensando en sus replicas para productos, autentificación e internal, podemos crear un diccionario principal:

```ts
import { authErrors } from './auth';
import { userErrors } from './users';
import { productErrors } from './products';
import { internalErrors } from './internal';

export const errorsDictionary = {
  auth: authErrors,
  user: userErrors,
  internal: internalErrors,
  product: productErrors,
};
```

La sub-división de errores queda a potestad del equipo, pero es recomendable separarlos por:

1. Componentes del sistema (en caso de usar la arquitectura Controller-Service)
2. Dominios del sistema (en caso de usar Domain-Driven Design)

## Paso 2: Centralizar los throwers

En este punto debemos tomar en cuenta que existe dos situaciones donde quisiéramos detener la ejecución: 3. Ante validaciones sobre los datos de entrada del usuario o información relacionada directamente con éstos.

1. Ante validaciones sobre los datos de entrada del usuario o información relacionada directamente con éstos.

```ts
// Endpoint: createPost
const token = req.headers['Authorization'];
if (!token) // Login required error

if (!req.body.title) // Title required error
if (!req.body.description) // Description required error
```

2. Ante validaciones internas que siempre deberían ser correctas a menos que algo malo haya pasado.

```ts
// Endpoint: createPost too

const user = await fetchUser(userId);
if (!user) // Bye.

const category = await fetchCategory(categoryId);
if (!category) // Bye bye.
```

Para el primer caso, no hay problema en que el usuario se entere del error, puesto de que alguna manera fue su culpa. Sin embargo, para el segundo tipo de errores, es importante no filtrar estos errores puesto que están más relacionados con algo interno de nuestros procesos y puede dar información hacia el exterior sobre el tipo de requests que estamos realizando, etc.

La solución
Primero creamos un nuevo tipo de error dentro de nuestra aplicación llamado Exception con una propiedad silent para esconder los errores que no nos interesen.

```ts
interface ExceptionInput {
  data: StandardError;
  silent?: boolean;
  params?: Record<string, any>;
}

export class Exception extends Error {
  public data: StandardError;
  public silent: boolean;
  public params: Record<string, any>;

  constructor({ data, params = {}, silent = false }: ExceptionInput) {
    super(data.detail.en); // Default english error
    this.data = data;
    this.silent = silent;
    this.params = params;
  }
}
```

Y ahora creamos el manejador:

```ts
function throwException<T extends EntityType>(
  entity: T,
  errorCode: ErrorCodes<T>,
  params: Record<string, any> = {},
  silent: boolean = false
): never {
  const data = (errorsDictionary?.[entity]?.[errorCode] ||
    errorsDictionary.default.default!) as StandardError;

  // Throwing exception
  throw new Exception({ data, silent, params });
}

function exception<T extends EntityType>(
  entity: T,
  errorCode: ErrorCodes<T>,
  params: Record<string, any> = {}
): never {
  throwException<T>(entity, errorCode, params, false);
}

function silentException<T extends EntityType>(
  entity: T,
  errorCode: ErrorCodes<T>,
  params: Record<string, any> = {}
): never {
  throwException<T>(entity, errorCode, params, true);
}

export const thrower = Object.freeze({ exception, silentException });
```

### Paso 2.1: Actualizando el ejemplo

Tomando en cuenta los cambios que hemos hecho hasta el momento, nuestro ejemplo quedaría de la siguiente manera:

```ts
import { thrower } from '@/errors/thrower';

export async function createOrderController(req, res) {
  try {
    const token = req.headers.authorization
    if (!token) {
      return thrower.exception('auth', 'login-required');
    }
    const user = await authService.currentUser(token);
    if (!user) {
      return thrower.silentException('user', 'not-found');
    }

    if (user.status === 'suspended') {
      return thrower.exception('user', 'suspended');
    }

    const productIds = req.body.productIds;
    const products = await Product.find({ _id: productIds });
    if (!products || products.length !== productIds.length) {
      return thrower.exception('products', 'unavailable');
    }

    const order = await createOrder(req.body);

    return { order };
  } catch (err) {
    // Esto todavía no lo quitamos
    Sentry.captureException({...});
    reply.status(500).send({
    message: 'Error interno. Por favor intente más tarde.',
    code: 'internal-server-error',
    });
    return reply;
  }
}
```

---

## Paso 3: Centralizar el handler de errores

Para esto haremos uso de una función sencilla que reciba el error detectado, el request original y el objeto reply de Fastify:

```ts
import type { FastifyReply, FastifyRequest } from 'fastify';
import { generateCleanStackTrace } from './stack';
import { Exception } from './exception';
import { errorRegistry } from './dictionaries';
import { logError } from './logs';

function injectParams(detail: string, params: Record<string, any>) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(`<${key}>`, value);
  }, detail);
}

const productionEnv = process.env.APP_ENV === 'production';

export function handleError(
  error: Error | Exception,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const date = new Date();
  const stack = generateCleanStackTrace(error);

  let title = 'Unhandled server error';
  let status = 500;
  let message = 'An unexpected error appeared';
  let type = 'default';
  let silent = false;

  if (error instanceof Exception) {
    silent = error.silent && productionEnv;
    const data = error.data;
    title = error.data.title;
    status = error.data.status;
    type = error.data.type;
    message = injectParams(data.message, error.params);
  }

  const genericError = errorRegistry.getError('internal', 'default');
  const response = {
    title: silent ? genericError.title : title,
    message: silent ? genericError.message : message,
    status: silent ? genericError.status : status,
    stack: !productionEnv && status === 500 ? stack : undefined,
  };

  // Send error response
  reply.status(status).send(response);
  return reply;
}
```

Ahora lo podemos agregar en Fastify justo después de las rutas en nuestra API:

```ts
fastify.setErrorHandler(handleError);
```

Finalmente, el ejemplo con el que empezamos ya no sería necesario agregar el catch, por lo que quedaría de la siguiente forma:

```ts
import { thrower } from '@/errors/thrower';

export async function createOrderController(req, res) {
  const token = req.headers.authorization;
  if (!token) {
    return thrower.exception('auth', 'login-required');
  }

  const user = await authService.currentUser(token);
  if (!user) {
    return thrower.silentException('user', 'not-found');
  }

  if (user.status === 'suspended') {
    return thrower.exception('user', 'suspended');
  }

  const productIds = req.body.productIds;
  const products = await Product.find({ _id: productIds });
  if (!products || products.length !== productIds.length) {
    return thrower.exception('products', 'unavailable');
  }

  const order = await createOrder(req.body);

  return { order };
}
```
