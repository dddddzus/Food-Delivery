using Microsoft.EntityFrameworkCore;
using FoodDeliveryWebApplication.WebMvcApp.Entities;

namespace FoodDeliveryWebApplication.WebMvcApp.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySQL(
                "server=mysqlstudenti.litv.sssvt.cz;database=4c1_plickadavid_db2;user=plickadavid;password=123456"
            );
        }
    }
}
