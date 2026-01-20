---
slug: /frontend/standards/forms
title: Formularios
sidebar_position: 8
---

## Trabajando con formularios

### Modelo
```ts
// 📁 /apps/features/user-profile/domain/profile.model.ts

// form type
export interface TProfileForm = {
  username: string;
  fullName: string;
};
```


### DTO del form

✅ Declarar las validaciones del form y el default value en la infraestructura del feature.

```ts
// 📁 /apps/features/user-profile/infrastructure/profile.dto.ts
import { z } from "zod";
import { TUser } from "@/shared/domain/user/model";
import { TProfileForm } from "@user-profile/infrastructure";

// form's validations
export const profileFormDefinition = z.object({
  username: z.string(),
  fullName: z.string(),
});

// parse from data source to my form type
export function profileDefaultValues(data: TUser): TProfileForm {
  return {
    username: data.username,
    fullName: `${data.firstName} ${data.lastName}`,
  };
}
```

### Funcion con reglas de negocio

✅ Declarar la funcion que contiene las reglas de negocio de esta funcionalidad (llamada a otros servicios/apis o validaciones especificas para el proceso).

✅ se hace uso de inyeccion de dependencia para mejorar la testeabilidad.

✅ No se emplea logica de UI en esta capa.

```tsx
// 📁 /apps/features/user-profile/application/use-cases/updateProfile.usecases.ts
import { TUser } from "@/shared/domain/user/model";
import { TProfileForm } from "@user-profile/infrastructure";

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
```

### Contexto del formulario

✅ Se maneja un loading state con disabled y setDisabled.

✅ Se usa el Contexto de React Hook Form.

✅ No se declaran funciones de formateo para el default value.

✅ Solo se maneja logica de UI en este componente (loading state, disabled state, llamados a handlers, renderizado de componentes, etc).

✅ Form y FormContent son componentes separados.

```tsx
// 📁 /apps/features/user-profile/ui/widget/ProfileFormWidget.ts
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { userMutations } from "@services/user";
import { 
  profileFormDefinition,
  TProfileForm
} from "@user-profile/infrastructure";

interface ProfileFormWidgetProps {
  defaultValue: TProfileForm;
}

function ProfileFormWidget({defaultValue}: ProfileFormWidgetProps) {
  const [disabled, setDisabled] = React.useState(false);
  // function with business logic
  const updateProfile = useUpdateProfile({ recipientHandle });
  // Initialize useForm, and set default config
  const methods = useForm<TProfileForm>({
    defaultValues,  // initial value
    resolver: zodResolver(profileFormDefinition),  // zod validations
  });

  // submit handler, this is where magic happens
  async function onSubmit(data: TProfileForm) {
    if(disabled) {
      return;
    }
    setDisabled(true);

   await updateProfile.mutateAsync({
      profile: data,
    });

    await userMutations.updateProfile(data);
    setDisabled(false);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ProfileFormContent disabled={disabled} />
      </form>
    </FormProvider>
  );
}
export default ProfileFormWidget;
```

### Contenido del formulario

✅ En caso de existir un error, se maneja el caso.

✅ Se consume el Form Context de React.

```tsx
// 📁 /apps/features/create-user/ui/components/UserFormContent.ts
import { TProfileForm } from "@user-profile/infrastructure";

interface UserFormContentProps {
  disabled: boolean;
}

function UserFormContent({ disabled }: UserFormContentProps) {
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
        type="fullName"
        name="fullName"
        id="fullName"
        label="fullName"
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
export default UserFormContent;
```

## Ejemplo 1 de Validacion dinamica.

Existen casos donde se necesitan hacer validaciones dinamicas, las cuales sean capaces de adaptar su comportamiento en base a uno o mas atributos. En pocas palabras, se necesita incluir reglas de negocio especificas en dichas validaciones.

Para ello se hace uso de Zod y su herramienta "superRefine" como se plantea a continuacion.

Para explicar este caso, planteemos un caso hipotetico, donde quisieramos validar si el Aba o Swift fue indicado en una transaccion (solo para el caso de que las necesite).

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

### Validacion del form

```ts
// 📁 /apps/features/pay-order/infrastructure/payOrder.dto.ts
import { z } from "zod";
import {
  isRoutingNumberRequired,
  getRoutingNumberRegexValidation
} from "@user-profile/infrastructure";

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

## Ejemplo 2 de Validacion dinamica.

Para el caso donde el esquema recibe una configuracion inicial, podriamos hacer lo siguiente

```ts
// 📁 /apps/features/pay-order/infrastructure/payOrder.dto.ts
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