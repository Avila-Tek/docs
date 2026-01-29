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

## Organización feature-driven

Agrupamos el código por funcionalidad de producto (un "feature"), no por tipo técnico.

Un feature es una capacidad completa para el usuario final, por ejemplo: autenticación, carrito de compras, perfil de usuario.

**Promesa:** Si eliminas `features/<feature>`, el resto de la app debe seguir compilando (esa capacidad simplemente desaparece).

### Estructura sugerida

```
src/
  app/                # Rutas de Next.js (capa fina de composición)
  features/           # Features de producto (slices verticales)
  shared/             # UI y utilidades compartidas
  lib/                # Helpers a nivel app (query client, env, config)
```


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

Utilizemos el primero (UI -> Data) con un ejemplo sencillo de login.

### UI

En esta capa encontramos los archivos que definen la UI de la pantalla.

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

### Application

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

### Domain

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

### Infrastructure

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


