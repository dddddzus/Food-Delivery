using System.ComponentModel.DataAnnotations;

namespace FoodDeliveryWebApplication.WebMvcApp.Models.Account
{
    public class RegisterViewModel
    {
        [Required(ErrorMessage = "Zadej jméno")]
        public string Name { get; set; } = "";

        [Required(ErrorMessage = "Zadej email")]
        [EmailAddress(ErrorMessage = "Email není ve správném formátu")]
        public string Email { get; set; } = "";

        public string? Phone { get; set; }

        [Required(ErrorMessage = "Zadej heslo")]
        [MinLength(4, ErrorMessage = "Heslo je moc krátké")]
        public string Password { get; set; } = "";

        [Required(ErrorMessage = "Potvrď heslo")]
        [Compare(nameof(Password), ErrorMessage = "Hesla se neshodují")]
        public string ConfirmPassword { get; set; } = "";
    }
}
