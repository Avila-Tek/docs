---
title: Fundamentos
sidebar_position: 1
slug: /frontend/quality/testing/fundamentals
---

<!-- ### 📌 ¿Por qué estos conceptos importan para testing? -->

La **Inyección de Dependencias (DI)** y **Inversión de Control (IoC)** son los principios que hacen posible escribir tests mantenibles, rápidos y aislados en nuestra arquitectura.

### 🧩 Inyección de Dependencias (DI) - El "Cómo"

**DI es simple**: En lugar de que un componente cree sus propias dependencias, las recibe desde fuera.

```typescript
// ❌ SIN DI - Difícil de testear
class UserService {
  constructor() {
    this.api = new ApiClient(); // Crea su propia dependencia
  }
  
  async getUser() {
    return await this.api.get('/user'); // Depende de API real
  }
}

// ✅ CON DI - Fácil de testear
class UserService {
  constructor(private api: ApiClient) {} // Recibe dependencia
    
  async getUser() {
    return await this.api.get('/user'); // Usa dependencia inyectada
  }
}

// USO EN LA APLICACIÓN
const realApiClient = new ApiClient({ /* config real */ });
const userService = new UserService(realApiClient); // Inyección

// USO EN TESTS
const mockApiClient = { get: jest.fn() };
const testService = new UserService(mockApiClient); // Mock inyectado

```

**Beneficio para testing**: Puedes pasar un mock en lugar de la implementación real.

### 🔁 Inversión de Control (IoC) - El "Por qué"

**IoC es un principio**: Los módulos de alto nivel (lógica de negocio) no deben depender de módulos de bajo nivel (detalles de implementación).

```typescript
// 1. Domain define QUÉ necesita (interfaz)
interface UserRepository {
  findUser(id: string): Promise<User>;
}

// 2. Infrastructure implementa CÓMO hacerlo
class ApiUserRepository implements UserRepository {
  async findUser(id: string): Promise<User> {
    // Llama a API real
    const response = await fetch(`/api/users/${id}`);
    return transformResponse(response);
  }
}

// 3. Application usa la interfaz
class UserProfileUseCase {
  constructor(private repo: UserRepository) {} // Depende de interfaz
  
  async execute(userId: string) {
    return await this.repo.findUser(userId); // No sabe si es API, DB, o mock
  }
}

// En tests:
const mockRepo: UserRepository = {
  findUser: jest.fn().mockResolvedValue(mockUser)
};
const useCase = new UserProfileUseCase(mockRepo); // Test fácil
```

**Ventaja para testing**: Puedes testear la lógica de negocio sin tocar APIs reales.

### Cómo aplicamos esto en nuestra arquitectura

**En cada capa**:

| Capa | Aplicación de DI/IoC | Beneficio para Testing |
|------|---------------------|------------------------|
| **Domain** | Define interfaces | Tests puros sin mocks |
| **Infrastructure** | Implementa interfaces | Mockeable, testeable |
| **Application** | Consume interfaces | Tests aislados |
| **UI** | Recibe props/hooks | Tests de integración |

**Ejemplo práctico**:
```typescript
// En producción:
const realRepo = new ApiUserRepository(apiClient);
const useCase = new GetUserUseCase(realRepo); // Usa API real

// En tests:
const testRepo = { findUser: jest.fn() };
const useCase = new GetUserUseCase(testRepo); // Usa mock
```
