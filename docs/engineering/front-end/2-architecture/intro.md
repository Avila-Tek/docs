---
slug: /frontend/architecture/intro
title: Folder structure
sidebar_position: 1
---

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
│   ├── layout.tsx                # ── Layout global
│   ├── globals.css               # ── Estilos globales
│   ├── error.tsx                 # ── Componente de error
│   ├── not-found.tsx             # ── Componente de no encontrado
│   └── (auth)/                   # ── Rutas de autenticación
│         ├── layout.tsx          # ── Layout de autenticación
│         ├── login/
│         │    └── page.tsx       # ── Página de login
│         └── register/
│              └── page.tsx       # ── Página de registro
│
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
│
├── shared/           
│   ├── hooks/                    # ── Hooks compartidos
│   ├── features/                 # ── Módulos de funcionalidades compartidas
│   │   └── upload-media/         # 📸 Módulo de subida de medios
│   │       ├── ui/               # ── Componentes de la UI
│   │       ├── application/      # ── Lógica de negocio
│   │       ├── domain/           # ── Modelos y lógica de negocio
│   │       └── infrastructure/   # ── Implementación de la lógica de negocio
│   ├── domain/                   
│   │   ├── user.ts               # ── Modelo y lógica de usuario compartida
│   │   ├── media.ts              # ── Modelo y lógica de media compartida
│   │   └── pagination.ts         # ── Modelo y lógica de paginación compartida
│   ├── infrastructure/           
│   │   └── http/                 
│   │       ├── api.ts            # ── Implementación del cliente http
│   │       └── http.errors.ts    # ── Implementación de errores http
│   │                      
│   └── ui/                       # 💄 Componentes de la UI compartidos
│       ├── components/
│       ├── widgets/
│       ├── pages/
│       └── layouts/
│
└── lib/                          # 💡 Configuración de librerias
      ├── dayjsConfig/
      ├── sentry/
      └── reactQuery/
```

### ¿Qué es cada carpeta?

#### 📂 app/
Contiene las páginas y layouts de la aplicación

#### 📂 features/
Contiene los módulos de funcionalidades, esta carpeta támbien puedes encontrarla dentro de [shared/](/docs/frontend/architecture/shared).  

- Aquí es donde esta la magia, podemos dividir la app en funcionalidades completas donde cada una tiene su propia capa de lógica de negocio, componentes, modelos y como estructuramos la data para pasarla a la UI.


#### 📂 shared/
Contiene los módulos de funcionalidades compartidas

- Podemos colocar componentes, modelos, lógica de negocio, etc que se usen en varias funcionalidades dentro de la app.

#### 📂 lib/
Contiene las configuraciones de librerias utilizadas por esa app.

<!-- 

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
``` -->
