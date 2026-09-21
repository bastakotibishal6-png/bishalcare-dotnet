using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiraeLuxe.API.Data;
using MiraeLuxe.API.Models;

namespace MiraeLuxe.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // ---------- ORDERS ----------

        [HttpGet("Orders")]
        public async Task<ActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new
                {
                    o.OrderId,
                    o.OrderDate,
                    o.Subtotal,
                    o.DiscountAmount,
                    o.ShippingFee,
                    o.FinalTotal,
                    o.Status,
                    o.ShippingAddress,
                    o.TrackingNumber,
                    o.DeliveryDate,
                    CustomerName = o.User != null ? $"{o.User.FirstName} {o.User.LastName}" : "Unknown",
                    CustomerEmail = o.User != null ? o.User.Email : null,
                    ItemCount = o.OrderItems.Count(oi => !oi.IsFreeGift)
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("Orders/{id}")]
        public async Task<ActionResult> GetOrderDetail(int id)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.Payment)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
                return NotFound(new { Message = "Order not found" });

            return Ok(new
            {
                order.OrderId,
                order.OrderDate,
                order.Subtotal,
                order.DiscountAmount,
                order.ShippingFee,
                order.FinalTotal,
                order.Status,
                order.ShippingAddress,
                order.TrackingNumber,
                order.DeliveryDate,
                CustomerName = order.User != null ? $"{order.User.FirstName} {order.User.LastName}" : "Unknown",
                CustomerEmail = order.User != null ? order.User.Email : null,
                PaymentMethod = order.Payment?.PaymentMethod,
                PaymentStatus = order.Payment?.Status,
                Items = order.OrderItems.Select(oi => new
                {
                    oi.ProductId,
                    ProductName = oi.Product != null ? oi.Product.Name : "Unknown",
                    oi.Quantity,
                    oi.Price,
                    oi.Subtotal,
                    oi.IsFreeGift,
                    oi.SelectedShade
                })
            });
        }

        public class UpdateOrderStatusModel
        {
            public string Status { get; set; } = string.Empty;
        }

        [HttpPut("Orders/{id}/Status")]
        public async Task<ActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusModel model)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound(new { Message = "Order not found" });

            var validStatuses = new[] { "Pending", "Paid", "Processing", "Shipped", "Delivered", "Cancelled" };
            if (!validStatuses.Contains(model.Status))
                return BadRequest(new { Message = $"Status must be one of: {string.Join(", ", validStatuses)}" });

            order.Status = model.Status;

            if (model.Status == "Delivered" && order.DeliveryDate == null)
                order.DeliveryDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Order status updated", order.OrderId, order.Status });
        }

        // ---------- USERS ----------

        [HttpGet("Users")]
        public async Task<ActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    u.PhoneNumber,
                    u.City,
                    u.IsMember,
                    u.CreatedDate,
                    u.LastLoginDate
                })
                .OrderByDescending(u => u.CreatedDate)
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("Users/{id}")]
        public async Task<ActionResult> GetUserDetail(string id)
        {
            var user = await _context.Users
                .Include(u => u.Membership)
                .Include(u => u.Orders)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound(new { Message = "User not found" });

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
                user.CreatedDate,
                user.LastLoginDate,
                OrderCount = user.Orders.Count,
                IsActiveMember = user.Membership != null && user.Membership.IsActive && user.Membership.ExpiryDate > DateTime.Now
            });
        }

        // ---------- DASHBOARD SUMMARY ----------

        [HttpGet("Summary")]
        public async Task<ActionResult> GetDashboardSummary()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var totalRevenue = await _context.Orders
                .Where(o => o.Status != "Cancelled")
                .SumAsync(o => o.FinalTotal);
            var totalUsers = await _context.Users.CountAsync();
            var totalProducts = await _context.Products.CountAsync(p => !p.IsMiniGift);
            var pendingOrders = await _context.Orders.CountAsync(o => o.Status == "Pending" || o.Status == "Paid");

            return Ok(new
            {
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                TotalUsers = totalUsers,
                TotalProducts = totalProducts,
                PendingOrders = pendingOrders
            });
        }
    }
}
