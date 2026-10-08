using System.Collections.Concurrent;

namespace TodoApp.Api.Features.Todos;

public sealed class InMemoryTodoRepository : ITodoRepository
{
    private readonly ConcurrentDictionary<Guid, TodoItem> _items = new();

    public Task<IReadOnlyList<TodoItem>> GetAllAsync(CancellationToken cancellationToken)
    {
        IReadOnlyList<TodoItem> items = _items.Values
            .OrderBy(item => item.CreatedAt)
            .ToList();

        return Task.FromResult(items);
    }

    public Task AddAsync(TodoItem item, CancellationToken cancellationToken)
    {
        if (!_items.TryAdd(item.Id, item))
        {
            throw new InvalidOperationException($"A todo with id {item.Id} already exists.");
        }

        return Task.CompletedTask;
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken) =>
        Task.FromResult(_items.TryRemove(id, out _));
}