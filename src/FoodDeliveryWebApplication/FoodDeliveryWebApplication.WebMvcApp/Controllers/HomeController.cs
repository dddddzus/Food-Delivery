using System.Diagnostics;
using FoodDeliveryWebApplication.WebMvcApp.Models;
using Microsoft.AspNetCore.Mvc;

namespace FoodDeliveryWebApplication.WebMvcApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        // LOGIN POST (zatím pøipravené)
        [HttpPost]
        public IActionResult Login(string email, string password)
        {
            // TODO: Ve škole: najít uživatele v DB + ovìøit heslo 
            // teï jen ukázka, že se to chytí:
            TempData["Toast"] = $"Pøijat login: {email}";
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
