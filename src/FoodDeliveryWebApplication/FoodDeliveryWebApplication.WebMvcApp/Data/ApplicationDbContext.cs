using Microsoft.EntityFrameworkCore;
namespace FoodDeliveryWebApplication.WebMvcApp.Data
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<xxxx> xxxxs { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySQL("server=mysqlstudenti.litv.sssvt.cz;database=4c1_plickadavid_db2;user=plickadavid;password=123456");
        }
    }
}
