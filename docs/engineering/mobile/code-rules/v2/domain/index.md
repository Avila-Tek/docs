---
sidebar_position: 2
---

# Capa de dominio

La Capa de Dominio contiene toda la lógica de negocio de la aplicación. Es el núcleo del proyecto: define qué datos existen, qué operaciones son válidas y cómo se comunican las capas superiores con la fuente de datos.

El principio rector de la capa es la **independencia de cualquier detalle técnico**: las clases de dominio no importan librerías de infraestructura, frameworks de UI ni SDKs externos. Todo lo que vive aquí es Dart puro.

## Componentes

| Componente | Responsabilidad |
|---|---|
| [**Entidades**](./entities.md) | Estructuras de datos inmutables que representan los conceptos del negocio. Extienden `Equatable` y pueden incluir métodos de transformación semánticos. |
| [**Enumeradores**](./enums) | Conjuntos cerrados de valores tipados del dominio. Incluyen un caso `unknown` como fallback y getters booleanos para facilitar condicionales. |
| [**Parámetros**](./params) | Objetos de entrada para casos de uso y repositorios. La capa de datos extiende estas clases para agregar serialización. |
| [**Repositorios**](./repositories.md) | Interfaces que abstraen el acceso a datos. La capa de datos proporciona las implementaciones concretas. |
| [**Casos de uso**](./use-cases.md) | Orquestadores de la lógica de negocio. Coordinan entidades, repositorios y reglas del dominio. |
| **Validadores** | Reglas de validación de campos consideradas parte de la lógica de negocio (e.g., formato de email, longitud de contraseña). |

## Estructura de carpetas

```bash
domain/
├── entities/
│   ├── enums/
│   │   ├── order_status.dart
│   │   ├── user_role.dart
│   │   └── enums.dart               # Barrel file
│   ├── params/
│   │   ├── create_product_params.dart
│   │   ├── update_user_params.dart
│   │   └── params.dart              # Barrel file
│   ├── product.dart
│   ├── user.dart
│   └── entities.dart                # Barrel file raíz
├── repositories/
│   ├── i_product_repository.dart
│   ├── i_user_repository.dart
│   └── repositories.dart            # Barrel file
├── use_cases/
│   ├── product/
│   │   ├── create_product.dart
│   │   └── get_products.dart
│   └── user/
│       └── get_user.dart
└── validators/
    ├── email_validator.dart
    └── validators.dart              # Barrel file
```

:::note
Cada subcarpeta debe tener su propio barrel file que exporte todos sus elementos. El barrel file raíz de la capa (`domain.dart`) debe re-exportar los barrel files de cada subcarpeta.
:::
