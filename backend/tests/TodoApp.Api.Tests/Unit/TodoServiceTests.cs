using Microsoft.Extensions.Time.Testing;
using TodoApp.Api.Features.Todos;
using TodoApp.Api.Features.Todos.Contracts;

namespace TodoApp.Api.Tests.Unit;

public class TodoServiceTests
{
    private readonly FakeTimeProvider _clock = new(new DateTimeOffset(2026, 10, 8, 9, 0, 0, TimeSpan.Zero));
    private readonly TodoService _service;

    public TodoServiceTests()
    {
        _service = new TodoService(new InMemoryTodoRepository(), _clock);
    }

    [Fact]
    public async Task CreateAsync_TrimsTitle()
    {
        var todo = await _service.CreateAsync(new CreateTodoRequest("  Buy milk  "), CancellationToken.None);

        Assert.Equal("Buy milk", todo.Title);
    }

    [Fact]
    public async Task CreateAsync_SetsCreatedAtFromClock()
    {
        var todo = await _service.CreateAsync(new CreateTodoRequest("Buy milk"), CancellationToken.None);

        Assert.Equal(_clock.GetUtcNow(), todo.CreatedAt);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsTodosOldestFirst()
    {
        await _service.CreateAsync(new CreateTodoRequest("First"), CancellationToken.None);
        _clock.Advance(TimeSpan.FromMinutes(1));
        await _service.CreateAsync(new CreateTodoRequest("Second"), CancellationToken.None);

        var todos = await _service.GetAllAsync(CancellationToken.None);

        Assert.Equal(new[] { "First", "Second" }, todos.Select(todo => todo.Title));
    }

    [Fact]
    public async Task DeleteAsync_RemovesTodo()
    {
        var todo = await _service.CreateAsync(new CreateTodoRequest("Buy milk"), CancellationToken.None);

        var deleted = await _service.DeleteAsync(todo.Id, CancellationToken.None);

        Assert.True(deleted);
        Assert.Empty(await _service.GetAllAsync(CancellationToken.None));
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenTodoDoesNotExist()
    {
        var deleted = await _service.DeleteAsync(Guid.NewGuid(), CancellationToken.None);

        Assert.False(deleted);
    }
}