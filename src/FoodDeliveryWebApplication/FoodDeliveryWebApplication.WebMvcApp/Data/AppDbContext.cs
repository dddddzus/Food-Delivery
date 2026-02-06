using Microsoft.EntityFrameworkCore;
using FoodDeliveryWebApplication.WebMvcApp.Entities;

namespace FoodDeliveryWebApplication.WebMvcApp.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }


        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
        //mel jsem optionBuilder tady, ale nevim proc bez toho mi nefungoval prihlasovani, tak jsem to prehodil pomoci copilotu do programu a nyni to funguje, jinak vse bylo stejne..
    }
}
