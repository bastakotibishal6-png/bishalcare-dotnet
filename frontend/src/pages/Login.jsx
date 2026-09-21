import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import client from '../api/client';
import { login as adminLogin } from '../api/auth';

import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // =====================================================
  // INPUT CHANGE
  // =====================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError('');
  };

  // =====================================================
  // CUSTOMER LOGIN
  // =====================================================
  const handleUserLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      // Remove admin session
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_name');
      localStorage.removeItem('admin_email');
      localStorage.removeItem('admin_user');

      // -----------------------------------------------
      // POST /api/Users/Login
      // -----------------------------------------------
      const response = await client.post('/Users/Login', {
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log(
        'Customer login response:',
        response.data
      );

      const responseData = response.data;

      // -----------------------------------------------
      // GET TOKEN
      // -----------------------------------------------
      const token =
        responseData?.token ||
        responseData?.Token ||
        responseData?.accessToken ||
        responseData?.access_token ||
        responseData?.data?.token ||
        responseData?.data?.Token ||
        responseData?.data?.accessToken;

      if (!token) {
        throw new Error(
          'Login successful but no authentication token was returned.'
        );
      }

      localStorage.setItem('token', token);

      // -----------------------------------------------
      // GET USER
      // -----------------------------------------------
      const userData =
        responseData?.user ||
        responseData?.User ||
        responseData?.data?.user ||
        responseData?.data?.User ||
        responseData?.data ||
        responseData;

      const user = {
        userId:
          userData?.userId ||
          userData?.UserId ||
          userData?.id ||
          userData?.Id ||
          null,

        firstName:
          userData?.firstName ||
          userData?.FirstName ||
          '',

        lastName:
          userData?.lastName ||
          userData?.LastName ||
          '',

        email:
          userData?.email ||
          userData?.Email ||
          formData.email,

        phoneNumber:
          userData?.phoneNumber ||
          userData?.PhoneNumber ||
          '',

        address:
          userData?.address ||
          userData?.Address ||
          '',

        city:
          userData?.city ||
          userData?.City ||
          '',

        postalCode:
          userData?.postalCode ||
          userData?.PostalCode ||
          '',

        isMember:
          userData?.isMember ??
          userData?.IsMember ??
          false,

        membershipStartDate:
          userData?.membershipStartDate ||
          userData?.MembershipStartDate ||
          null,

        membershipEndDate:
          userData?.membershipEndDate ||
          userData?.MembershipEndDate ||
          null,

        createdDate:
          userData?.createdDate ||
          userData?.CreatedDate ||
          null,
      };

      localStorage.setItem(
        'user',
        JSON.stringify(user)
      );

      alert('Login successful!');

      navigate('/my-account');
    } catch (err) {
      console.error(
        'Customer login error:',
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        err?.response?.data?.error ||
        err?.message ||
        'Login failed. Please check your email and password.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ADMIN LOGIN
  // =====================================================
  const handleAdminLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      // -----------------------------------------------
      // Remove customer session
      // -----------------------------------------------
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // -----------------------------------------------
      // Admin login
      //
      // POST /api/Users/Login
      // -----------------------------------------------
      const result = await adminLogin(
        formData.email.trim(),
        formData.password
      );

      console.log(
        'Admin login successful:',
        result
      );

      const adminToken =
        localStorage.getItem('admin_token');

      if (!adminToken) {
        throw new Error(
          'Login succeeded but admin authentication token was not saved.'
        );
      }

      alert('Admin login successful!');

      // -----------------------------------------------
      // Go to admin dashboard
      // -----------------------------------------------
      navigate('/admin');
    } catch (err) {
      console.error(
        'Admin login error:',
        err
      );

      // -----------------------------------------------
      // Backend error
      // -----------------------------------------------
      let message =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        err?.response?.data?.error;

      // -----------------------------------------------
      // Axios network error
      // -----------------------------------------------
      if (!message && !err?.response) {
        message =
          'Network Error: Unable to connect to BishalCare API.';
      }

      if (!message) {
        message =
          err?.message ||
          'Admin login failed. Please check your email and password.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================
  const handleRegister = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await client.post('/Users/Register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
      });

      alert(
        'Registration successful! Please login.'
      );

      setIsLogin(true);

      setFormData({
        email: formData.email,
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        city: '',
        postalCode: '',
      });
    } catch (err) {
      console.error(
        'Registration error:',
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        err?.response?.data?.error ||
        err?.message ||
        'Registration failed.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ADMIN LOGIN SCREEN
  // =====================================================
  if (isAdminLogin) {
    return (
      <div className="login-page">
        <div className="login-container login-container-single">
          <div className="login-card">

            <h2>BishalCare Admin</h2>

            <p className="subtitle">
              Admin Login
            </p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleAdminLogin}>

              <div className="form-group">
                <label htmlFor="admin-email">
                  Email
                </label>

                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Admin email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-password">
                  Password
                </label>

                <input
                  id="admin-password"
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Admin password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary btn-full"
                disabled={loading}
              >
                {loading
                  ? 'Signing in...'
                  : 'Admin Sign In'}
              </button>

            </form>

            <button
              type="button"
              onClick={() => {
                setIsAdminLogin(false);
                setError('');
              }}
              className="back-button"
            >
              Back to Customer Login
            </button>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // CUSTOMER LOGIN / REGISTER
  // =====================================================
  return (
    <div className="login-page">

      <div className="container">

        <div className="login-container login-container-single">

          <div className="login-card">

            <h2>
              {isLogin
                ? 'Welcome Back'
                : 'Create Account'}
            </h2>

            <p className="subtitle">
              {isLogin
                ? 'Login to your Bishal Care account'
                : 'Create your Bishal Care account'}
            </p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* =================================================
                CUSTOMER LOGIN
            ================================================= */}
            {isLogin ? (

              <form onSubmit={handleUserLogin}>

                <div className="form-group">
                  <label htmlFor="login-email">
                    Email
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="login-password">
                    Password
                  </label>

                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary btn-full"
                  disabled={loading}
                >
                  {loading
                    ? 'Signing in...'
                    : 'Sign In'}
                </button>

              </form>

            ) : (

              /* =================================================
                 REGISTER
              ================================================= */

              <form onSubmit={handleRegister}>

                <div className="form-row">

                  <div className="form-group">
                    <label htmlFor="first-name">
                      First Name
                    </label>

                    <input
                      id="first-name"
                      type="text"
                      name="firstName"
                      className="form-control"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="last-name">
                      Last Name
                    </label>

                    <input
                      id="last-name"
                      type="text"
                      name="lastName"
                      className="form-control"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      required
                    />
                  </div>

                </div>

                <div className="form-group">
                  <label htmlFor="register-email">
                    Email
                  </label>

                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-password">
                    Password
                  </label>

                  <input
                    id="register-password"
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone-number">
                    Phone Number
                  </label>

                  <input
                    id="phone-number"
                    type="text"
                    name="phoneNumber"
                    className="form-control"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">
                    Address
                  </label>

                  <input
                    id="address"
                    type="text"
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Address"
                  />
                </div>

                <div className="form-row">

                  <div className="form-group">
                    <label htmlFor="city">
                      City
                    </label>

                    <input
                      id="city"
                      type="text"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="postal-code">
                      Postal Code
                    </label>

                    <input
                      id="postal-code"
                      type="text"
                      name="postalCode"
                      className="form-control"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="Postal code"
                    />
                  </div>

                </div>

                <button
                  type="submit"
                  className="btn-primary btn-full"
                  disabled={loading}
                >
                  {loading
                    ? 'Creating Account...'
                    : 'Create Account'}
                </button>

              </form>
            )}

            {/* =================================================
                SWITCH LOGIN / REGISTER
            ================================================= */}

            <div className="auth-switch">

              {isLogin ? (

                <p>
                  Don't have an account?{' '}

                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setIsLogin(false);
                      setError('');
                    }}
                  >
                    Create Account
                  </button>
                </p>

              ) : (

                <p>
                  Already have an account?{' '}

                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setIsLogin(true);
                      setError('');
                    }}
                  >
                    Sign In
                  </button>
                </p>

              )}

            </div>

            {/* =================================================
                ADMIN LOGIN
            ================================================= */}

            <div className="admin-login-link">

              <button
                type="button"
                className="link-button muted"
                onClick={() => {
                  setIsAdminLogin(true);
                  setError('');
                }}
              >
                Admin Login
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;