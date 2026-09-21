import axios from 'axios';

// ============================================================
// API CONFIGURATION
// ============================================================

export const API_BASE_URL = 'https://bishalvoid-001-site1.ktempurl.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// AUTHENTICATION / TOKEN
// ============================================================

// Add JWT token to every request.
// Supports both normal user token and admin token.
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 ||
        error.response.status === 403)
    ) {
      const currentPath = window.location.pathname;

      if (currentPath !== '/login') {
        // Remove both token types
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');

        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================
// ADMIN LOGIN
// ============================================================

const LOGIN_ENDPOINT = '/Users/Login';

export async function login(email, password) {
  const response = await api.post(LOGIN_ENDPOINT, {
    email,
    password,
  });

  /*
    Backend can return either:

    {
      Token,
      UserId,
      Email,
      FirstName,
      LastName,
      IsMember,
      Roles,
      IsAdmin,
      Message
    }

    or camelCase JSON.
  */

  const {
    token,
    isAdmin,
    firstName,
    lastName,
    email: userEmail,
  } = normalizeKeys(response.data);

  if (!token) {
    throw new Error(
      'Login succeeded but no token was returned.'
    );
  }

  if (!isAdmin) {
    throw new Error(
      'This account does not have Admin access. Add its email to AdminSettings:AdminEmails in appsettings.json and restart the backend.'
    );
  }

  localStorage.setItem('admin_token', token);

  localStorage.setItem(
    'admin_name',
    `${firstName || ''} ${lastName || ''}`.trim()
  );

  localStorage.setItem(
    'admin_email',
    userEmail || ''
  );

  return response.data;
}

// Handle both PascalCase and camelCase responses
function normalizeKeys(obj) {
  return {
    token: obj.token || obj.Token,

    isAdmin:
      obj.isAdmin ??
      obj.IsAdmin ??
      false,

    firstName:
      obj.firstName ||
      obj.FirstName,

    lastName:
      obj.lastName ||
      obj.LastName,

    email:
      obj.email ||
      obj.Email,
  };
}

// ============================================================
// LOGOUT
// ============================================================

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_name');
  localStorage.removeItem('admin_email');

  window.location.href = '/login';
}

// ============================================================
// AUTH HELPERS
// ============================================================

export function isLoggedIn() {
  return !!(
    localStorage.getItem('token') ||
    localStorage.getItem('admin_token')
  );
}

export function getAdminName() {
  return (
    localStorage.getItem('admin_name') ||
    'Admin'
  );
}

// ============================================================
// PRODUCTS API
// ============================================================

export const productsAPI = {
  getAll: (params) =>
    api.get('/Products', { params }),

  getById: (id) =>
    api.get(`/Products/${id}`),

  getCategories: () =>
    api.get('/Products/Categories'),

  getMiniGifts: () =>
    api.get('/Products/MiniGifts'),
};

// ============================================================
// USERS API
// ============================================================

export const usersAPI = {
  register: (data) =>
    api.post('/Users/Register', data),

  login: (data) =>
    api.post('/Users/Login', data),

  getProfile: () =>
    api.get('/Users/Profile'),

  updateProfile: (data) =>
    api.put('/Users/Profile', data),
};

// ============================================================
// CART API
// ============================================================

export const cartAPI = {
  getCart: () =>
    api.get('/Cart'),

  addToCart: (data) => {
    console.log(
      'cartAPI.addToCart called with:',
      data
    );

    return api.post('/Cart/AddItem', data);
  },

  addItem: (data) =>
    api.post('/Cart/AddItem', data),

  updateQuantity: (data) =>
    api.put('/Cart/UpdateQuantity', data),

  removeItem: (id) =>
    api.delete(`/Cart/RemoveItem/${id}`),

  clearCart: () =>
    api.delete('/Cart/Clear'),
};

// ============================================================
// ORDERS API
// ============================================================

export const ordersAPI = {
  checkout: (data) =>
    api.post('/Orders/Checkout', data),

  getHistory: () =>
    api.get('/Orders/History'),

  getOrder: (id) =>
    api.get(`/Orders/${id}`),

  trackOrder: (trackingNumber) =>
    api.get(`/Orders/Track/${trackingNumber}`),
};

// ============================================================
// MEMBERSHIP API
// ============================================================

export const membershipAPI = {
  getStatus: () =>
    api.get('/Membership/Status'),

  join: (data) =>
    api.post('/Membership/Join', data),

  renew: () =>
    api.post('/Membership/Renew'),

  getBenefits: () =>
    api.get('/Membership/Benefits'),

  getSavings: () =>
    api.get('/Membership/Savings'),
};

// ============================================================
// REVIEWS API
// ============================================================

export const reviewsAPI = {
  getProductReviews: (productId) =>
    api.get(`/Reviews/Product/${productId}`),

  addReview: (data) =>
    api.post('/Reviews', data),

  updateReview: (id, data) =>
    api.put(`/Reviews/${id}`, data),

  deleteReview: (id) =>
    api.delete(`/Reviews/${id}`),

  getPendingReminder: () =>
    api.get('/Reviews/PendingReminder'),

  dismissReminder: () =>
    api.post('/Reviews/DismissReminder'),
};

// ============================================================
// WISHLIST API
// ============================================================

export const wishlistAPI = {
  getWishlist: () =>
    api.get('/Wishlist'),

  addToWishlist: (data) => {
    console.log(
      'wishlistAPI.addToWishlist called with:',
      data
    );

    return api.post('/Wishlist/Add', data);
  },

  removeFromWishlist: (id) =>
    api.delete(`/Wishlist/Remove/${id}`),

  checkIfInWishlist: (productId) =>
    api.get(`/Wishlist/Check/${productId}`),

  moveToCart: (id) =>
    api.post(`/Wishlist/MoveToCart/${id}`),
};

// ============================================================
// QUIZ API
// ============================================================

export const quizAPI = {
  submitQuiz: (data) =>
    api.post('/Quiz/Submit', data),

  getHistory: () =>
    api.get('/Quiz/History'),
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default api;
