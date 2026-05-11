using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;

var builder = WebApplication.CreateBuilder(args);

// rejestracja bazy w RAMie
// builder.Services.AddDbContext<TodoContext>(opt =>
//     opt.UseInMemoryDatabase("TodoList"));

builder.Services.AddDbContext<TodoContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();
using (var scope = app.Services.CreateScope()){
    var db = scope.ServiceProvider.GetRequiredService<TodoContext>();
    db.Database.EnsureCreated();
}

app.UseDefaultFiles();
app.UseStaticFiles();



app.MapGet("/todos", async (TodoContext db) =>
{
    return await db.Todos.ToListAsync();
});


app.MapPost("/todos", async (TodoItem todo, TodoContext db) =>
{
    db.Todos.Add(todo);
    await db.SaveChangesAsync();
    
    return Results.Created($"/todos/{todo.Id}", todo);
});


app.MapPut("/todos/{id}", async (int id, TodoItem inputTodo, TodoContext db) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo is null) return Results.NotFound();
    todo.Name = inputTodo.Name;
    todo.isComplete = inputTodo.isComplete;

    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.MapDelete("/todos/{id}", async (int id, TodoContext db) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo is null) return Results.NotFound();

    db.Todos.Remove(todo);
    await db.SaveChangesAsync();
    return Results.NoContent();
});


app.Run();
