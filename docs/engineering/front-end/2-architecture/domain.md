---
slug: /frontend/architecture/domain
title: Domain layer
sidebar_position: 4
---

## 📄 Domain Layer — `domain.md`

````md
# Domain Layer (Entities & Domain Logic)

La capa Domain define los modelos y objetos de cada feature y las funciones que los modifican, puede incluir clave que operan sobre los objetos **las reglas del negocio**.

---

```text
domain/
├── model/
└──logic/
```

## Tipos de archivos en Domain

### 1. model.ts (Entities)

**Qué es**  
Definición de las entidades del dominio.

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
````
