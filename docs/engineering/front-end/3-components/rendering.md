---
title: Redering
sidebar_position: 2
slug: /frontend/components/rendering
---

# Rendering 


## Server and Client Components

![Server and Client Components](/img/frontend/rendering/server-client-components.PNG)


## ¿Qué son?

### Server Components

Son componentes de React que se renderizan exclusivamente en el servidor. A diferencia de los componentes tradicionales, no envían JavaScript al navegador, solo HTML y mínimo CSS necesario. Esto reduce la cantidad de código que necesita ser descargado, analizado y ejecutado en el cliente, mejorando el rendimiento.


### Client Components

Son los componentes de React convencionales que se ejecutan en el navegador del cliente. Incluyen interactividad y dinamismo, usando JavaScript en el lado del cliente.


## ¿Cómo funcionan?

### Server Components

-   Se ejecutan en el servidor durante el renderizado, generando HTML y
    CSS.
-   Pueden acceder directamente a los recursos del servidor, como bases
    de datos o sistemas de archivos.

``` tsx
import React from 'react';
import { fetchUsers } from '../lib/db';

function UserList() {
  const users = fetchUsers(); // Acceso directo a datos del servidor
  // Se puede hacer fetch allí porque solo se ejecuta una vez en el servidor y es enviado al cliente

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

export default UserList;
```


### Client Components

-   Se envían al navegador como JavaScript y permiten interacciones dinámicas.
-   Son ideales para formularios, botones, estados locales y efectos.

``` tsx
'use client';

import React from 'react';

function LikeButton() {
  const [likes, setLikes] = React.useState(0);

  return (
    <button onClick={() => setLikes(likes + 1)}>
      Like ({likes})
    </button>
  );
}

export default LikeButton;
```

## Cómo diferenciarlos


Se utiliza la directiva:

``` tsx
'use client';
```

para indicar que un componente debe ejecutarse en el cliente.

![How to differentiate](/img/frontend/rendering/how-to-differentiate.png)


## Cuándo usar cada uno

![When to use](/img/frontend/rendering/when-to-use-components.png)

### Usa Server Components cuando necesites:

-   Hacer fetch de datos
-   Acceder directamente a recursos del backend
-   Mantener información sensible en el servidor (tokens, API keys,
    etc.)
-   Reducir JavaScript en el cliente
-   Mantener dependencias pesadas del lado del servidor


### Usa Client Components cuando necesites:

-   Interactividad (`onClick`, `onChange`, etc.)
-   Estado (`useState`, `useReducer`)
-   Efectos (`useEffect`)
-   Hooks personalizados que dependan de estado
-   APIs del navegador
-   Componentes de clase de React

# Cómo estructurar mi código ahora

Divide tu código en componentes claramente definidos para el servidor y
el cliente.

-   Los componentes del servidor deben enfocarse en representación y
    carga de datos.
-   Los componentes del cliente deben enfocarse en interactividad.

El árbol de componentes de una página debe iniciar con un **Server
Component** y tener una estructura similar a esta:

![Component tree](/img/frontend/rendering/component-tree.png)

## Reglas importantes del árbol de componentes

-   Los **Server Components (S)** pueden contener:
    -   Otros Server Components
    -   Client Components
-   Los **Client Components (C)** solo pueden contener:
    -   Otros Client Components

Esto significa que puedes diseñar tu aplicación de manera que los componentes del servidor manejen la carga de datos y la representación inicial, y después integren componentes del cliente para añadir interactividad.

**Ahora bien veamos como se ve este arbol de componentes de forma visual en la vista del usuario:**

![Component tree example](/img/frontend/rendering/component-tree-example.png)

En una aplicación real:

-   Componentes de layout general como `Navbar` y `Sidebar` pueden ser
    **Server Components**, ya que es probable que sean menos dinámicos y más centrados en el contenido estático.
-   Componentes interactivos como `Search` y `Button` deben ser **Client
    Components**, ya que manejan interacciones del usuario en tiempo real.

# En resumen

-   Mantén la lógica de obtención de datos y acceso al servidor dentro
    de Server Components.
-   Utiliza Client Components para estados y eventos que dependen de la interacción del usuario.
-   Aprovecha las rutas anidadas en Next.js para estructurar tus componentes de manera jerárquica, reflejando la composición visual que las imágenes sugieren.

------------------------------------------------------------------------

# Puntos resaltantes

### Compartir datos entre componentes

En Next.js (con Server Components), puede no ser necesario usar React
Context para compartir estados, ya que está diseñado para Client Components.

En su lugar:

-   Puedes obtener los mismos datos en cada renderización del servidor.
-   Next.js optimiza las solicitudes automáticamente para evitar sobrecargas.
-   Esto evita preocuparte por duplicación de requests.

``` tsx
// Supongamos que tenemos un Server Component que necesita datos de usuario
// User.server.js
import fetchUserData from '../lib/fetchUserData';

function User(props) {
  // Obtener datos en cada renderización del servidor
  const userData = fetchUserData(props.userId);
  return (
    // ... renderiza la UI con userData
  );
}

export default User;
```

### Uso de bibliotecas de terceros

No todas las librerías están diseñadas para ejecutarse en el servidor. Para librerías que requieren el navegador (por ejemplo, un carrusel
interactivo), debes envolverlas en un Client Component:

``` tsx
// Carrusel.client.js
'use client';

import { Carousel } from 'acme-carousel';

function ClientSideCarousel(props) {
  return <Carousel {...props} />;
}

export default ClientSideCarousel;
```

### Enfoque en el rendimiento

Evita convertir todo el layout en un Client Component, eso enviaría demasiado JavaScript al navegador.

Mejor estrategia:

-   Mantener el layout principal como Server Component.
-   Extraer la lógica interactiva a pequeños Client Components.

Esto reduce el JavaScript enviado al cliente y mejora el rendimiento.

``` tsx
// Layout.server.js
import Navbar from './Navbar.server';
import SearchBar from './SearchBar.client';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <SearchBar />
      <main>{children}</main>
    </>
  );
}

export default Layout;
```

### Uso de Server Components dentro de Client Components

En algunos casos, puedes usar un Server Component dentro de un Client
Component para combinar:

-   Carga de datos en el servidor
-   Interactividad en el cliente

``` tsx
// UserProfilePage.client.js
'use client';

import UserProfile from './UserProfile.server';

function UserProfilePage(props) {
  return (
    <div>
      <UserProfile userId={props.userId} />
      {/* Otros Client Components */}
    </div>
  );
}

export default UserProfilePage;
```

