using FoodDeliveryWebApplication.WebMvcApp.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public class FoodExpressController : Controller
{
    private readonly AppDbContext _db;

    public FoodExpressController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Menu()
    {
        var products = await _db.Products.ToListAsync();
        return View(products);
    }

    [HttpGet]
    public IActionResult Checkout()
    {
        return View();
    }
}
