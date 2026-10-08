using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using TodoApp.Api.Features.Todos.Contracts;

namespace TodoApp.Api.Tests.Integration;

public class TodoEndpointsTests : IDisposable
{
    private readonly WebApplicationFactory<Program> _factory = new();
    private readonly HttpClient _client;

    public TodoEndpointsTests()
    {
        _client = _factory.CreateClient();
    }

    public void Dispose() => _factory.Dispose();

    [Fact]
    public async Task GetTodos_WhenEmpty_ReturnsOkWithEmptyList()
    {
        var response = await _client.GetAsync("/api/todos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var todos = await response.Content.ReadFromJsonAsync<List<TodoResponse>>();
        Assert.Empty(todos!);
    }

    [Fact]
    public async Task CreateTodo_WithValidTitle_ReturnsCreatedWithLocation()
    {
        var response = await _client.PostAsJsonAsync("/api/todos", new CreateTodoRequest("Buy milk"));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var todo = await response.Content.ReadFromJsonAsync<TodoResponse>();
        Assert.Equal("Buy milk", todo!.Title);
        Assert.Equal($"/api/todos/{todo.Id}", response.Headers.Location?.ToString());
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CreateTodo_WithBlankTitle_ReturnsBadRequest(string title)
    {
        var response = await _client.PostAsJsonAsync("/api/todos", new CreateTodoRequest(title));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task CreateTodo_WithTitleOver200Characters_ReturnsBadRequest()
    {
        var response = await _client.PostAsJsonAsync("/api/todos", new CreateTodoRequest(new string('a', 201)));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTodo_WhenExists_ReturnsNoContent()
    {
        var created = await _client.PostAsJsonAsync("/api/todos", new CreateTodoRequest("Buy milk"));
        var todo = await created.Content.ReadFromJsonAsync<TodoResponse>();

        var response = await _client.DeleteAsync($"/api/todos/{todo!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTodo_WhenMissing_ReturnsNotFound()
    {
        var response = await _client.DeleteAsync($"/api/todos/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateTodo_WhenExists_ReturnsOkWithUpdatedTodo()
    {
        var created = await _client.PostAsJsonAsync("/api/todos", new CreateTodoRequest("Buy milk"));
        var todo = await created.Content.ReadFromJsonAsync<TodoResponse>();

        var response = await _client.PatchAsJsonAsync($"/api/todos/{todo!.Id}", new UpdateTodoRequest(true));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<TodoResponse>();
        Assert.True(updated!.IsCompleted);
    }

    [Fact]
    public async Task UpdateTodo_WhenMissing_ReturnsNotFound()
    {
        var response = await _client.PatchAsJsonAsync($"/api/todos/{Guid.NewGuid()}", new UpdateTodoRequest(true));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateTodo_WithoutIsCompleted_ReturnsBadRequest()
    {
        var created = await _client.PostAsJsonAsync("/api/todos", new CreateTodoRequest("Buy milk"));
        var todo = await created.Content.ReadFromJsonAsync<TodoResponse>();

        var response = await _client.PatchAsJsonAsync($"/api/todos/{todo!.Id}", new { });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}