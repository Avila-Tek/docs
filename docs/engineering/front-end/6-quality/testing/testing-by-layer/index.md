---
title: Pruebas unitarias por capas
sidebar_position: 2
slug: /frontend/quality/testing/testing-by-layer
---

# Pruebas unitarias por capas

## 🔍 Overview

En nuestra arquitectura Clean React, **el testing no es una actividad uniforme** sino un conjunto de estrategias específicas para cada capa. La regla de oro es: **cada capa se testea de forma diferente, respetando sus responsabilidades**.

### ¿Por qué este enfoque?

- **Domain Layer**: Tests rápidos y puros, sin mocks
- **Infrastructure Layer**: Tests con mocks de APIs externas
- **Application Layer**: Tests de orquestación y flujos
- **UI Layer**: Tests de interacción y renderizado

## Estructura de Archivos en la Práctica

```
src/features/checkout/
├── domain/
│   ├── logic/
│   │   ├── payment.logic.ts              # Reglas de pago
│   │   └── cart.logic.ts                 # Reglas del carrito
│   └── __tests__/
│       ├── payment.logic.test.ts         # ✅ Tests DOMAIN
│       └── cart.logic.test.ts
│
├── infrastructure/
│   ├── services/
│   │   ├── payment.service.ts            # Servicio de pago
│   │   └── shipping.service.ts           # Servicio de envío
│   └── __tests__/
│       ├── payment.service.test.ts       # ✅ Tests INFRASTRUCTURE
│       └── shipping.service.test.ts
│
├── application/
│   ├── use-cases/
│   │   └── checkout.usecase.ts           # Caso de uso principal
│   ├── hooks/
│   │   └── useCheckout.ts                # Hook de React
│   └── __tests__/
│       ├── checkout.usecase.test.ts      # ✅ Tests APPLICATION
│       └── useCheckout.test.tsx
│
└── ui/
    ├── components/
    │   ├── CheckoutForm.tsx              # Formulario
    │   └── OrderSummary.tsx              # Resumen
    └── __tests__/
        ├── CheckoutForm.test.tsx         # ✅ Tests UI
        └── OrderSummary.test.tsx
```


### Ejemplo: Feature "Process Payment"

```typescript
// 1. DOMAIN (Primero): Reglas de negocio
test('payment amount must be positive', () => {
  expect(isValidPaymentAmount(-10)).toBe(false);
});

// 2. INFRASTRUCTURE (Luego): Servicio de pago  
test('payment service transforms request correctly', async () => {
  const mockApi = { charge: jest.fn() };
  const service = new PaymentService(mockApi);
  await service.processPayment({ amount: 100, currency: 'USD' });
  expect(mockApi.charge).toHaveBeenCalledWith(expect.objectContaining({
    amount_cents: 10000, // Transformación
  }));
});

// 3. APPLICATION (Después): Caso de uso
test('checkout use case orchestrates payment and email with injected dependencies', async () => {
  const deps = {
    processPayment: jest.fn().mockResolvedValue({ success: true }),
    sendReceipt: jest.fn().mockResolvedValue(undefined),
    validateOrder: jest.fn().mockReturnValue({ valid: true }),
    checkInventory: jest.fn().mockResolvedValue(true),
  };
  
  const order = { items: [], total: 100 };
  const result = await checkoutUseCase(order, deps);
  
  expect(deps.validateOrder).toHaveBeenCalledWith(order);
  expect(deps.checkInventory).toHaveBeenCalled();
  expect(deps.processPayment).toHaveBeenCalled();
  expect(deps.sendReceipt).toHaveBeenCalled();
  });

// 4. UI (Finalmente): Componente
test('CheckoutForm shows success message', async () => {
  const mockOnSubmit = jest.fn();
  render(<CheckoutForm onSubmit={mockOnSubmit} />);
  
  await user.type(screen.getByLabelText('Card Number'), '4242424242424242');
  await user.click(screen.getByText('Pay'));
  
  expect(screen.getByText('Payment successful!')).toBeInTheDocument();
});
```

