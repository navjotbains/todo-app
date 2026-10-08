namespace TodoApp.Api.Features.Todos;

public interface ITodoRepository
{
    Task<IReadOnlyList<TodoItem>> GetAllAsync(CancellationToken cancellationToken);
    Task AddAsync(TodoItem item, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
    Task<TodoItem?> UpdateAsync(Guid id, Func<TodoItem, TodoItem> update, CancellationToken cancellationToken);
}