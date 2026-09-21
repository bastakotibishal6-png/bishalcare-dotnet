import client from './client';

const LOGIN_ENDPOINT = '/Users/Login';

export async function login(email, password) {
  const response = await client.post(
    LOGIN_ENDPOINT,
    {
      email,
      password,
    }
  );

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
      'This account does not have Admin access. ' +
      'Add its email to AdminSettings:AdminEmails in appsettings.json and restart the backend.'
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

function normalizeKeys(obj) {
  return {
    token: obj?.token || obj?.Token,

    isAdmin:
      obj?.isAdmin ??
      obj?.IsAdmin ??
      false,

    firstName:
      obj?.firstName ||
      obj?.FirstName ||
      '',

    lastName:
      obj?.lastName ||
      obj?.LastName ||
      '',

    email:
      obj?.email ||
      obj?.Email ||
      '',
  };
}

export function logout() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_name');
  localStorage.removeItem('admin_email');

  window.location.href = '/login';
}

export function isLoggedIn() {
  return !!localStorage.getItem('admin_token');
}

export function getAdminName() {
  return (
    localStorage.getItem('admin_name') ||
    'Admin'
  );
}