using FoodDeliveryWebApplication.WebMvcApp.Data;
using FoodDeliveryWebApplication.WebMvcApp.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryWebApplication.WebMvcApp.Controllers
{
    [Authorize]
    public class CartController : Controller
    {
        private readonly AppDbContext _db;
        public CartController(AppDbContext db) => _db = db;

        private int UserId() => int.Parse(User.Claims.First(c => c.Type == "id").Value);

        // GET /Cart/Get
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            int userId = UserId();

            var items = await _db.CartItems
                .Where(ci => ci.UserId == userId)
                .Join(_db.Products,
                    ci => ci.ProductId,
                    p => p.Id,
                    (ci, p) => new
                    {
                        productId = p.Id,
                        name = p.Name,
                        price = p.Price,      // ✅ tvoje entita
                        image = p.ImageUrl,   // ✅ tvoje entita
                        quantity = ci.Quantity
                    })
                .ToListAsync();

            return Json(items);
        }

        // POST /Cart/Add?productId=5
        [HttpPost]
        public async Task<IActionResult> Add(int productId)
        {
            int userId = UserId();

            var row = await _db.CartItems
                .FirstOrDefaultAsync(x => x.UserId == userId && x.ProductId == productId);

            if (row == null)
                _db.CartItems.Add(new CartItem { UserId = userId, ProductId = productId, Quantity = 1 });
            else
                row.Quantity++;

            await _db.SaveChangesAsync();
            return Ok();
        }

        // POST /Cart/SetQty?productId=5&qty=3 (qty=0 smaže)
        [HttpPost]
        public async Task<IActionResult> SetQty(int productId, int qty)
        {
            int userId = UserId();

            var row = await _db.CartItems
                .FirstOrDefaultAsync(x => x.UserId == userId && x.ProductId == productId);

            if (qty <= 0)
            {
                if (row != null) _db.CartItems.Remove(row);
            }
            else
            {
                if (row == null)
                    _db.CartItems.Add(new CartItem { UserId = userId, ProductId = productId, Quantity = qty });
                else
                    row.Quantity = qty;
            }

            await _db.SaveChangesAsync();
            return Ok();
        }

        // POST /Cart/Remove?productId=5
        [HttpPost]
        public async Task<IActionResult> Remove(int productId)
        {
            int userId = UserId();

            var row = await _db.CartItems
                .FirstOrDefaultAsync(x => x.UserId == userId && x.ProductId == productId);

            if (row != null)
            {
                _db.CartItems.Remove(row);
                await _db.SaveChangesAsync();
            }

            return Ok();
        }
    }
}
