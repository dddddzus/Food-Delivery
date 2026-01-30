using Microsoft.AspNetCore.Mvc;

namespace FoodDeliveryWebApplication.WebMvcApp.Controllers
{
    public class FoodExpressController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View(); // Views/FoodExpress/Index.cshtml
        }

        [HttpGet]
        public IActionResult Menu()
        {
            return View(); // Views/FoodExpress/Menu.cshtml
        }
    }
}
