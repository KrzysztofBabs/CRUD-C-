using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Models;

public class TodoContext : DbContext
{
    public TodoContext(DbContextOptions<TodoContext> options) : base(options)
    {
        
    }

    public DbSet<TodoItem> Todos { get; set; } = null!;

     
    
}