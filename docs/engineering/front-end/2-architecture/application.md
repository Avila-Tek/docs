---
slug: /frontend/architecture/application
title: Application layer
sidebar_position: 5
---

# Application Layer (Use-cases, Hooks & Mutations)

La capa **Application** es el **cerebro operativo** del frontend.

Es la capa que:

- conecta la **UI** con el **Domain** y la **Infrastructure**
- coordina flujos
- decide **qué pasa y en qué orden**
- maneja estados de ejecución (loading, error, success)

👉 Aquí vive la **lógica de orquestación**, no la lógica de negocio pura ni la UI.

❌ **No va aquí**

- JSX / componentes visuales (eso es UI).

- Lógica de negocio “pura” (eso es Domain: reglas, invariantes, validaciones duras).

- Detalles de red/SDKs/HTTP (eso es Infrastructure).

---

```text
application/
├── use-cases/
├── queries/
└──  mutations/
```

## Tipos de archivos en Application

### 1. Queries (React Query – lectura)

**Qué son**

Hooks basados en React Query que exponen datos listos para UI.

**Responsabilidad**

Leer datos

Manejar cache

Exponer isLoading, error, data

**Regla:** deben devolver **Domain models**, no DTOs crudos.

**Ejemplo**

```tsx
// src/features/user-profile/application/queries/useGetMe.query.ts
import { useQuery } from '@tanstack/react-query';
import UserService from '@/infrastructure/user';

export const meQuery = {
  key: () => ['me'] as const,
  queryFn: () => UserService.getMe(),
};

export function useGetMe() {
  return useQuery({
    queryKey: meQuery.key(),
    queryFn: meQuery.queryFn,
  });
}

// src/features/user-profile/application/queries/useGetUserByHandle.query.ts
import { useQuery } from '@tanstack/react-query';
import UserService from '@/infrastructure/user';

export const userByHandleQuery = {
  key: (handle?: string) => ['user', handle] as const,
  queryFn: (handle: string) => UserService.getUser(handle),
};

export function useGetUserByHandle(handle?: string) {
  return useQuery({
    queryKey: userByHandleQuery.key(handle),
    enabled: !!handle,
    queryFn: () => userByHandleQuery.queryFn(handle!),
  });
}
```

### 2.Mutations

**Responsabilidad**

Hooks basados en React Query para realizar modificaciones en la base de datos

- definir mutationFn

- manejar invalidaciones (invalidateQueries)

- devolver mutateAsync / isPending / error

```tsx
// src/features/post-replies/application/mutations/useCreateReply.mutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PostService from '@/infrastructure/post';

export type CreateReplyInput = { postId: string; replyId: string };

export function useCreateReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReplyInput) => PostService.createReply(input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['post', vars.postId] });
    },
  });
}

// src/features/post-replies/application/mutations/useSaveImage.mutation.ts
import { useMutation } from '@tanstack/react-query';
import MediaService from '@/infrastructure/media';

export function useSaveImage() {
  return useMutation({
    mutationFn: (file: File) => MediaService.saveImage(file),
  });
}

// src/features/post-replies/application/mutations/useCreatePost.mutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PostService from '@/infrastructure/post';

export type CreatePostInput = { message: string; imageId?: string };

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => PostService.createPost(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
```

### 3. Use-cases

**Qué son:**
Custom Hooks que representan una acción del usuario o un flujo (“Conectar retailer”, “Crear dashboard”, “Pagar”, etc.).

**Regla:** un use-case puede usar varias queries/mutations internas y devolver una API simple para la UI.

**Responsabilidad**

- Orquestar domain + infrastructure
- Validar reglas de alto nivel
- Retornar resultados explícitos

:::info
💡 Punto clave: Inyección de dependencias en use-cases
:::

#### Ejemplo de use-case que unifca query y mutations anteriores

```tsx
// src/features/post-replies/application/use-cases/replyToPost.usecase.ts
//
// Use-case: Reply to a post (create a reply post, optionally upload an image, then link it as a reply)
//
// Key ideas (per our Application layer rules):
// - The use-case contains flow/orchestration (not UI, not raw API details).
// - Dependencies are injected as a "dependencies object" built from Infrastructure services.
// - The use-case does NOT import Infrastructure directly.
// - The hook that injects dependencies lives next to this file (see useReplyToPost.ts).
//

// Nota: Este archivo incluye:
// 1) `dependencies` (conoce Infrastructure)
// 2) `replyToPostUseCase` (puro, sin importar Infrastructure)
// 3) `useReplyToPost` (hook de inyección)

// src/features/post-replies/application/use-cases/useReplyToPost.usecase.ts
import type { User } from '@/shared/domain/user/model';
import type { Post } from '@/shared/domain/post/model';
import type { Image } from '@/shared/domain/media/model';

import { useGetMe } from '../queries/useGetMe.query';
import { useGetUserByHandle } from '../queries/useGetUserByHandle.query';
import { useSaveImage } from '../mutations/useSaveImage.mutation';
import { useCreatePost } from '../mutations/useCreatePost.mutation';
import { useCreateReply } from '../mutations/useCreateReply.mutation';

// Domain rules (shared)
import { canUserPost } from '@/shared/domain/user/logic';

export type ReplyToPostInput = {
  postId: string;
  recipientHandle: string;
  message: string;
  files?: File[] | null;
};

export const ReplyToPostErrors = {
  NotAuthenticated: 'You must be logged in.',
  TooManyPosts: 'You have reached the maximum number of posts per day.',
  RecipientNotFound: 'The user you want to reply to does not exist.',
  AuthorBlockedByRecipient:
    "You can't reply to this user. They have blocked you.",
  UnknownError: 'An unknown error occurred. Please try again later.',
} as const;

export type ReplyToPostResult =
  | { ok: true }
  | {
      ok: false;
      error: (typeof ReplyToPostErrors)[keyof typeof ReplyToPostErrors];
    };

type Dependencies = {
  me: User | undefined;
  recipient: User | null | undefined;
  saveImage: (file: File) => Promise<Image>;
  createPost: (input: { message: string; imageId?: string }) => Promise<Post>;
  createReply: (input: { postId: string; replyId: string }) => Promise<void>;
};

// Use-case "puro": no importa Infrastructure, solo opera con dependencias ya resueltas
export async function replyToPostUseCase(
  input: ReplyToPostInput,
  deps: Dependencies
): Promise<ReplyToPostResult> {
  const { me, recipient, saveImage, createPost, createReply } = deps;

  if (!me) return { ok: false, error: ReplyToPostErrors.NotAuthenticated };
  if (!canUserPost(me))
    return { ok: false, error: ReplyToPostErrors.TooManyPosts };

  if (!recipient)
    return { ok: false, error: ReplyToPostErrors.RecipientNotFound };
  if (recipient.blockedUserIds?.includes(me.id)) {
    return { ok: false, error: ReplyToPostErrors.AuthorBlockedByRecipient };
  }

  try {
    let imageId: string | undefined;
    const file = input.files?.[0];
    if (file) {
      const image = await saveImage(file);
      imageId = image.id;
    }

    const replyPost = await createPost({ message: input.message, imageId });

    await createReply({ postId: input.postId, replyId: replyPost.id });

    return { ok: true };
  } catch {
    return { ok: false, error: ReplyToPostErrors.UnknownError };
  }
}

export function useReplyToPost(params: { recipientHandle: string }) {
  const me = useGetMe();
  const recipient = useGetUserByHandle(params.recipientHandle);

  const saveImage = useSaveImage();
  const createPost = useCreatePost();
  const createReply = useCreateReply();

  return {
    mutateAsync: (input: ReplyToPostInput) =>
      replyToPostUseCase(input, {
        me: me.data,
        recipient: recipient.data,
        saveImage: saveImage.mutateAsync,
        createPost: createPost.mutateAsync,
        createReply: createReply.mutateAsync,
      }),

    // Loading unificado (como el post)
    isLoading:
      me.isLoading ||
      recipient.isLoading ||
      saveImage.isPending ||
      createPost.isPending ||
      createReply.isPending,

    // Error de "dependencias base" (queries)
    isError: me.isError || recipient.isError,
  };
}
```

**_Como se usa lo que creeamos_**

```tsx
import { useState } from "react";

import { useGetMe } from "@/application/queries/get-me";
import { useReplyToShout } from "@/application/reply-to-shout";
import { LoginDialog } from "@/components/login-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isAuthenticated } from "@/domain/me";

...

export function ReplyDialog({
  recipientHandle,
  children,
  shoutId,
}: ReplyDialogProps) {
  const [open, setOpen] = useState(false);
  const [replyError, setReplyError] = useState<string>();
  const replyToShout = useReplyToShout({ recipientHandle });
  const me = useGetMe();

  if (me.isError || !isAuthenticated(me.data)) {
    return <LoginDialog>{children}</LoginDialog>;
  }

  async function handleSubmit(event: React.FormEvent<ReplyForm>) {
    event.preventDefault();

    const message = event.currentTarget.elements.message.value;
    const files = Array.from(event.currentTarget.elements.image.files ?? []);

    const result = await replyToShout.mutateAsync({
      recipientHandle,
      message,
      files,
      shoutId,
    });

    if (result.error) {
      setReplyError(result.error);
    } else {
      setOpen(false);
    }
  }

    ...

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* the rest of the component */}
    </Dialog>
  );
}
```
