using System.ComponentModel.DataAnnotations;

namespace TodoApp.Api.Features.Todos.Contracts;

public sealed record UpdateTodoRequest([Required] bool? IsCompleted);