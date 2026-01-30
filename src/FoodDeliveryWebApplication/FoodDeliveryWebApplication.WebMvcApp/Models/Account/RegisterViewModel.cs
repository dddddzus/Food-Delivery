namespace FoodDeliveryWebApplication.WebMvcApp.Models.Account
{
    public class RegisterViewModel
    {
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string ConfirmPassword { get; set; } = "";
        public string? Phone { get; set; }
    }
}
