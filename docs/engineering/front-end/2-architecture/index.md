---
slug: /frontend/architecture
title: Arquitectura
sidebar_position: 1
---

## Introducción

En esta sección explicamos **el modelo mental único** que usamos para estructurar todo el frontend.

El objetivo no es memorizar carpetas, sino **entender responsabilidades** y como se adaptan estas 2 arquitecturas para que funcionen juntas.

## Feature Driven Development

Feature Driven Development (FDD) es una metodología ágil de desarrollo de software que se centra en el desarrollo de funcionalidades (features) del producto.

- Antes se organizaba el código por **tipos de archivos**:

```
# Arquitectura Anterior

src/
├── components/
├── hooks/
├── services/
├── utils/
├── pages/
└── styles/
```

- Ahora en lugar de organizar el código por **tipos de archivos**, tratamos de organizarlos por su **funcionalidad**:

```
# Con Feature Driven

src/
 ├── app/                   <-- Páginas
 ├── features/              <-- Funcionalidades
  ── auth/
    ├── ui/                 <-- Componentes UI
    ├── application/        <-- Logica de negocio
    ├── domain/             <-- Modelos y logica de negocio
    ├── infrastructure/     <-- Implementacion de la logica de negocio
  ── onboarding/
  ── createPost/
  ── postDetails/
  ── ...            
 ```

:::info
Si borras features/createPost, el resto de la app sigue compilando.
Lo único que cambia es que ya no existe ese flujo/ruta.
:::

### Beneficios

- **Modularidad**: Cada funcionalidad es una unidad vertical completa, con cada una de las capas si así lo requiere, esto permite entender, modificar y escalar una funcionalidad sin tener que navegar todo el proyecto.
- **Reutilización**: Puedes reutilizar componentes y logica de negocio en diferentes funcionalidades.
- **Mantenibilidad**: Es más fácil de mantener y escalar ya que cada funcionalidad es una unidad vertical completa.
- **Tests**: Es más fácil de testear ya que no necesitas testear toda la aplicación para probar una funcionalidad.
- **Flexibilidad**: Puedes cambiar una base de datos o un framework de UI sin afectar a la funcionalidad.


## Clean Architecture

Nuestra arquitectura se basa en el paradigma de Clean Architecture, sin emabrgo como React fue conceptualizado para la programación funcional y de otra manera de abstraen ciertos conceptos.

![clean-architecture](/img/frontend/architecture/clean-architecture.jpeg)

### Beneficios

- El dominio de negocio se mantiene separado de detalles técnicos.
- Los tests se vuelven más fáciles.
- Cambiar una base de datos o un framework de UI no significa reescribir medio sistema.

:::tip
Antes de seguir leyendo, te animamos a que te pases por la sección de **S.O.L.I.D** para entender mejor el porqué de esta arquitectura.
:::

### S.O.L.I.D

SOLID es un acrónimo de cinco principios de diseño de software que buscan hacer el código más mantenible, escalable y fácil de entender.

- Single Responsibility Principle
- Open/Closed Principle
- Liskov Substitution Principle
- Interface Segregation Principle
- Dependency Inversion Principle

#### Single Responsibility Principle

> Un módulo debe tener una sola razón para cambiar.

#### Open/Closed Principle

> Las entidades de software deben estar abiertas a extensión, pero cerradas a modificación.

#### Liskov Substitution Principle

> Los objetos de una clase base deben poder ser reemplazados por objetos de una clase derivada sin alterar el correcto funcionamiento del programa.

#### Interface Segregation Principle

> Una interfaz debe ser lo más específica posible para cada cliente.

#### Dependency Inversion Principle

> Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.