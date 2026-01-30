using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDeliveryWebApplication.WebMvcApp.Entities
{
    [Table("users")]
    public class User
    {
        private User()
        {
            // Constructor for EF Core
        }

        public User(string name, string email, string password, string? phone = null)
        {
            Name = name;
            Email = email;
            Password = password;
            Phone = phone;
        }

        public User(int id, string name, string email, string password, string? phone = null)
        {
            Id = id;
            Name = name;
            Email = email;
            Password = password;
            Phone = phone;
        }

        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        [Required]
        public string Name { get; set; } = "";

        [Column("email")]
        [Required]
        public string Email { get; set; } = "";

        [Column("phone")]
        public string? Phone { get; set; }

        [Column("password")]
        [Required]
        public string Password { get; set; } = "";

    }
}
