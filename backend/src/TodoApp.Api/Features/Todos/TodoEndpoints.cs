using Microsoft.AspNetCore.Http.HttpResults;
using TodoApp.Api.Features.Todos.Contracts;

namespace TodoApp.Api.Features.Todos;

public static class TodoEndpoints
{
    public static IEndpointRouteBuilder MapTodoEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/todos").WithTags("Todos");

        group.MapGet("/", GetAll).WithName("GetTodos");
        group.MapPost("/", Create).WithName("CreateTodo");
        group.MapDelete("/{id:guid}", Delete).WithName("DeleteTodo");
        group.MapPatch("/{id:guid}", Update).WithName("UpdateTodo");

        return app;
    }

    private static async Task<Ok<IReadOnlyList<TodoResponse>>> GetAll(
        ITodoService service, CancellationToken cancellationToken) =>
        TypedResults.Ok(await service.GetAllAsync(cancellationToken));

    private static async Task<Created<TodoResponse>> Create(
        CreateTodoRequest request, ITodoService service, CancellationToken cancellationToken)
    {
        var todo = await service.CreateAsync(request, cancellationToken);
        return TypedResults.Created($"/api/todos/{todo.Id}", todo);
    }

    private static async Task<Results<NoContent, NotFound>> Delete(
        Guid id, ITodoService service, CancellationToken cancellationToken) =>
        await service.DeleteAsync(id, cancellationToken)
            ? TypedResults.NoContent()
            : TypedResults.NotFound();

    private static async Task<Results<Ok<TodoResponse>, NotFound>> Update(
        Guid id, UpdateTodoRequest request, ITodoService service, CancellationToken cancellationToken)
    {
        var todo = await service.SetCompletedAsync(id, request.IsCompleted!.Value, cancellationToken);
        return todo is null ? TypedResults.NotFound() : TypedResults.Ok(todo);
    }
}