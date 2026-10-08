namespace TodoApp.Api.Features.Todos;

public sealed record TodoItem(Guid Id, string Title, DateTimeOffset CreatedAt);