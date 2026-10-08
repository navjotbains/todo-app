using TodoApp.Api.Features.Todos.Contracts;

namespace TodoApp.Api.Features.Todos;

public sealed class TodoService(ITodoRepository repository, TimeProvider timeProvider) : ITodoService
{
    public async Task<IReadOnlyList<TodoResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var items = await repository.GetAllAsync(cancellationToken);
        return items.Select(TodoResponse.FromEntity).ToList();
    }

    public async Task<TodoResponse> CreateAsync(CreateTodoRequest request, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var item = new TodoItem(Guid.CreateVersion7(now), request.Title.Trim(), now);

        await repository.AddAsync(item, cancellationToken);
        return TodoResponse.FromEntity(item);
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken) =>
        repository.DeleteAsync(id, cancellationToken);
}