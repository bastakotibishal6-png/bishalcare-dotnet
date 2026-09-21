using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MiraeLuxe.API.Models;

namespace MiraeLuxe.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;

        public UsersController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        // =========================================================
        // REGISTER
        // =========================================================

        [HttpPost("Register")]
        public async Task<ActionResult> Register(
            [FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var existingUser =
                    await _userManager.FindByEmailAsync(model.Email);

                if (existingUser != null)
                {
                    return BadRequest(new
                    {
                        Message = "An account with this email already exists."
                    });
                }

                var user = new ApplicationUser
                {
                    UserName = model.Email,
                    Email = model.Email,
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    PhoneNumber = model.PhoneNumber,
                    Address = model.Address,
                    City = model.City,
                    PostalCode = model.PostalCode,
                    CreatedDate = DateTime.Now
                };

                var result =
                    await _userManager.CreateAsync(
                        user,
                        model.Password);

                if (!result.Succeeded)
                {
                    return BadRequest(new
                    {
                        Errors = result.Errors.Select(
                            e => e.Description)
                    });
                }

                return Ok(new
                {
                    Message = "User registered successfully",
                    UserId = user.Id,
                    Email = user.Email
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"REGISTER ERROR: {ex}");

                return StatusCode(500, new
                {
                    Message = "Registration failed",
                    Error = ex.Message
                });
            }
        }

        // =========================================================
        // LOGIN
        // =========================================================

        [HttpPost("Login")]
        public async Task<ActionResult> Login(
            [FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // ---------------------------------------------
                // 1. Find user
                // ---------------------------------------------

                var user =
                    await _userManager.FindByEmailAsync(model.Email);

                if (user == null)
                {
                    return Unauthorized(new
                    {
                        Message = "Invalid email or password"
                    });
                }

                // ---------------------------------------------
                // 2. Check password
                // ---------------------------------------------

                var passwordResult =
                    await _signInManager.CheckPasswordSignInAsync(
                        user,
                        model.Password,
                        false);

                if (!passwordResult.Succeeded)
                {
                    return Unauthorized(new
                    {
                        Message = "Invalid email or password"
                    });
                }

                // ---------------------------------------------
                // 3. Update last login
                // ---------------------------------------------

                user.LastLoginDate = DateTime.Now;

                var updateResult =
                    await _userManager.UpdateAsync(user);

                if (!updateResult.Succeeded)
                {
                    return StatusCode(500, new
                    {
                        Message = "Failed to update user",
                        Errors = updateResult.Errors.Select(
                            e => e.Description)
                    });
                }

                // ---------------------------------------------
                // 4. Get roles
                // ---------------------------------------------

                var roles =
                    await _userManager.GetRolesAsync(user);

                // ---------------------------------------------
                // 5. Generate JWT
                // ---------------------------------------------

                var token =
                    GenerateJwtToken(user, roles);

                // ---------------------------------------------
                // 6. Return login response
                // ---------------------------------------------

                return Ok(new
                {
                    Token = token,
                    UserId = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    IsMember = user.IsMember,
                    Roles = roles,
                    IsAdmin = roles.Contains("Admin"),
                    Message = "Login successful"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "========== LOGIN ERROR ==========");

                Console.WriteLine(ex.ToString());

                Console.WriteLine(
                    "=================================");

                return StatusCode(500, new
                {
                    Message = "Login failed",
                    Error = ex.Message
                });
            }
        }

        // =========================================================
        // GET PROFILE
        // =========================================================

        [Authorize]
        [HttpGet("Profile")]
        public async Task<ActionResult> GetProfile()
        {
            try
            {
                var userId =
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var user =
                    await _userManager.FindByIdAsync(userId);

                if (user == null)
                    return NotFound();

                return Ok(new
                {
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.PhoneNumber,
                    user.Address,
                    user.City,
                    user.PostalCode,
                    user.IsMember,
                    user.CreatedDate
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"GET PROFILE ERROR: {ex}");

                return StatusCode(500, new
                {
                    Message = "Failed to get profile",
                    Error = ex.Message
                });
            }
        }

        // =========================================================
        // UPDATE PROFILE
        // =========================================================

        [Authorize]
        [HttpPut("Profile")]
        public async Task<ActionResult> UpdateProfile(
            [FromBody] UpdateProfileModel model)
        {
            try
            {
                var userId =
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var user =
                    await _userManager.FindByIdAsync(userId);

                if (user == null)
                    return NotFound();

                user.FirstName =
                    model.FirstName ?? user.FirstName;

                user.LastName =
                    model.LastName ?? user.LastName;

                user.PhoneNumber =
                    model.PhoneNumber ?? user.PhoneNumber;

                user.Address =
                    model.Address ?? user.Address;

                user.City =
                    model.City ?? user.City;

                user.PostalCode =
                    model.PostalCode ?? user.PostalCode;

                var result =
                    await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                {
                    return BadRequest(new
                    {
                        Errors = result.Errors.Select(
                            e => e.Description)
                    });
                }

                return Ok(new
                {
                    Message = "Profile updated successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"UPDATE PROFILE ERROR: {ex}");

                return StatusCode(500, new
                {
                    Message = "Failed to update profile",
                    Error = ex.Message
                });
            }
        }

        // =========================================================
        // JWT TOKEN
        // =========================================================

        private string GenerateJwtToken(
            ApplicationUser user,
            IList<string> roles)
        {
            var secretKey =
                _configuration["JwtSettings:SecretKey"];

            var issuer =
                _configuration["JwtSettings:Issuer"];

            var audience =
                _configuration["JwtSettings:Audience"];

            if (string.IsNullOrWhiteSpace(secretKey))
            {
                throw new InvalidOperationException(
                    "JwtSettings:SecretKey is missing.");
            }

            if (string.IsNullOrWhiteSpace(issuer))
            {
                throw new InvalidOperationException(
                    "JwtSettings:Issuer is missing.");
            }

            if (string.IsNullOrWhiteSpace(audience))
            {
                throw new InvalidOperationException(
                    "JwtSettings:Audience is missing.");
            }

            if (secretKey.Length < 32)
            {
                throw new InvalidOperationException(
                    "JwtSettings:SecretKey must be at least 32 characters long.");
            }

            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id),

                new Claim(
                    ClaimTypes.Email,
                    user.Email ?? ""),

                new Claim(
                    ClaimTypes.Name,
                    $"{user.FirstName} {user.LastName}"),

                new Claim(
                    "IsMember",
                    user.IsMember.ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(
                    new Claim(
                        ClaimTypes.Role,
                        role));
            }

            var key =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(secretKey));

            var credentials =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256);

            var token =
                new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    expires: DateTime.Now.AddDays(1),
                    signingCredentials: credentials);

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }

    // =============================================================
    // REGISTER MODEL
    // =============================================================

    public class RegisterModel
    {
        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string PostalCode { get; set; } = string.Empty;
    }

    // =============================================================
    // LOGIN MODEL
    // =============================================================

    public class LoginModel
    {
        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
    }

    // =============================================================
    // UPDATE PROFILE MODEL
    // =============================================================

    public class UpdateProfileModel
    {
        public string? FirstName { get; set; }

        public string? LastName { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }

        public string? City { get; set; }

        public string? PostalCode { get; set; }
    }
}