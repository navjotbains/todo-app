using System.ComponentModel.DataAnnotations;

namespace TodoApp.Api.Features.Todos.Contracts;

public sealed record CreateTodoRequest(
    [Required, StringLength(200)] string Title);