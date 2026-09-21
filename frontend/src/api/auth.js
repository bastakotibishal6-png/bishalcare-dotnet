import client from './client';

/**
 * Admin Login
 *
 * API:
 * POST /api/Users/Login
 */
export const login = async (email, password) => {
  try {
    const response = await client.post('/Users/Login', {
      email,
      password,
    });

    const data = response.data;

    console.log('Admin login API response:', data);

    // =================================================
    // GET TOKEN
    // =================================================
    const token =
      data?.token ||
      data?.Token ||
      data?.accessToken ||
      data?.access_token ||
      data?.data?.token ||
      data?.data?.Token ||
      data?.data?.accessToken;

    if (!token) {
      console.error(
        'Login response did not contain a JWT token:',
        data
      );

      throw new Error(
        'Login succeeded, but the server did not return an authentication token.'
      );
    }

    // =================================================
    // GET USER INFORMATION
    // =================================================
    const user =
      data?.user ||
      data?.User ||
      data?.data?.user ||
      data?.data?.User ||
      data?.data ||
      {};

    // =================================================
    // SAVE ADMIN SESSION
    // =================================================
    localStorage.setItem('admin_token', token);

    localStorage.setItem(
      'admin_email',
      user?.email ||
        user?.Email ||
        email
    );

    const firstName =
      user?.firstName ||
      user?.FirstName ||
      '';

    const lastName =
      user?.lastName ||
      user?.LastName ||
      '';

    const fullName =
      `${firstName} ${lastName}`.trim();

    if (fullName) {
      localStorage.setItem('admin_name', fullName);
    } else {
      localStorage.setItem(
        'admin_name',
        user?.name ||
          user?.Name ||
          email
      );
    }

    // Save complete response/user for later use
    localStorage.setItem(
      'admin_user',
      JSON.stringify(user)
    );

    return {
      success: true,
      token,
      user,
      data,
    };
  } catch (error) {
    console.error('Admin login API error:', error);

    // Preserve the original Axios error so the Login
    // component can display the backend message.
    throw error;
  }
};

/**
 * Logout Admin
 */
export const logout = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_name');
  localStorage.removeItem('admin_email');
  localStorage.removeItem('admin_user');
};

/**
 * Check whether an admin token exists
 */
export const isAdminLoggedIn = () => {
  return Boolean(localStorage.getItem('admin_token'));
};

/**
 * Get currently stored admin token
 */
export const getAdminToken = () => {
  return localStorage.getItem('admin_token');
};

/**
 * Get stored admin user
 */
export const getAdminUser = () => {
  try {
    const user = localStorage.getItem('admin_user');

    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};