namespace TodoApp.Api.Features.Todos.Contracts;

public sealed record TodoResponse(Guid Id, string Title, DateTimeOffset CreatedAt)
{
    public static TodoResponse FromEntity(TodoItem item) =>
        new(item.Id, item.Title, item.CreatedAt);
}