---
title: Pruebas E2E
sidebar_position: 3
slug: /frontend/quality/testing/e2e-testing
---

# Pruebas E2E

## 🔎 Overview

Las pruebas E2E verifican el flujo completo de una aplicación de principio a fin, simulando escenarios de usuario reales. Aseguran que todos los componentes del sistema (frontend, backend, base de datos, etc.) funcionen correctamente juntos.

Para realizar estas pruebas, uno de los frameworks más famosos es **Cypress**. Se enfoca en hacer las pruebas más rápidas, fáciles y confiables.

### Beneficios de Cypress

- **Fácil de usar**: Sintaxis sencilla y documentación clara, lo que facilita la escritura y comprensión de las pruebas.
- **Rápido**: Ejecuta las pruebas directamente en el navegador, lo que acelera el proceso de desarrollo y retroalimentación.
- **Confiable**: Proporciona un entorno de prueba consistente y aislado, lo que reduce la posibilidad de resultados falsos.
- **Debugging sencillo**: Permite depurar las pruebas directamente en el navegador, lo que facilita la identificación y solución de problemas.
- **Comunidad activa**: Cuenta con una gran comunidad y documentación en línea, lo que facilita la búsqueda de ayuda y recursos.

## 🛠️ Implementación

Para implementar pruebas E2E utilizando Cypress, podemos referirnos a la [documentación de Nextjs](https://nextjs.org/docs/pages/building-your-application/testing/cypress).

### Principios para la implementación
Nuestra estrategia se basa en el principio de separación de responsabilidades.
- Los archivos de prueba (*.cy.ts) definen el qué (el flujo de negocio) y delegan el cómo (interacciones con el DOM, selección de elementos) a Component Objects o Page Objects.
- El atributo `data-cy` es el único contrato entre la aplicación y las pruebas. Es estable y está desacoplado de estilos o estructura del DOM.
- Los Component Objects encapsulan la lógica de un componente reutilizable (ej: un formulario, un modal de confirmación), permitiendo que su lógica de prueba se escriba una sola vez.


### Estructura del proyecto
Comenzamos con la carpeta **cypress** en la ruta `/apps/<app>`, donde también se encuentra el archivo `cypress.config.ts`.

![App root directory with Cypress folder](/img/frontend/code-blocks/e2e_app-directory.png)

La estructura de carpetas dentro de `apps/admin/cypress/`, para este caso, está definida de la siguiente manera para mantener el orden y la claridad.

```
apps/admin/cypress/
├── downloads/                      // Archivos descargados durante la ejecución de los tests
├── e2e/
│   └── instructors/
│       └── createInstructor.cy.ts  // Pruebas de flujos
├── fixtures/
│   ├── credentials.json
│   └── instructor.json             // Datos de prueba estáticos
├── support/
│   ├── componentObjects/
│   │   └── InstructorFormComponentObject.ts // Lógica de componentes reutilizables
│   ├── pageObjects/
│   │   └── SignInPageObject.ts     // Lógica de páginas completas
│   ├── commands.ts                 // Comandos de Cypress personalizados
│   └── e2e.ts                      // Configuración global de soporte
└── constants/
    ├── cypressUrl.constants.ts     // URLs y rutas
    └── selectors.ts                // (Propuesta) Centralización de selectores data-cy
```


Donde cada directorio corresponde a lo siguiente:


- `e2e/`: Cada archivo representa un flujo de usuario completo (ej: createInstructor.cy.ts). Los nombres deben ser descriptivos (verbo-sustantivo).


- `fixtures/`: Almacena datos JSON estáticos que simulan el input del usuario o respuestas de API.

  :::info Para archivos con información delicada, lo ideal es agregar al gitignore del proyecto la ruta de dichos archivos, o tenerla como variables de entorno, según sea el caso.

  ![Git ignore](/img/frontend/code-blocks/e2e_gitignore.png)
  :::


- `support/componentObjects/`: Cada archivo aquí maneja las interacciones de un componente específico y autocontenido, como un formulario.


- `support/pageObjects/`: Estos archivos van a agrupar en clases las funciones que se requieran en una página. Posteriormente, en los archivos de los tests, vamos a crear una instancia de la clase que necesitemos y vamos a usar los métodos de la clase.


- `constants/`: Almacena constantes para evitar "magic strings", principalmente URLs y selectores.

Por otro lado, en `cypress.config.ts`, costumizamos la configuración de nuestros tests. En el siguiente ejemplo, se configuró el timeout de los comandos para ser de 5s:

```typescript
import { defineConfig } from "cypress";

export default defineConfig({
  defaultCommandTimeout: 5000,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```


### Casos de uso

#### Flujo de inicio de sesión

```typescript
// SignInPage.ts

export default class SignInPage {
  signIn(email: string, password: string) {
    // fill inputs
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);

    // click on sign in button
    cy.get('button[type="submit"]').click();
  }
}
```


```typescript
// signIn.cy.ts

import SignInPage from '../support/pageObjects/SignInPage';

describe('Sign In', () => {
  var data;

  // get credentials to sign in
  before(() => {
    cy.fixture('credentials').then((credentials) => {
      data = credentials;
    });

  });
  
  it('should log in with email and password', () => {
    const signInPage = new SignInPage();

    cy.visit('http://localhost:3001');

    // click on sign in button in navbar
    cy.get('[data-cy="nav-signin-btn"]').click();

    // wait for page to load
    cy.wait(5000);

    // sign in
    signInPage.signIn(data.email, data.password);
    
  });
});
```


#### Flujo de creación de instructor
```typescript
// InstructorFormComponentObject.ts

import { BASE_APP_URL, BASE_URL } from '../../constants/cypressUrl.constants';
import SignInPageObject from '../pageObjects/SignInPageObject';
import { UploadImageComponentObject } from './UploadImageComponentObject';

export class InstructorFormComponentObject {
 loginAndNavigateToCreateInstructor(email: string, password: string) {
  cy.visit(BASE_URL);
  const signInObject = new SignInPageObject();

  if (email === undefined || password === undefined) {
   throw new Error('Credentials not found');
  }

  signInObject.signIn(email, password);

  cy.wait(4000);

  cy.visit(`${BASE_APP_URL}/cima/instructors/create`);

  cy.wait(1000);
 }

 fillInstructorFormBasicInformation(
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
 ) {
  const randomNumber = Math.floor(Math.random() * 1000000000);
  const newEmail = `${randomNumber}${email}`;

  cy.get('[data-cy="input-dni"]').type(randomNumber.toString());
  cy.get('[data-cy="input-firstName"]').type(firstName);
  cy.get('[data-cy="input-lastName"]').type(lastName);
  cy.get('[data-cy="input-email"]').type(newEmail);
  cy.get('.iti__tel-input').each(($el) => {
   cy.wrap($el).type(phone, { force: true });
  });
 }

 submitForm() {
  cy.get('[data-cy="section-footer-confirmation-button"]').click();
  cy.get('[data-cy="confirmation-modal-continue-button"]').click();
  cy.wait(5000);
 }
}
```


```typescript
// createInstructor.cy.ts

import { InstructorFormComponentObject } from '../../support/componentObjects/InstructorFormComponentObject';

describe('Create an instructor', () => {
 let credentials: any;
 let instructor: any;

 before(() => {
  cy.fixture('credentials').then((jsonCredentials) => {
   credentials = jsonCredentials;
  });

  cy.fixture('instructor').then((jsonInstructor) => {
   instructor = jsonInstructor;
  });
 });

 it('should create an instructor', () => {
  const instructorFormObject = new InstructorFormComponentObject();

  instructorFormObject.loginAndNavigateToCreateInstructor(
   credentials.email,
   credentials.password
  );

  instructorFormObject.fillInstructorFormBasicInformation(
   instructor.firstName,
   instructor.lastName,
   instructor.email,
   instructor.phone,
   instructor.image
  );
  instructorFormObject.submitForm();
 });
});
```



### Convenciones y buenas prácticas
- **Evitar `cy.wait()` arbitrarios:** Las esperas fijas `cy.wait(4000)` son una fuente de inestabilidad. Deben ser reemplazadas por aserciones que esperen a que el estado de la UI se actualice.
  - ❌: `cy.wait(4000); cy.visit(...);`
  - ✅: `cy.get('[data-cy="profile-menu"]').should('be.visible').click()`
- **Nombres descriptivos:** Los métodos en componentObjects y pageObjects deben reflejar acciones de negocio (fillBasicInfo, submitAndExpectSuccess), no acciones del DOM (clickButton1).
- **Aserciones claras:** Cada it() debe probar una sola cosa y terminar con una aserción clara que valide el resultado esperado (`cy.url().should(...)`, `cy.contains(...).should('be.visible')`).
- **Atributo `data-*`:** Estos atributos dan contexto a tus selectores y los aislan de los demás cambios realizados en el código.

Para leer otras buenas prácticas recomendadas por el equipo de Cypress, ingresa a esta página: **🔗[Buenas prácticas](https://docs.cypress.io/app/core-concepts/best-practices)**.

### Comandos útiles
```typescript
// ir a una página
cy.visit(url)

// obtener elemento por id
cy.get('#idDelElemento')

// escribir en un elemento obtenido por id
cy.get('#id').type('texto que se quiere escribir en el elemento')

// conseguir elemento que contenga ese texto
cy.contains('texto')

// esperar 2 segundos
cy.wait(2000)

// se ejecuta una vez antes que todo el resto del código
before(function() {
    // carga info del archivo
    cy.fixture('nombreDelArchivoJson').then(function(data) {
      // la guarda en "this.data" para que esté disponible en todo el archivo
        this.data = data;
    })
}
```

:::tip S10 de curso E2E: Flujo de testing E2E en ecommerce
:::

### Centralización de selectores
Cuando un proyecto crece, tener `data-cy="input-firstName"` esparcido como "cadenas mágicas" por todo el código se vuelve insostenible. Por esto, buscamos centralizar y localizar estos selectores para que actúen como un "contrato" entre nuestra aplicación y las pruebas. Esto nos da una única fuente de verdad (Single Source of Truth) y facilita el refactorizado.

La implementación se haría de la siguiente forma:

#### Paso 1: Crear el archivo central de selectores


Crearemos un archivo en `apps/admin/cypress/constants/selectors.ts`, por ejemplo. Este archivo exportará un objeto que agrupa los selectores por componente o página, haciéndolo organizado y fácil de navegar. Así se vería el archivo:

```typescript

// cypress/constants/selectors.ts

export const selectors = {
  // Selectores para el formulario de Instructor
  instructorForm: {
    dniInput: 'input-dni',
    firstNameInput: 'input-firstName',
    lastNameInput: 'input-lastName',
    emailInput: 'input-email',
    phoneInput: '.iti__tel-input', // También manejamos selectores no-cy aquí (caso third-party libraries)
    submitButton: 'section-footer-confirmation-button',
  },

  // Selectores para el modal de confirmación
  confirmationModal: {
    continueButton: 'confirmation-modal-continue-button',
  },
  
  // Selectores para la barra de navegación, etc.
  navBar: {
    dashboardLink: 'navbar-dashboard-link',
    profileDropdown: 'navbar-profile-dropdown',
  },
};

```


#### Paso 2: Usar los selectores en los componentes
En lugar de escribir el nombre del selector directamente en el código, importamos el objeto de selectores. Esto se aplicaría a todos nuestros componentes en apps/admin/src/.

```typescript
import React from 'react';
import { selectors } from '../../../cypress/constants/selectors'; 

function InstructorForm() {
  return (
    <form>
      <input
        type="text"
        placeholder="First Name"
        data-cy={selectors.instructorForm.firstNameInput} // <-- Uso centralizado
      />
      <input
        type="text"
        placeholder="Last Name"
        data-cy={selectors.instructorForm.lastNameInput} // <-- Uso centralizado
      />
      {/* ... más inputs */}
    </form>
  );
}
```

#### Paso 3: Usar los selectores en las pruebas
Los Component Objects/Page Objects importarán el mismo archivo. Para hacer las pruebas aún más limpias, crearemos un comando personalizado (cy.getByCy()).

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('getByCy', (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});
```


Y para habilitar el autocompletado y la seguridad de tipos, añadimos su definición en cypress/support/index.d.ts:

```typescript
// cypress/support/index.d.ts
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.getByCy('submit')
     */
    getByCy(value: string): Chainable<JQuery<HTMLElement>>;
  }
}

```

Ahora, con el archivo de selectores y el comando personalizado, nuestro Component Object se vuelve mucho más limpio, robusto y fácil de mantener. Esta sería la versión refactorizada de la prueba:

```typescript
import { selectors } from '../../constants/selectors';
// ...otras importaciones

export class InstructorFormComponentObject {
  // ... (método loginAndNavigateToCreateInstructor)

  fillInstructorFormBasicInformation(
    firstName: string,
    lastName: string,
    email: string,
    phone: string
  ) {
    // ...
    cy.getByCy(selectors.instructorForm.dniInput).type(randomNumber.toString());
    cy.getByCy(selectors.instructorForm.firstNameInput).type(firstName);
    cy.getByCy(selectors.instructorForm.lastNameInput).type(lastName);
    cy.getByCy(selectors.instructorForm.emailInput).type(newEmail);
    cy.get(selectors.instructorForm.phoneInput).each(($el) => {
      cy.wrap($el).type(phone, { force: true });
    });
  }

  submitForm() {
    cy.getByCy(selectors.instructorForm.submitButton).click();
    cy.getByCy(selectors.confirmationModal.continueButton).click();
  }
}
```

#### Ventajas
- Fuente Única de Verdad (DRY): No repetimos cadenas. Si un selector cambia, se actualiza en un solo lugar.
- Mantenibilidad: Las pruebas y los componentes se mantienen sincronizados. Refactorizar es seguro y rápido.
- Autocompletado y Seguridad de Tipos: El editor nos ayuda a encontrar selectores y evitar errores de tipeo.
- Descubrimiento: Cualquier desarrollador puede consultar selectors.ts para ver todos los "puntos de anclaje" disponibles para las pruebas.
- Claridad: Las pruebas se centran en el comportamiento, no en los detalles de implementación del selector.


## 📚 Recursos
- [Cypress Documentation](https://docs.cypress.io/app/get-started/why-cypress)
- [Testing: Cypress | Next.js](https://nextjs.org/docs/pages/guides/testing/cypress)
- [Cypress Documentation | Writing your first end to end test](https://docs.cypress.io/app/end-to-end-testing/writing-your-first-end-to-end-test)
- [Best Practices](https://docs.cypress.io/app/core-concepts/best-practices)
- [Testing an Ecommerce Web Component using Cypress](https://odagora.com/posts/testing-an-ecommerce-web-component-using-cypress/)
- [How to structure a big project in Cypress](https://filiphric.com/how-to-structure-a-big-project-in-cypress)