using Microsoft.EntityFrameworkCore;
using MiraeLuxe.API.Data;
using MiraeLuxe.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi;
 // "DefaultConnection": "Host=pg8001.site4now.net;Port=6432;Database=db_acec3e_bishalc;Username=acec3e_bishalc;Password=Bishal@123"

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// ======================================================
// CONTROLLERS + JSON
// ======================================================

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// ======================================================
// CORS
// ======================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// ======================================================
// DATABASE
// ======================================================

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// ======================================================
// IDENTITY
// ======================================================

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 8;

    options.User.RequireUniqueEmail = true;

    options.SignIn.RequireConfirmedEmail = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// ======================================================
// JWT CONFIGURATION
// ======================================================

var jwtSettings = builder.Configuration.GetSection("JwtSettings");

var secretKey = jwtSettings["SecretKey"];

if (string.IsNullOrWhiteSpace(secretKey))
{
    throw new InvalidOperationException(
        "JWT Secret Key is not configured."
    );
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
        JwtBearerDefaults.AuthenticationScheme;

    options.DefaultChallengeScheme =
        JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],

            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(secretKey)
                ),

            ClockSkew = TimeSpan.Zero
        };
});

// ======================================================
// SWAGGER
// ======================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "BishalCare API",
            Version = "v1",
            Description = "BishalCare Beauty & Skincare E-commerce API"
        }
    );
});

// ======================================================
// BUILD APP
// ======================================================

var app = builder.Build();

// ======================================================
// ERROR / DEVELOPMENT SETTINGS
// ======================================================

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// ======================================================
// SWAGGER
// ======================================================

app.UseSwagger();

app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint(
        "/swagger/v1/swagger.json",
        "BishalCare API v1"
    );
});

// ======================================================
// STATIC FILES
// React production build will be placed in wwwroot
// ======================================================

app.UseDefaultFiles();
app.UseStaticFiles();

// ======================================================
// CORS
// ======================================================

app.UseCors("AllowAll");

// ======================================================
// AUTHENTICATION / AUTHORIZATION
// ======================================================

app.UseAuthentication();
app.UseAuthorization();

// ======================================================
// API CONTROLLERS
// ======================================================

app.MapControllers();

// ======================================================
// DATABASE MIGRATION + ADMIN ROLE SEEDING
// ======================================================

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    try
    {
        var db =
            services.GetRequiredService<ApplicationDbContext>();

        // Apply pending EF Core migrations
        db.Database.Migrate();

        // ----------------------------------------------
        // Role Manager
        // ----------------------------------------------

        var roleManager =
            services.GetRequiredService<RoleManager<IdentityRole>>();

        // ----------------------------------------------
        // User Manager
        // ----------------------------------------------

        var userManager =
            services.GetRequiredService<UserManager<ApplicationUser>>();

        const string adminRole = "Admin";

        // ----------------------------------------------
        // Create Admin role if it doesn't exist
        // ----------------------------------------------

        if (!await roleManager.RoleExistsAsync(adminRole))
        {
            var roleResult =
                await roleManager.CreateAsync(
                    new IdentityRole(adminRole)
                );

            if (!roleResult.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    roleResult.Errors.Select(e => e.Description)
                );

                Console.WriteLine(
                    $"Failed to create Admin role: {errors}"
                );
            }
        }

        // ----------------------------------------------
        // Admin emails from configuration
        // ----------------------------------------------

        var adminEmails =
            builder.Configuration
                .GetSection("AdminSettings:AdminEmails")
                .Get<string[]>()
            ?? Array.Empty<string>();

        // ----------------------------------------------
        // Assign Admin role
        // ----------------------------------------------

        foreach (var email in adminEmails)
        {
            if (string.IsNullOrWhiteSpace(email))
                continue;

            var user =
                await userManager.FindByEmailAsync(email);

            if (user == null)
            {
                Console.WriteLine(
                    $"Admin user not found: {email}"
                );

                continue;
            }

            var alreadyAdmin =
                await userManager.IsInRoleAsync(
                    user,
                    adminRole
                );

            if (!alreadyAdmin)
            {
                var result =
                    await userManager.AddToRoleAsync(
                        user,
                        adminRole
                    );

                if (!result.Succeeded)
                {
                    var errors = string.Join(
                        ", ",
                        result.Errors.Select(
                            e => e.Description
                        )
                    );

                    Console.WriteLine(
                        $"Failed to assign Admin role to {email}: {errors}"
                    );
                }
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine(
            $"Database/role initialization error: {ex.Message}"
        );
    }
}

// ======================================================
// REACT SPA FALLBACK
// IMPORTANT:
// This must come AFTER MapControllers()
// ======================================================

app.MapFallbackToFile("index.html");

// ======================================================
// START APPLICATION
// ======================================================

app.Run();