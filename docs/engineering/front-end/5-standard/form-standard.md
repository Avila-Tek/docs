---
slug: /frontend/standards/forms
title: Formularios
sidebar_position: 8
---

## Trabajando con formularios

Para manejar formularios utilizamos [React Hook Form](https://react-hook-form.com/) con [Zod](https://zod.dev/) como validador a través de `@hookform/resolvers/zod`.

### Estructura de un formulario

Cada formulario se compone de **tres piezas** distribuidas en las capas de la arquitectura:

| Archivo | Capa | Responsabilidad |
|---|---|---|
| `<feature>.form.ts` | Domain | Schema Zod, tipo inferido y factory de default values |
| `<Name>Form.tsx` | UI / widgets | Inicializa `useForm`, conecta el mutation y envuelve con `FormProvider` |
| `<Name>FormContent.tsx` | UI / widgets | Renderiza los inputs y consume el form context |

```text
features/user-profile/
  domain/
    profile.form.ts           ← schema + tipo + defaults
  ui/
    widgets/
      ProfileForm.tsx          ← useForm + mutation + FormProvider
      ProfileFormContent.tsx   ← inputs + errores
```

**¿Por qué separar Form y FormContent?**

- El **Form** maneja la lógica de configuración del formulario (schema, defaults, submit, mutation). No renderiza inputs.
- El **FormContent** solo se encarga de renderizar campos y mostrar errores. Consume el contexto de React Hook Form con `useFormContext`.
- Esto permite reutilizar el FormContent en distintos contextos (modales, páginas, steppers) sin duplicar la lógica del form.

---

### Definición del formulario

Declarar el schema Zod, el tipo inferido y la factory de valores por defecto en un archivo `.form.ts` dentro del **domain** del feature. Para más detalles sobre esto, consulta la [documentación del Domain layer](/docs/frontend/architecture/domain#3-formts-form-schemas--types).

```ts
// 📁 /apps/features/user-profile/domain/profile.form.ts
import { z } from "zod";
import { TUser } from "@/shared/domain/user/model";

// Schema Zod
export const profileFormDefinition = z.object({
  username: z.string().min(1, 'El username es obligatorio'),
  fullName: z.string().min(1, 'El nombre es obligatorio'),
});

// Type inferido del schema
export type TProfileForm = z.infer<typeof profileFormDefinition>;

// Default values factory
export function createProfileDefaultValues(data: TUser): TProfileForm {
  return {
    username: data.username ?? '',
    fullName: `${data.firstName} ${data.lastName}` ?? '',
  };
}
```

<!-- ### Función con reglas de negocio

✅ Declarar la función que contiene las reglas de negocio de esta funcionalidad (llamada a otros servicios/apis o validaciones específicas para el proceso).

✅ Se hace uso de inyección de dependencia para mejorar la testeabilidad.

✅ No se emplea lógica de UI en esta capa.

```tsx
// 📁 /apps/features/user-profile/application/use-cases/updateProfile.usecases.ts
import { TUser } from "@/shared/domain/user/model";
import { type TProfileForm } from "../../domain/profile.form";

type UserProfileResult = {
  success: boolean;
}

type Dependencies = {
  updateProfile: (data: TProfileForm) => Promise<TUser>
}

export async function updateProfileUseCase(
  input: TProfileForm,
  deps: Dependencies
): Promise<UserProfileResult> {
  const { updateProfile } = deps;

  try {
    await deps.updateProfile(input);
    return { success: true };
  } catch {
    return { success: false };
  }
}

export function useUpdateProfile() {
  const updateProfile = useUserProfile();

  return {
    mutateAsync: (input: TProfileForm) => {
      updateProfileUseCase(input, {
        updateProfile: updateProfile.mutateAsync
      }),
    },
    isLoading: updateProfile.isLoading,
  };
}
``` -->

### Contexto del formulario

✅ Se usa `isPending` del mutation como estado de loading (no se maneja un `useState` manual para disabled).

✅ Se usa el Contexto de React Hook Form (`FormProvider`).

✅ Los default values se crean con la factory del `.form.ts`.

✅ Solo se maneja lógica de UI en este componente (loading state, disabled state, llamados a handlers, renderizado de componentes, etc).

✅ Form y FormContent son componentes separados.

```tsx
// 📁 /apps/features/userProfile/ui/widgets/ProfileForm.tsx
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import {
  profileFormDefinition,
  createProfileDefaultValues,
  type TProfileForm,
} from "../../domain/profile.form";

interface ProfileFormProps {
  defaultValues: TUser;
}

function ProfileForm({ defaultValues }: ProfileFormProps) {
  const updateProfile = useUpdateProfile();

  const methods = useForm<TProfileForm>({
    defaultValues: createProfileDefaultValues(defaultValues),
    resolver: zodResolver(profileFormDefinition),
  });

  async function onSubmit(data: TProfileForm) {
    if (updateProfile.isPending) return;
    await updateProfile.mutateAsync(data);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ProfileFormContent
          disabled={updateProfile.isPending}
          error={updateProfile.error}
        />
      </form>
    </FormProvider>
  );
}
export default ProfileForm;
```

### Contenido del formulario

✅ En caso de existir un error, se maneja el caso.

✅ Se consume el Form Context de React Hook Form.

```tsx
// 📁 /apps/features/user-profile/ui/widgets/ProfileFormContent.tsx
import { useFormContext } from "react-hook-form";
import { type TProfileForm } from "../../domain/profile.form";

interface ProfileFormContentProps {
  disabled: boolean;
}

export function ProfileFormContent({ disabled }: ProfileFormContentProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TProfileForm>();

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="text"
        name="username"
        id="username"
        label="Username"
        error={errors.username}
        registration={register('username')}
        disabled={disabled}
      />
      <Input
        type="text"
        name="fullName"
        id="fullName"
        label="Nombre completo"
        error={errors.fullName}
        registration={register('fullName')}
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled}>
        Guardar
      </Button>
    </div>
  );
}
```

## Ejemplo 1 de validación dinámica

Existen casos donde se necesitan hacer validaciones dinámicas, las cuales sean capaces de adaptar su comportamiento en base a uno o más atributos. En pocas palabras, se necesita incluir reglas de negocio específicas en dichas validaciones.

Para ello se hace uso de Zod y su herramienta `superRefine` como se plantea a continuación.

Para explicar este caso, planteemos un caso hipotético, donde quisiéramos validar si el ABA o SWIFT fue indicado en una transacción (solo para el caso de que las necesite).

### Declarar el type del form

Se declara el type que nos permita trabajar con todas las reglas de negocio establecidas para nuestro dominio "Transacciones".

```ts
// 📁 /apps/features/pay-order/domain/transaction.model.ts
export type RoutingNumberType = "aba" | "swift";

export interface RoutingNumber {
  type: RoutingNumberType;
  code: string;
}

export interface Transaction {
  type: "transfer" | "cash";
  amount: number;
  isNational: boolean;
  routingNumber: RoutingNumber;
  isOutgoing: boolean;
}
```

### Reglas de negocio del dominio
Ahora expresamos las reglas de nuestro dominio

```ts
// 📁 /apps/features/pay-order/domain/transaction.logic.ts
import { 
  Transaction,
  RoutingNumberType
} from "./transaction.model.ts";

// international transactions required routing number
function isRoutingNumberRequired(transaction: Transaction): boolean {
  return !transaction.isNational;
}

// return regex validation for each Routing Number case
function getRoutingNumberRegexValidation(routingNumber: RoutingNumberType) {
  switch(routingNumber) {
    // 9 digits required
    case "aba": // avoid magic string 😘
      return /^\d{9}$/;
    // 8 to 11 alphanumeric characters
    case "swift":  // avoid magic string 😘
      return /^[A-Za-z0-9]{8,11}$/;
    default:
      return null;  // throw error works as well
  }
}
```

### Validación del form

```ts
// 📁 /apps/features/pay-order/domain/payOrder.form.ts
import { z } from "zod";
import {
  isRoutingNumberRequired,
  getRoutingNumberRegexValidation
} from "./transaction.logic";

// routing number definition
const routingNumberDefinition = z.object({
  type: ['aba', 'swift'],
  code: z.string()
});

// transaction definition
const transactionDefinition = z.object({
  type: z.enum(['transfer', 'cash']),
  amount: z.number().positive(),
  isNational: z.boolean(),
  routingNumber: routingNumberDefinition.optional()
  isOutgoing: z.boolean(),
});

export type TransactionZod = z.infer<typeof transactionDefinition>;

/**
 * ! Refactor: this is just a sample, improve SRP in your project. 
*/
function refineFunction(
  value: TransactionZod,
  ctx: z.RefinementCtx,
) {
  const isNational = value.isNational;
  const routingNumber = value.routingNumber;

  if(isNational && routingNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Este campo no es requerido',
      path: ['routingNumber'],
    });
    return;
  }

  if(isNational) {
    return;
  }

  if(!routingNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Este campo es requerido',
      path: ['routingNumber'],
    });
    return;
  }

  const regexToValidate = getRoutingNumberRegexValidation(routingNumber.type);
  if(!regexToValidate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Ha ocurrido un error validando este campo',
      path: ['routingNumber.code'],
    });
    return;
  }

  // validate the routing number code against the RegExp
  if(!regexToValidate.test(routingNumber.code)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El código del routing number es inválido',
      path: ['routingNumber.code'],
    });
    return;
  }
}

// form validations
export const payOrderFormValidation = z.object({
  transactions: 
    z.array(transactionDefinition.superRefine(refineFunction))
      .min(1, { message: 'Debe agregar al menos una transacción.' }),
});
```

## Ejemplo 2 de validación dinámica

Para el caso donde el esquema recibe una configuración inicial, podríamos hacer lo siguiente:

```ts
// 📁 /apps/features/pay-order/domain/payOrder.form.ts
const refineJustOutgoingTransactions = ({
  value,
  ctx,
}: {
  value: TransactionZod;
  ctx: z.RefinementCtx;
}) => {
  const isOutgoing = value.isOutgoing;
  if(!isOutgoing) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Solo se aceptan transacciones salientes',
      path: ['isOutgoing'],
    });
  }
};

const refineJustIncomingTransactions = ({
  value,
  ctx,
}: {
  value: TransactionZod;
  ctx: z.RefinementCtx;
}) => {
  const isOutgoing = value.isOutgoing;
  if(isOutgoing) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Solo se aceptan transacciones entrantes',
      path: ['isOutgoing'],
    });
  }
};

export const transactionTypeDefinition = ({
  isOutgoing,
}: {
  isOutgoing: boolean;
}) => {
  let refineFunction: TRefineTransaction = () => {};
  if (isOutgoing) {
    refineFunction = (value, ctx) =>
      refineJustOutgoingTransactions(value, ctx);
  }
  if (!isOutgoing) {
    refineFunction = (value, ctx) =>
      refineJustIncomingTransactions(value, ctx);
  }
 
  return inputTransactionDefinition.superRefine(refineFunction);
};

// form validations
export const outgoingOrderFormValidation = z.object({
  transactions: 
    z.array(transactionTypeDefinition({ isOutgoing: true }))
      .min(1, { message: 'Debe agregar al menos una transacción.' }),
});

export const incomingOrderFormValidation = z.object({
  transactions: 
    z.array(transactionTypeDefinition({ isOutgoing: false }))
      .min(1, { message: 'Debe agregar al menos una transacción.' }),
});
```