---
slug: /frontend/standards/state
title: Manejo de estado
sidebar_position: 6
---

## ¿Qué manejador de estado usar, cuándo y donde?

| Caso / Necesidad                 | Señales típicas                                                  | Usa                                        | Evita                                           |
| -------------------------------- | ---------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------- |
| UI local simple                  | toggle, modal, tab, dropdown, hover, paginación local            | `useState`                                 | Context “por si acaso”                          |
| UI local con lógica              | varios handlers, reglas, side-effects, derived state             | `useState` + custom hook (`useX`)          | lógica metida en JSX                            |
| Estado local complejo            | muchas transiciones, el mismo estado cambia desde varios eventos | `useReducer` (local)                       | multiplicar `useState` para todo                |
| Compartir estado en un sub-árbol | varios componentes hermanos/primos necesitan lo mismo            | Context + hook (`useX`)                    | “Global Context” en toda la app                 |
| Estado cross-cutting real        | theme, auth session, i18n (usado en muchos lugares)              | Provider global (root)                     | meter “cualquier cosa” en root                  |
| Formularios                      | inputs, validación, touched/dirty, submit, errors                | React Hook Form                            | duplicar valores del form en `useState`/Context |
| Estado server/cache              | datos remotos, re-fetch, caching                                 | (si no usan libs: local + fetch + lifting) | simular cache con Context                       |

## WIP ...

## Context simple (useState) — hook separado

```tsx
// 📁 entities/user/model/UserContext.tsx
'use client';

import * as React from 'react';

export type User = { id: string; name: string };

export type UserContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
};

export const UserContext = React.createContext<UserContextValue | undefined>(
  undefined
);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<User | null>(null);

  const value = React.useMemo<UserContextValue>(() => {
    const setUser = (u: User) => setUserState(u);
    const clearUser = () => setUserState(null);

    return {
      user,
      isAuthenticated: user !== null,
      setUser,
      clearUser,
    };
  }, [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
```

```tsx
// 📁 entities/user/model/UseUser.ts
'use client';

import * as React from 'react';
import { UserContext } from './UserContext';

export function UseUser() {
  const ctx = React.useContext(UserContext);
  if (!ctx) throw new Error('UseUser must be used within <UserProvider />');
  return ctx;
}
```

```tsx
📁 entities/user/index.ts
export { UserProvider } from './model/UserContext';
export { UseUser } from './model/UseUser';
export type { User, UserContextValue } from './model/UserContext';
```

## Context + useReducer — hook separado

```tsx
// 📁 entities/user/model/UserStore.ts
export type User = { id: string; name: string };

export type UserState = {
  user: User | null;
};

export type UserAction =
  | { type: 'User/Set'; payload: User }
  | { type: 'User/Clear' };

export const InitialUserState: UserState = {
  user: null,
};

export function UserReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'User/Set':
      return { ...state, user: action.payload };
    case 'User/Clear':
      return { ...state, user: null };
    default:
      return state;
  }
}
```

```tsx
// 📁 entities/user/model/UserContext.tsx
'use client';

import * as React from 'react';
import {
  InitialUserState,
  UserReducer,
  type User,
  type UserState,
} from './UserStore';

export type UserContextValue = UserState & {
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
};

export const UserContext = React.createContext<UserContextValue | undefined>(
  undefined
);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(UserReducer, InitialUserState);

  const value = React.useMemo<UserContextValue>(() => {
    const setUser = (u: User) => dispatch({ type: 'User/Set', payload: u });
    const clearUser = () => dispatch({ type: 'User/Clear' });

    return {
      ...state,
      isAuthenticated: state.user !== null,
      setUser,
      clearUser,
    };
  }, [state]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
```

```tsx
// 📁 entities/user/model/UseUser.ts
'use client';

import * as React from 'react';
import { UserContext } from './UserContext';

export function UseUser() {
  const ctx = React.useContext(UserContext);
  if (!ctx) throw new Error('UseUser must be used within <UserProvider />');
  return ctx;
}
```

```tsx
// 📁 entities/user/index.ts
export { UserProvider } from './model/UserContext';
export { UseUser } from './model/UseUser';
export type { User } from './model/UserStore';
export type { UserContextValue } from './model/UserContext';
```
