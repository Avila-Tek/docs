---
title: Application layer
sidebar_position: 3
slug: /frontend/quality/testing/testing-by-layer/application-test/
---


### 🔁 Application Layer - Use Cases y Hooks

**Qué testear aquí**:
- Flujos completos de usuario
- Coordinación entre servicios
- Hooks de React Query
- Estados (loading, error, success)

**Testing de Use Cases**:
```typescript
// features/posts/application/__tests__/createPost.usecase.test.ts
describe('replyToPostUseCase', () => {
  test('returns error when user is not authenticated', async () => {
    // Arrange
    const deps: Dependencies = {
      me: undefined, // ← Usuario no autenticado
      recipient: mockRecipient,
      saveImage: jest.fn(),
      createPost: jest.fn(),
      createReply: jest.fn(),
    };
    
    // Act
    const result = await replyToPostUseCase(
      { postId: '1', recipientHandle: 'user2', message: 'Hello' },
      deps
    );
    
    // Assert
    expect(result.ok).toBe(false);
    expect(result.error).toBe('You must be logged in.');
  });
  
  test('creates reply with image successfully', async () => {
    // Arrange
    const mockUser = { id: 'user1', /* ... */ };
    const mockRecipient = { id: 'user2', blockedUserIds: [] };
    const mockImage = { id: 'img_123' };
    const mockPost = { id: 'post_456' };
    
    const deps: Dependencies = {
      me: mockUser,
      recipient: mockRecipient,
      saveImage: jest.fn().mockResolvedValue(mockImage),
      createPost: jest.fn().mockResolvedValue(mockPost),
      createReply: jest.fn().mockResolvedValue(undefined),
    };
    
    // Act
    const result = await replyToPostUseCase(
      {
        postId: 'post_123',
        recipientHandle: 'user2',
        message: 'Reply with image',
        files: [new File([], 'photo.jpg')],
      },
      deps
    );
    
    // Assert - Verifica orden correcto
    expect(result.ok).toBe(true);
    expect(deps.saveImage).toHaveBeenCalled();
    expect(deps.createPost).toHaveBeenCalledWith({
      message: 'Reply with image',
      imageId: 'img_123'
    });
    expect(deps.createReply).toHaveBeenCalledWith({
      postId: 'post_123',
      replyId: 'post_456'
    });
  });
});
```

**Testing de Hooks (React Query)**:
```typescript
// features/posts/application/__tests__/usePosts.test.tsx
describe('useReplyToPost hook', () => {
  test('injects React Query mutations as dependencies', async () => {
    // Arrange
    const mockMe = { data: { id: 'user1' } };
    const mockRecipient = { data: { id: 'user2' } };
    
    // Mock hooks de React Query
    jest.spyOn(require('../queries/useGetMe.query'), 'useGetMe')
      .mockReturnValue(mockMe);
    jest.spyOn(require('../queries/useGetUserByHandle.query'), 'useGetUserByHandle')
      .mockReturnValue(mockRecipient);
    
    // Spy on the use case to verify dependencies.
    let capturedDeps;
    jest.spyOn(require('./replyToPost.usecase'), 'replyToPostUseCase')
      .mockImplementation(async (input, deps) => {
        capturedDeps = deps;
        return { ok: true };
      });
    
    // Act
    const { result } = renderHook(
      () => useReplyToPost({ recipientHandle: 'user2' }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={new QueryClient()}>
            {children}
          </QueryClientProvider>
        )
      }
    );
    
    await result.current.mutateAsync({
      postId: '1',
      recipientHandle: 'user2',
      message: 'Test'
    });
    
    // Assert
    expect(capturedDeps.me).toEqual(mockMe.data);
    expect(capturedDeps.recipient).toEqual(mockRecipient.data);
    expect(typeof capturedDeps.saveImage).toBe('function');
    expect(typeof capturedDeps.createPost).toBe('function');
    expect(typeof capturedDeps.createReply).toBe('function');
  });
});
```
