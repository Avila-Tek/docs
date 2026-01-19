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
describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;
  let mockPostService: jest.Mocked<PostService>;
  let mockMediaService: jest.Mocked<MediaService>;
  
  beforeEach(() => {
    mockPostService = { createPost: jest.fn() };
    mockMediaService = { uploadImage: jest.fn() };
    
    useCase = new CreatePostUseCase(mockPostService, mockMediaService);
  });
  
  test('creates post without image', async () => {
    // Arrange
    const input = { content: 'Hello world', image: null };
    
    // Act
    await useCase.execute(input);
    
    // Assert
    expect(mockPostService.createPost).toHaveBeenCalledWith({
      content: 'Hello world',
      imageId: undefined
    });
  });
  
  test('uploads image before creating post', async () => {
    // Arrange
    const imageFile = new File([''], 'photo.jpg');
    mockMediaService.uploadImage.mockResolvedValue({ id: 'img_123' });
    
    const input = { content: 'With image', image: imageFile };
    
    // Act
    await useCase.execute(input);
    
    // Assert - Verifica orden correcto
    expect(mockMediaService.uploadImage).toHaveBeenCalledWith(imageFile);
    expect(mockPostService.createPost).toHaveBeenCalledWith({
      content: 'With image',
      imageId: 'img_123'
    });
  });
});
```

**Testing de Hooks (React Query)**:
```typescript
// features/posts/application/__tests__/usePosts.test.tsx
describe('usePosts hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('fetches posts from page 2', async () => {
    // Arrange
    const mockPosts = [{ id: '1', title: 'Post 1' }];
    jest.spyOn(postService, 'getPosts').mockResolvedValue(mockPosts);
    
    // Act
    const { result } = renderHook(() => usePosts({ page: 2, perPage: 10 }));
    
    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(postService.getPosts).toHaveBeenCalledWith({
      page: 2,
      perPage: 10
    });
  });
});
```
