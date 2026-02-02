using FoodDeliveryWebApplication.WebMvcApp.Data;
using FoodDeliveryWebApplication.WebMvcApp.Entities;
using FoodDeliveryWebApplication.WebMvcApp.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Security.Claims;

namespace FoodDeliveryWebApplication.WebMvcApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        private readonly AppDbContext _dbContext;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
            _dbContext = new AppDbContext();
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
                return View();
            }
            List<Claim> claims = new List<Claim>();

            Claim idClaim = new Claim("id", user.Id.ToString());
            Claim emailClaim = new Claim("email", user.Email);

            claims.Add(idClaim);
            claims.Add(emailClaim);

            ClaimsIdentity identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

            ClaimsPrincipal principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            return RedirectToAction("Index");


            
            
        }

        // REGISTER POST (zatím pøipravené)
        [HttpPost]
        public IActionResult Register(string name, string email, string phone, string password, string confirmPassword)
        {
            // TODO: Ve škole: validace + uložení do DB
            if (password != confirmPassword)
            {
                TempData["Toast"] = "Hesla se neshodují!";
                return RedirectToAction("Index");
            }

            TempData["Toast"] = $"Pøijata registrace: {name} ({email})";
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
