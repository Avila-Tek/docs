---
title: Manejo de idiomas
sidebar_position: 4
slug: /backend/errors/languages
keywords: [quality, errors, languages]
---

Este apartado es bastante sencillo. Para empezar, es importante haber leído las secciones anteriores Estructura y categorización de errores y Centralización de errores. Con eso en mente, podemos empezar.

## 🇺🇳 Agregando nuevos idiomas

Lo único que nos tocaría hacer es transformar todos los textos de language natural a la siguiente estructura:

```ts
interface IMultiLanguage {
  es: string;
  en: string;
  // More languages as needed
}
```

Tomando como ejemplo los errores de usuario que vimos previamente, quedaría de la siguiente manera:

```ts
// amazing-project/apps/api/src/plugins/errors/dictionaries/users.ts

const userErrors = {
  'not-found': {
    status: 404,
    type: 'NOT_FOUND_ERROR',
    code: 'USER_NOT_FOUND',
    title: {
      es: 'Usuario no encontrado',
      en: 'User not found',
    },
    message: {
      es: 'El usuario que buscas no fue encontrado',
      en: 'The desired user could not be found',
    },
  },
  suspended: {
    status: 403,
    type: 'AUTHORIZATION_ERROR',
    code: 'SUSPENDED_USER',
    title: {
      es: 'Usuario suspendido',
      en: 'User suspended',
    },
    message: {
      es: 'Tu cuenta se encuentra suspendida',
      en: 'Your account was suspended',
    },
  },
};
```

## ✅ Resolviendo el idioma

Ya teniendo la nueva estructura, lo que nos queda por hacer es saber cual idioma debemos retornar al usuario, puesto que el frontend seguirá recibiendo la estructura anterior donde el título y el mensaje son strings.
Este análisis lo hacemos en base a un header estándar llamado accept-language donde se reciben los idiomas deseados por el cliente (normalmente tomados automáticamente de la configuración del usuario).

### Ejemplo del header

```
Accept-Language: en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,es-VE;q=0.6,es;q=0.5
```

Para poder leer este header, debemos dividirlo en pequeñas partes de izquierda a derecha. Para esto dividimos por las comas:

- **en-US:** el idioma preferido del usuario
- **en;q=0.9:** segundo idioma, en caso de no tener alguna traducción específica para inglés estadounidense, cualquier respuesta en inglés funciona (británico, australiano, etc.)
- **fr-FR;q=0.8:** tercer idioma, francés.
- **fr;q=0.7:** cuarto idioma, cualquier traducción al francés disponible.
- **es-VE;q=0.6:** quinto idioma, español de Venezuela.
- **es;q=0.5:** sexto idioma, cualquier traducción al español disponible.

### El negociador

Para efectos de nuestros sistemas, podemos decir que este usuario prefiere respuestas en inglés, francés o español (en ese orden). Con este conocimiento, procedemos a desarrollar al negociador de idiomas:

```ts
import { FastifyRequest } from 'fastify';

const availableLanguages = ['en', 'es'] as const;
export type AvailableLanguages = (typeof availableLanguages)[number];

function processLanguages(acceptLanguageHeader: string) {
  const languages = acceptLanguageHeader.split(',').map((lang) => lang.trim());
  return languages;
}

function negotiate(requestedLanguages: string[]): AvailableLanguages {
  const negotiationResult = requestedLanguages.reduce(
    (acc, lang: string) => {
      // If already selected, skip further checks
      if (acc.selected) return acc;

      // Check if the language is available
      const language = lang.split(';')[0].trim();
      if (!availableLanguages.includes(language as any)) return acc;
      return { language, selected: true };
    },
    { language: availableLanguages[0], selected: false }
  );

  return negotiationResult.language as AvailableLanguages;
}

export function languageNegotiation(
  request: FastifyRequest
): AvailableLanguages {
  const acceptLanguages = request?.headers['accept-language'] || 'en';
  const requestedLanguages = processLanguages(acceptLanguages);
  const finalLanguage = negotiate(requestedLanguages);
  return finalLanguage as AvailableLanguages;
}
```

Este código lo colocamos en su propio archivo y lo implementamos en el handler general que ya desarrollamos para entonces obtener:

```ts
import type { FastifyReply, FastifyRequest } from 'fastify';
import { generateCleanStackTrace } from './stack';
import { Exception } from './exception';
import { languageNegotiation } from './language';
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
  const language = languageNegotiation(request); // <-- Negociador agregado!
  const stack = generateCleanStackTrace(error);

  let title = 'Unhandled server error';
  let status = 500;
  let message = 'An unexpected error appeared';
  let type = 'default';
  let silent = false;

  if (error instanceof Exception) {
    silent = error.silent && productionEnv;
    const data = error.data;
    title = error.data.title[language]; // <-- Idioma agregado!
    status = error.data.status;
    type = error.data.type;
    message = injectParams(data.message[language], error.params); // <-- Idioma agregado!
  }

  const genericError = errorRegistry.getError('internal', 'default');
  const response = {
    title: silent ? genericError.title[language] : title, // <-- Idioma agregado!
    message: silent ? genericError.message[language] : message, // <-- Idioma agregado!
    status: silent ? genericError.status : status,
    stack: !productionEnv && status === 500 ? stack : undefined,
  };

  // Send error response
  reply.status(status).send(response);
  return reply;
}
```
