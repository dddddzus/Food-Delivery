using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDeliveryWebApplication.WebMvcApp.Entities
{
    [Table("products")]
    public class Product
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("category_id")]
        public int CategoryId { get; set; }

        [Column("name")]
        public string Name { get; set; } = "";

        [Column("description")]
        public string Description { get; set; } = "";

        [Column("price_czk")]
        public int Price { get; set; }

        [Column("image_url")]
        public string ImageUrl { get; set; } = "";

        [Column("prep_time")]
        public string PrepTime { get; set; } = "";

        [Column("calories")]
        public string Calories { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; }
    }
}
