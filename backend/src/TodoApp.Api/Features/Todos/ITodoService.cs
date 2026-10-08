using TodoApp.Api.Features.Todos.Contracts;

namespace TodoApp.Api.Features.Todos;

public interface ITodoService
{
    Task<IReadOnlyList<TodoResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<TodoResponse> CreateAsync(CreateTodoRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
    Task<TodoResponse?> SetCompletedAsync(Guid id, bool isCompleted, CancellationToken cancellationToken);
}