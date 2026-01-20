---
title: UI layer
sidebar_position: 4
slug: /frontend/quality/testing/testing-by-layer/ui-test/
---

### 🖥️ UI Layer - Componentes

**Qué testear aquí**:
- Renderizado correcto
- Interacciones de usuario
- Integración con hooks
- Estados visuales (loading, error)

**Testing de Componentes**:
```typescript
// features/posts/ui/__tests__/PostForm.test.tsx
describe('PostForm', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });
  
  test('submits form with correct data', async () => {
    // Arrange
    const { user } = render(<PostForm onSubmit={mockOnSubmit} />);
    
    // Act
    await user.type(screen.getByLabelText('Contenido'), 'Mi primer post');
    await user.click(screen.getByText('Publicar'));
    
    // Assert
    expect(mockOnSubmit).toHaveBeenCalledWith({
      content: 'Mi primer post',
      image: null
    });
  });
  
  test('shows error when content is empty', async () => {
    // Arrange
    render(<PostForm onSubmit={mockOnSubmit} />);
    
    // Act
    await user.click(screen.getByText('Publish'));
    
    // Assert
    expect(screen.getByText('Content is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  test('shows loading state during submission', async () => {
    // Arrange
    const slowSubmit = () => new Promise(resolve => setTimeout(resolve, 100));
    render(<PostForm onSubmit={slowSubmit} />);
    
    // Act
    await user.type(screen.getByLabelText('Content'), 'Post');
    await user.click(screen.getByText('Publish'));
    
    // Assert
    expect(screen.getByText('Publishing...')).toBeInTheDocument();
  });
});
```

**Mejores prácticas UI Testing**:
1. **Testear comportamientos**, no implementaciones
2. **Usar queries accesibles** (`getByRole`, `getByLabelText`)
3. **Mockear hooks** de aplicación, no APIs directas
4. **Simular interacciones reales** (clicks, typing, submits)

