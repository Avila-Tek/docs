---
sidebar_position: 2
title: Reglas del código
---


## 1. Convenciones de nombres


### 1.1. Nombres de carpetas

- Los nombres de carpetas deben estar en formato camelCase.
- Los nombres de carpetas deben estar en formato snake_case **(only for mobile)**.

```typescript
// ❌ Mal
lib/
  ├── SentryConfig/
  └── .../

// ✅ Bien
lib/
  ├── sentryConfig/
  └── .../
```

### 1.2. Nombres de archivos

- Los nombres de archivos deben estar en formato PascalCase.
- Los nombres de archivos deben estar en formato snake_case **(only for mobile)**.

```typescript
// ❌ Mal
lib/
  └── SentryConfig/
        └── SentryConfig.ts

// ✅ Bien
lib/
  └── sentryConfig/
        └── sentryConfig.ts
```



### 1.3. Nombres de variables

Los nombres de variables deben estar bien definidos y ser descriptivos.

```typescript
// ❌ Mal
const a = 25;
const b = "John";

// ✅ Bien
const age = 25;
const firstName = "John";
```



