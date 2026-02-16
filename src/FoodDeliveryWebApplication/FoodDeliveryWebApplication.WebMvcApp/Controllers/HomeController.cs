using FoodDeliveryWebApplication.WebMvcApp.Data;
using FoodDeliveryWebApplication.WebMvcApp.Entities;
using FoodDeliveryWebApplication.WebMvcApp.Models;
using FoodDeliveryWebApplication.WebMvcApp.Models.Account;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Security.Claims;

namespace FoodDeliveryWebApplication.WebMvcApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        private readonly AppDbContext _dbContext;

        public HomeController(ILogger<HomeController> logger, AppDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }



        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }


        [HttpPost]
        public async Task<IActionResult> Login(string email, string password)
        {

            User? user = _dbContext.Users
                .FirstOrDefault(u => u.Email == email && u.Password == password);
            if(user == null)
            {
                return RedirectToAction("Index");
            }
            List<Claim> claims = new List<Claim>();


            Claim idClaim = new Claim("id", user.Id.ToString());
            Claim emailClaim = new Claim("email", user.Email);

            claims.Add(idClaim);
            claims.Add(emailClaim);

            ClaimsIdentity identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

            ClaimsPrincipal principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);


            return RedirectToAction("Menu", "FoodExpress");


            
            
        }

        // REGISTER POST (zatím pøipravené)
        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
            {
                TempData["Toast"] = "Oprav chyby ve formuláøi.";
                return RedirectToAction("Index");
            }

         


            bool exists = await _dbContext.Users.AnyAsync(u => u.Email == model.Email);
            if (exists)
            {
                TempData["Toast"] = "Uživatel s tímto emailem už existuje.";
                return RedirectToAction("Index");
            }

            var user = new User
            {
                Name = model.Name.Trim(),
                Email = model.Email.Trim(),
                Password = model.Password 
                                          
            };

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            TempData["Toast"] = "Registrace probìhla úspìšnì!";
            return RedirectToAction("Index");


        }
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(
                CookieAuthenticationDefaults.AuthenticationScheme);

            return RedirectToAction("Index");
        }




        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

    
    }
}
