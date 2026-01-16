---
slug: /frontend/architecture/domain
title: Domain layer
sidebar_position: 4
---

# Domain Layer (Entities & Domain Logic)

La capa **Domain** define el **lenguaje del negocio dentro del frontend**.

Aquí viven los **modelos** y las **reglas** que representan cómo el producto entiende sus datos, **independientemente** de:

- cómo el backend los expone
- cómo la UI los muestra
- cómo se obtienen (REST, GraphQL, mock, etc.)

👉 El Domain es el punto de estabilidad de la arquitectura.

**El Domain desacopla las interfaces**

El Domain actúa como un contrato interno estable entre capas:

```text
Infrastructure (API / DTOs)
          ↓
        Domain   ← punto estable
          ↑
Application / UI
```

Si cambia el backend → se ajustan transforms

Si cambia la UI → el Domain no cambia

Si cambian las reglas → cambias el Domain, no la UI ni la API

👉 El resto del sistema no conoce DTOs, solo conoce Domain models.

**Estructura de un domain**

```text
domain/
├── model/
└── logic/
```

## Tipos de archivos en Domain

### 1. model.ts (Entities)

**Qué es**  
Definición de las entidades del negocio tal como el frontend las entiende y utiliza.

**Responsabilidad**

- Representar conceptos del negocio
- Los modelos como los conoce el front y como son más facil de utilizar en capas posteriores
- Usar nombres del negocio, no del backend

**Ejemplo**

```ts
export type User = {
  id: string;
  status: 'ACTIVE' | 'BLOCKED';
  ...
};
```

### 2. logic.ts (Domain logic)

**Qué es**

Funciones puras que operan sobre entidades.

**Responsabilidad**

- Reglas

- Validaciones

- Invariantes

**Ejemplo**

```tsx
export function canUserSubmit(user: User) {
  return user.status === 'ACTIVE';
}
```
