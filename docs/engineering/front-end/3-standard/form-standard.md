---
slug: /frontend/standards/forms
title: Formularios
sidebar_position: 8
---

## Declarar DTO

✅ Declarar las validaciones del form y el default value en la infraestructura del feature.

```ts
// 📁 /apps/features/user-profile/infrastructure/profile.dto.ts
import { z } from "zod";
import { TUser } from "@/shared/domain/user/model";

// form's validations
export const profileFormDefinition = z.object({
  username: z.string(),
  fullName: z.string(),
});

// form type
export type TProfileForm = z.infer<typeof profileFormDefinition>;

// parse from data source to my form type
export function profileDefaultValues(data: TUser): TProfileForm {
  return {
    username: data.username,
    fullName: `${data.firstName} ${data.lastName}`,
  };
}
```

### Declarar reglas de negocio

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

## Declarar el contexto del formulario

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

## Declarar el contexto de un contenido

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

### Validacion de formularios complejos.

