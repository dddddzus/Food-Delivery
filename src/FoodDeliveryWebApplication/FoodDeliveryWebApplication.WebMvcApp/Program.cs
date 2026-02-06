using Microsoft.AspNetCore.Authentication.Cookies;
using FoodDeliveryWebApplication.WebMvcApp.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryWebApplication.WebMvcApp
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllersWithViews();

            builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseMySQL("server=mysqlstudenti.litv.sssvt.cz;database=4c1_plickadavid_db2;user=plickadavid;password=123456")
);


            //1. èást konfigurace cookies
            builder.Services
                .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options => {
                    options.LoginPath = "/Home/Index";
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SameSite = SameSiteMode.Lax;
                }); //string "cookies"

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseRouting();

            //2. èást - zapnutí autentizace - dùležité poøadí
            app.UseAuthentication(); //Kdo jsme?
            app.UseAuthorization(); //Èím jsme? / (jaké role máme?)

            app.MapStaticAssets();
            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}")
                .WithStaticAssets();

            app.Run();
        }
    }
}
