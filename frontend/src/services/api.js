import client from '../api/client';

// ============================================================
// ADMIN LOGIN
// ============================================================

const LOGIN_ENDPOINT = '/Users/Login';

export async function login(email, password) {
  const response = await client.post(LOGIN_ENDPOINT, {
    email,
    password,
  });

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
      'This account does not have Admin access.'
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

// ============================================================
// HANDLE API RESPONSE KEYS
// ============================================================

function normalizeKeys(obj) {
  return {
    token: obj?.token || obj?.Token,

    isAdmin:
      obj?.isAdmin ??
      obj?.IsAdmin ??
      false,

    firstName:
      obj?.firstName ||
      obj?.FirstName,

    lastName:
      obj?.lastName ||
      obj?.LastName,

    email:
      obj?.email ||
      obj?.Email,
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
    client.get('/Products', { params }),

  getById: (id) =>
    client.get(`/Products/${id}`),

  getCategories: () =>
    client.get('/Products/Categories'),

  getMiniGifts: () =>
    client.get('/Products/MiniGifts'),
};

// ============================================================
// USERS API
// ============================================================

export const usersAPI = {
  register: (data) =>
    client.post('/Users/Register', data),

  login: (data) =>
    client.post('/Users/Login', data),

  getProfile: () =>
    client.get('/Users/Profile'),

  updateProfile: (data) =>
    client.put('/Users/Profile', data),
};

// ============================================================
// CART API
// ============================================================

export const cartAPI = {
  getCart: () =>
    client.get('/Cart'),

  addToCart: (data) => {
    console.log(
      'cartAPI.addToCart called with:',
      data
    );

    return client.post('/Cart/AddItem', data);
  },

  addItem: (data) =>
    client.post('/Cart/AddItem', data),

  updateQuantity: (data) =>
    client.put('/Cart/UpdateQuantity', data),

  removeItem: (id) =>
    client.delete(`/Cart/RemoveItem/${id}`),

  clearCart: () =>
    client.delete('/Cart/Clear'),
};

// ============================================================
// ORDERS API
// ============================================================

export const ordersAPI = {
  checkout: (data) =>
    client.post('/Orders/Checkout', data),

  getHistory: () =>
    client.get('/Orders/History'),

  getOrder: (id) =>
    client.get(`/Orders/${id}`),

  trackOrder: (trackingNumber) =>
    client.get(`/Orders/Track/${trackingNumber}`),
};

// ============================================================
// MEMBERSHIP API
// ============================================================

export const membershipAPI = {
  getStatus: () =>
    client.get('/Membership/Status'),

  join: (data) =>
    client.post('/Membership/Join', data),

  renew: () =>
    client.post('/Membership/Renew'),

  cancel: () =>
    client.post('/Membership/Cancel'),

  getBenefits: () =>
    client.get('/Membership/Benefits'),

  getSavings: () =>
    client.get('/Membership/Savings'),
};

// ============================================================
// REVIEWS API
// ============================================================

export const reviewsAPI = {
  getProductReviews: (productId) =>
    client.get(`/Reviews/Product/${productId}`),

  addReview: (data) =>
    client.post('/Reviews', data),

  updateReview: (id, data) =>
    client.put(`/Reviews/${id}`, data),

  deleteReview: (id) =>
    client.delete(`/Reviews/${id}`),

  getPendingReminder: () =>
    client.get('/Reviews/PendingReminder'),

  dismissReminder: () =>
    client.post('/Reviews/DismissReminder'),
};

// ============================================================
// WISHLIST API
// ============================================================

export const wishlistAPI = {
  getWishlist: () =>
    client.get('/Wishlist'),

  addToWishlist: (data) => {
    console.log(
      'wishlistAPI.addToWishlist called with:',
      data
    );

    return client.post('/Wishlist/Add', data);
  },

  removeFromWishlist: (id) =>
    client.delete(`/Wishlist/Remove/${id}`),

  checkIfInWishlist: (productId) =>
    client.get(`/Wishlist/Check/${productId}`),

  moveToCart: (id) =>
    client.post(`/Wishlist/MoveToCart/${id}`),
};

// ============================================================
// QUIZ API
// ============================================================

export const quizAPI = {
  submitQuiz: (data) =>
    client.post('/Quiz/Submit', data),

  getHistory: () =>
    client.get('/Quiz/History'),
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default client;