---
slug: /frontend/standards/fetch/mutations
title: Mutations
sidebar_position: 4
---

## Mutations

Declaramos el servicio para mutaciones, el cual se encarga de parsear y comunicarse con la API.

```tsx
// 📁 /apps/clients/src/services/user/mutations.ts
import { TCreateUserInput } from '@repo/schemas';
import { Safe } from '@repo/utils';
import { mutationOptions } from '@tanstack/react-query';
import { getAPIClient } from '@/src/lib/api';

export const userMutations = {
  create() {
    return mutationOptions<Safe<TUser>, Error, TCreateUserInput>({
      mutationKey: ['create'],
      async mutationFn(variables) {
        const api = getAPIClient();
        const safeResult = await api.v1.users.create(variables);
        return safeResult;
      },
      onError(error) {
        console.error(error);
      },
    });
  },
};
```