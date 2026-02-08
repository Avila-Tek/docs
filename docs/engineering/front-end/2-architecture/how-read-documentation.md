---
slug: /frontend/architecture/how-read-documentation
title: How to read this
sidebar_position: 2
---

## Capas (de afuera → adentro)

| Capa               | Responsabilidad                                      |
| ------------------ | ---------------------------------------------------- |
| **UI**             | Pantallas/componentes (renderizado y estado visual)  |
| **Application**    | Orquestación (use-cases, hooks de React Query)       |
| **Domain**         | Lenguaje de negocio (modelos + reglas puras)         |
| **Infrastructure** | API/servicios, transformación de DTOs, técnicos      |

**Dirección de dependencias** (permitida):

```
UI → Application → Domain → Infrastructure
```

> ⚠️ **Nunca** importes en la dirección opuesta (excepto desde domain).

<!-- ## Organización feature-driven

Agrupamos el código por funcionalidad de producto (un "feature"), no por tipo técnico.

Un feature es una capacidad completa para el usuario final, por ejemplo: autenticación, carrito de compras, perfil de usuario.

**Promesa:** Si eliminas `features/<feature>`, el resto de la app debe seguir compilando (esa capacidad simplemente desaparece). -->

<!-- ### Estructura sugerida

```
src/
  app/                # Rutas de Next.js (capa fina de composición)
  features/           # Features de producto (slices verticales)
  shared/             # UI y utilidades compartidas
  lib/                # Helpers a nivel app (query client, env, config)
``` -->


## Cómo construir el front

Aunque casi ninguna documentación lo dice explícitamente, hay **dos formas comunes** de construir frontend:

### 1. De UI → Data

- Empiezas por pantallas/componentes y vas bajando: UI → Application → Domain → Infrastructure.

### 2. De Data → UI

- Empiezas por el acceso a datos y contratos y vas subiendo: Infrastructure → Domain → Application → UI.

--- 

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

## Ejemplo

Vamos a ver el flujo de **UI → Data** con el ejemplo de login, que es una de las rutas principales de la aplicación, ya que seguramente sea una de las primeras que veas al empezar a trabajar en el proyecto.

### 1. UI

Queremos que se pueda observar la separacion de componentes por features.

```tsx
// apps/client/src/app/(auth)/login/page.tsx

export const metadata: Metadata = {
  title: 'Sign In | HabitFlow',
  description:
    'Sign in to your HabitFlow account and continue building great habits.',
};

export default function LoginRoute() {
  return <LoginPage />;  // <-- ℹ️ features/auth/ui/pages/
}
```

```tsx
// apps/client/src/features/auth/ui/pages/LoginPage.tsx

'use client';

export function LoginPage() {
  return <LoginForm />; // <-- ℹ️ features/auth/ui/widgets/
}

```

```tsx
// apps/client/src/features/auth/ui/widgets/LoginForm.tsx

export function LoginForm() {
  const [tagline] = React.useState(() => getRandomTagline('login')); // <-- ℹ️ features/auth/domain/

  const router = useRouter();
  const signIn = useSignIn(); // <-- ℹ️ features/auth/application/

  const methods = useForm<TLoginForm>({
    defaultValues: loginDefaultValues(), // <-- ℹ️ features/auth/infrastructure/
    resolver: zodResolver(loginFormDefinition), // <-- ℹ️ features/auth/infrastructure/
  });

  async function onSubmit(data: TLoginForm) {
    if (signIn.isPending) {
      return;
    }
    const result = await signIn.mutateAsync(data);
    if (result.success) {
      router.push('/dashboard');
    }
  }

  return (
    <AuthCard>
      <div className="space-y-4">
        <GoogleLoginButton />
        <AuthDivider text="o" />
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <LoginFormContent
              disabled={signIn.isPending}
              error={signIn.error}
            />
          </form>
        </FormProvider>
      </div>
    </AuthCard>
  );
}

```
---

### 2. Application

En esta capa encontramos los archivos que orquestan los casos de usos, hooks, queries y mutaciones.

```tsx
// apps/client/src/features/auth/application/useCases/login.useCase.ts

export function useSignIn() {
  const signInMutation = useSignInMutation(); // <-- ℹ️ features/auth/application/mutations/

  return {
    mutateAsync: (input: TLoginForm) =>
      signInUseCase(input, {
        signIn: signInMutation.mutateAsync,
      }),
    isPending: signInMutation.isPending,
    error: signInMutation.error,
  };
}
```

```tsx
// apps/client/src/features/auth/application/mutations/useLogin.mutation.ts

export function useSignInMutation() {
  return useMutation<Session, Error, TSignInInput>({
    mutationKey: ['auth', 'signIn'],
    mutationFn: (input) => AuthService.signIn(input), // <-- ℹ️ features/auth/infrastructure/
  });
}

 ```

```tsx
// apps/client/src/features/auth/infrastructure/services/auth.service.ts

export const AuthService = new AuthServiceClass(api.v1.auth);
```

```tsx
// apps/client/src/features/auth/infrastructure/auth.service.ts

export class AuthServiceClass {
  constructor(private api: AuthApi) {}

  async signIn(input: TSignInInput): Promise<Session> {
    const result = await this.api.signIn(input);
    if (!result.success) {
      throw new Error(result.error);
    }
    return toSessionDomain(result.data);
  }
}
```

---

### 3. Domain

En esta capa encontramos los archivos que definen el lenguaje de negocio.

 ```tsx
// apps/client/src/features/auth/domain/auth.logic.ts

export function getRandomTagline(page: keyof typeof authTaglines): string {
  const taglines = authTaglines[page];
  const index = Math.floor(Math.random() * taglines.length);
  return taglines[index] ?? taglines[0];
}
```
---

### 4. Infrastructure

En esta capa encontramos los archivos que definen la infraestructura como servicios, transformación de DTOs, validaciones y contratos.

```tsx
// apps/client/src/features/auth/infrastructure/auth.dto.ts

/**
 * Login form
 */
export const loginFormDefinition = z.object({
  email: emailValidation,
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type TLoginForm = z.infer<typeof loginFormDefinition>;

export function loginDefaultValues(): TLoginForm {
  return {
    email: '',
    password: '',
  };
}
```

---

<!-- <video width="100%" controls>
  <source src="/video/frontend/shared-api-client.mp4" type="video/mp4"><source/>
  Your browser does not support the video tag.
</video> -->
![](https://youtu.be/yKNxeF4KMsY)

## Turborepo como nos ayuda

Anteriormente ya vimos como estructurar de manera correcta las carpetas de cada feature, ahora veremos como turborepo nos ayuda a gestionar las dependencias entre ellas.

### packages/schemas

Veamos primer que tenemos en un schema como el de usuario.

```text
user/
  user.doc.ts
  user.dto.ts
  user.schema.ts
  index.ts
```

#### 1. user.schema.ts

Definicion basica de la interfaz del usuario.

```ts
export const userSchema = z.object({
  id: z.uuid(),
  email: z.email().min(5),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  timezone: z.string(),
  status: userStatusSchema,
  createdAt: zDateToIsoNullableOpt,
  updatedAt: zDateToIsoNullableOpt,
});

export type TUser = z.output<typeof userSchema>;
```

#### user.dto.ts

Creacion de inputs y outputs, esto nos ayuda tanto en el backend como en las `<feature>/application/` o `<feature>/infrastructure/` del frontend. 

```ts
export const createUserInput = z.object({
  email: z.email(),
  password: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type TCreateUserInput = z.infer<typeof createUserInput>;
```

#### user.doc.ts

Creacion de documentacion para la API con swagger, es bueno saber como la api genera su documentacion.

```ts
  createOne: {
    summary: 'Create user',
    description: 'Create user',
    tags: ['users'],
    body: createUserInput,
    response: {
      200: userSchema,
    },
  },
```

:::note 
Seguramente no sea tan comun que el frontend haga cambios en `packages/schemas`, pero es bueno saber como compartimos **schemas** y **dto's** entre aplicaciones con **turborepo**.
:::

---

### packages/services

El servicio de usuario quedaria de la siguiente manera:

```text
components/
  user.service.ts
api.ts
```

#### services/user.service.ts

Declaramos los metodos que se extenderan en nuestra `infraestructure/api.ts` utilizando `packages/services/api.ts`.

```ts
export const UserService = {
  // ...
  async create(
    input: TCreateUserInput,
    config?: TRequestConfig
  ): Promise<Safe<TUser>> {
    const response = await safeFetch(
      new URL(`${this.baseUrl}/v1/users/create`),
      { body: JSON.stringify(input) }
    );
    // parse logic ...
    return response;
  }
};
```

#### services/api.ts

En este archivo declaramos la interface de los servicios que se utilizaran en la aplicacion.

```ts
export type APIService = {
  users: UserService;
  // others services ...
};

export class API {
  public v1: APIService;

  constructor(private config: APIConfig) {
    this.v1 = Object.freeze({
      users: new UserService(this.config.baseURL, this.config.token),
      // others services ...
    });
  }
}
```

<!-- ## Que nos queda ? -->

