import client from './client';

/**
 * =====================================================
 * ADMIN LOGIN
 * =====================================================
 * API:
 * POST /api/Users/Login
 */
export const login = async (email, password) => {
  try {
    const response = await client.post('/Users/Login', {
      email: email.trim(),
      password,
    });

    const data = response.data;

    console.log('Admin login API response:', data);

    // Get JWT token from possible response formats
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
        'No token returned from login:',
        data
      );

      throw new Error(
        'Login succeeded, but no authentication token was returned by the server.'
      );
    }

    // Get user information
    const user =
      data?.user ||
      data?.User ||
      data?.data?.user ||
      data?.data?.User ||
      data?.data ||
      {};

    // Save admin token
    localStorage.setItem(
      'admin_token',
      token
    );

    // Save email
    localStorage.setItem(
      'admin_email',
      user?.email ||
        user?.Email ||
        email
    );

    // Get admin name
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

    const adminName =
      fullName ||
      user?.name ||
      user?.Name ||
      email;

    localStorage.setItem(
      'admin_name',
      adminName
    );

    // Save complete admin user
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
    console.error(
      'Admin login error:',
      error
    );

    throw error;
  }
};


/**
 * =====================================================
 * ADMIN LOGOUT
 * =====================================================
 */
export const logout = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_name');
  localStorage.removeItem('admin_email');
  localStorage.removeItem('admin_user');
};


/**
 * =====================================================
 * CHECK ADMIN LOGIN
 * =====================================================
 *
 * Used by ProtectedRoute.jsx
 */
export const isAdminLoggedIn = () => {
  return Boolean(
    localStorage.getItem('admin_token')
  );
};


/**
 * =====================================================
 * CHECK GENERAL LOGIN
 * =====================================================
 *
 * Used by ProtectedRoute.jsx
 */
export const isLoggedIn = () => {
  return Boolean(
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token')
  );
};


/**
 * =====================================================
 * GET ADMIN TOKEN
 * =====================================================
 */
export const getAdminToken = () => {
  return localStorage.getItem(
    'admin_token'
  );
};


/**
 * =====================================================
 * GET ADMIN NAME
 * =====================================================
 *
 * Used by Sidebar.jsx and Dashboard.jsx
 */
export const getAdminName = () => {
  const savedName =
    localStorage.getItem('admin_name');

  if (savedName) {
    return savedName;
  }

  const savedEmail =
    localStorage.getItem('admin_email');

  if (savedEmail) {
    return savedEmail;
  }

  return 'Admin';
};


/**
 * =====================================================
 * GET ADMIN USER
 * =====================================================
 */
export const getAdminUser = () => {
  try {
    const user =
      localStorage.getItem('admin_user');

    if (!user) {
      return null;
    }

    return JSON.parse(user);
  } catch (error) {
    console.error(
      'Unable to read admin user:',
      error
    );

    return null;
  }
};


/**
 * =====================================================
 * CLEAR ADMIN SESSION
 * =====================================================
 */
export const clearAdminSession = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_name');
  localStorage.removeItem('admin_email');
  localStorage.removeItem('admin_user');
};