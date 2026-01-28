---
slug: /frontend/architecture/intro
title: Folder structure
sidebar_position: 1
---

<!-- # 1. Architecture

En esta sección explicamos **el modelo mental único** que usamos para estructurar todo el frontend.

El objetivo no es memorizar carpetas, sino **entender responsabilidades**.

## Capas

Nuestra arquitectura se basa en el paradigma de Clean Architecture, sin emabrgo como React fue conceptualizado para la programación funcional y de otra manera de abstraen ciertos conceptos.

![clean-architecture](/img/frontend/architecture/clean-architecture.jpeg)

Para entender un poco de Clean Architecture se suguieren las siguientes fuentes:

Tambien es necesario reforzar conceptos de los principios S.O.L.I.D.

Ahora bien, nuestra arquitectura se organiza en **cuatro capas**, ordenadas de afuera hacia adentro: -->



<!-- (Sí, se volteo la piramide, es que siento que la capa mas superfical que es la UI es la ve el usuario jeje)

Piensa en esto como un **flujo de dependencia**:

- Las capas de abajo **pueden usar** las de arriba
- Las capas de arriba **no saben que existen** las de abajo
- Excepto el Domain que es la Base dd -->

<!-- ## Feature Driven

Se propone una arquitectura feature-driven organiza el código alrededor de funcionalidades del producto, no alrededor de tipos técnicos globales.

En lugar de tener carpetas globales como:

```tsx
components/
services/
hooks/
api/
```

se agrupa todo lo necesario para una funcionalidad concreta dentro de una misma carpeta.

En nuestro contexto, un **feature** no es una entidad del dominio (User, Product, Order).

Un **feature** es una **funcionalidad completa** que el usuario entiende, por ejemplo:

- **Auth**: login / logout
- **Onboarding**: completar perfil
- **Feed**: ver el timeline
- **Create Post**: crear una publicación
- **Post Details**: ver una publicación + comentarios
- **Search**: buscar
- **Settings**: editar preferencias
- **Users Management**: listar usuarios + editar rol

```tsx
features/
    auth/
    onboarding/
    createPost/
    postDetails/
```

:::info
Si borras features/create-post, el resto de la app sigue compilando.
Lo único que cambia es que ya no existe ese flujo/ruta.
:::

Cada feature es una unidad vertical completa, con cada una de las capas si así lo requiere.

Esto permite entender, modificar y escalar una funcionalidad sin tener que navegar todo el proyecto. -->
## Primeros pasos

Si no tienes experiencia previa con **Clean Architecture** o **Feature Driven Development**, te recomiendo empezar por la documentación de la arquitectura [aquí](/docs/frontend/architecture).

### Ejemplo básico con app

Para mayor contexto esta aplicación es una plataforma social tipo feed (estilo micro-blogging) donde los usuarios pueden:

- Ver un feed de publicaciones (shouts) con usuarios e imágenes relacionadas
- Visitar perfiles de usuario por handle
- Crear publicaciones y responder a otras publicaciones
- Subir imágenes asociadas a publicaciones o respuestas

```text

src/
├── app/                          # Next.js App Router pages and layouts
├── features/                     # Módulos de funcionalidades
│   ├── auth/                     # 🔒 Módulo de autenticación
│   │   ├── ui/                   # ── Componentes de la UI
│   │   ├── application/          # ── Lógica de negocio
│   │   ├── domain/               # ── Modelos y lógica de negocio
│   │   └── infrastructure/       # ── Implementación de la lógica de negocio
│   └── posts/                    # 📣 Módulo de publicaciones
│       ├── ui/                   # ── Componentes de la UI
│       ├── application/          # ── Lógica de negocio
│       ├── domain/               # ── Modelos y lógica de negocio
│       └── infrastructure/       # ── Implementación de la lógica de negocio
├── shared/           
│   ├── domain/                   # ── Modelos y lógica de negocio compartido
│   ├── features/                 # ── Módulos de funcionalidades compartidas
│   │   └── upload-media/         # 📸 Módulo de subida de medios
│   │       ├── ui/               # ── Componentes de la UI
│   │       ├── application/      # ── Lógica de negocio
│   │       ├── domain/           # ── Modelos y lógica de negocio
│   │       └── infrastructure/   # ── Implementación de la lógica de negocio
│   ├── infra/                    # ── Infraestructura compartida
│   └── ui/                       # ── Componentes de la UI compartidos
├── lib/                          # 💡 Utilidades (formatter, random, etc)
```

### ¿Qué es cada carpeta?

#### 📂 app/
Contiene las páginas y layouts de la aplicación

#### 📂 features/
Contiene los módulos de funcionalidades

#### 📂 shared/
Contiene los módulos de funcionalidades compartidas

#### 📂 lib/
Contiene las utilidades

## How to read this documentation

Aunque casi ninguna documentación lo dice explícitamente, hay **dos formas comunes** de construir frontend:

1. **De UI → Data**  
   Empiezas por pantallas/componentes y vas bajando: UI → Application → Domain → Infrastructure.

2. **De Data → UI**  
   Empiezas por el acceso a datos y contratos y vas subiendo: Infrastructure → Domain → Application → UI.

En esta guía, la documentación está organizada principalmente **de Data → UI** (de abajo hacia arriba), porque:

- primero definimos contratos y límites (infra/schemas)
- luego cómo se modela y valida (domain)
- después cómo se orquesta (application)
- y finalmente cómo se presenta (ui)

:::note Importante
Esto **no significa** que tú debas programar siempre en ese orden.

Puedes leer (y construir) las capas en el orden que tenga más sentido para tu tarea:

- Si estás trabajando desde un diseño o una pantalla, probablemente empieces en **UI**.
- Si estás integrando un endpoint o cambiaron contratos, probablemente empieces en **Infrastructure**.
  :::

La regla que no cambia es que, sin importar el orden en que empieces a construir, **se deben respetar las reglas de dependencias/imports entre capas**.

### Ejemplo de folder structure

Para mayor contexto esta aplicación es una plataforma social tipo feed (estilo micro-blogging) donde los usuarios pueden:

- Ver un feed de publicaciones (shouts) con usuarios e imágenes relacionadas

- Visitar perfiles de usuario por handle

- Crear publicaciones y responder a otras publicaciones

- Subir imágenes asociadas a publicaciones o respuestas

```text
src/
  app/
    layout.tsx
    globals.css
    error.tsx
    not-found.tsx
    (routes)/
      feed/
        page.tsx                    # → delega a features/view-feed
      users/
        [handle]/
          page.tsx                  # → delega a features/view-user-profile
      posts/
        create/
          page.tsx                  # → delega a features/create-post
        [postId]/
          reply/
            page.tsx                # → delega a features/reply-to-post
  features/
    view-feed/                        # FEATURE: Ver feed de publicaciones
      ui/
        pages/
          FeedPage.tsx
        widgets/
          FeedWidget.tsx
        components/
          FeedHeader.tsx
          FeedFilters.tsx
      application/
        queries/
          useFeed.query.ts
      domain/
        feed.model.ts
        feed.logic.ts
      infrastructure/
        feed.dto.ts
        feed.transform.ts
        feed.service.ts
    view-user-profile/                # FEATURE: Ver perfil de usuario
      ui/
        pages/
          UserProfilePage.tsx
        widgets/
          UserProfileWidget.tsx
        components/
          UserAvatar.tsx
          UserStats.tsx
      application/
        queries/
          useUserProfile.query.ts
          useCurrentUser.query.ts
      domain/
        userProfile.model.ts
        userProfile.logic.ts
      infrastructure/
        user.dto.ts
        user.transform.ts
        user.service.ts
    create-post/                      # FEATURE: Crear publicación
      ui/
        pages/
          CreatePostPage.tsx
        widgets/
          CreatePostFormWidget.tsx
          UploadPreviewWidget.tsx
        components/
          PostEditor.tsx
          SubmitPostButton.tsx
      application/
        mutations/
          useCreatePost.mutation.ts
        hooks/
          useCreatePostForm.ts
      domain/
        postCreation.model.ts
        postCreation.logic.ts
      infrastructure/
        post.dto.ts
        post.transform.ts
        post.service.ts
    reply-to-post/                 # FEATURE: Responder a una publicación
      ui/
        pages/
          ReplyToPostPage.tsx
        widgets/
          PostThreadWidget.tsx
          ReplyComposerWidget.tsx
        components/
          PostCard.tsx
          ReplyDialog.tsx
      application/
        use-cases/
          replyToPost.usecase.ts
          replyToPost.errors.ts
        hooks/
          useReplyToPost.ts
        mutations/
          useCreateReply.mutation.ts
      domain/
        reply.model.ts
        reply.logic.ts
      infrastructure/
        reply.dto.ts
        reply.transform.ts
        reply.api.ts
  shared/
    features/
      upload-media/
          # FEATURE: Subida de imágenes (se utiliza en varios lugares)
      application/
        mutations/
          useUploadImage.mutation.ts
      domain/
        media.model.ts
        media.logic.ts
      infrastructure/
        media.dto.ts
        media.transform.ts
        media.api.ts
        media.repository.ts
    domain/ # DOMAMAIN GENERAL - Las tablas de la base de datos plain
      user.ts
      post.ts
      media.ts
      pagination.ts
    ui/
      # UI reutilizable
    infra/
      http/
        apiClient.ts
        http.errors.ts
    lib/
      format.ts
      assert.ts
```
