import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError('');
  };

  // =========================
  // CUSTOMER LOGIN
  // =========================
  const handleUserLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      // Remove admin session if it exists
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_name');
      localStorage.removeItem('admin_email');

      const response = await usersAPI.login({
        email: formData.email,
        password: formData.password,
      });

      console.log('Customer login response:', response.data);

      const responseData = response.data;

      const token =
        responseData?.token ||
        responseData?.Token ||
        responseData?.data?.token ||
        responseData?.data?.Token ||
        responseData?.accessToken;

      if (!token) {
        throw new Error('Login successful but no token was returned.');
      }

      localStorage.setItem('token', token);

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
          userData?.Id,

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

      localStorage.setItem('user', JSON.stringify(user));

      alert('Login successful!');
      navigate('/my-account');
    } catch (err) {
      console.error('Customer login error:', err);

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

  // =========================
  // ADMIN LOGIN
  // =========================
  const handleAdminLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      // Remove customer session
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Login and verify Admin role
      await adminLogin(
        formData.email,
        formData.password
      );

      console.log(
        'Admin token:',
        localStorage.getItem('admin_token')
      );

      alert('Admin login successful!');

      // IMPORTANT:
      // Go to ADMIN dashboard, not customer homepage
      navigate('/admin');
    } catch (err) {
      console.error('Admin login error:', err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        err?.message ||
        'Admin login failed.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REGISTER
  // =========================
  const handleRegister = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await usersAPI.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
      });

      alert('Registration successful! Please login.');

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
      console.error('Registration error:', err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        err?.message ||
        'Registration failed.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ADMIN LOGIN SCREEN
  // =========================
  if (isAdminLogin) {
    return (
      <div className="login-page">
        <div className="login-container login-container-single">
          <div className="login-card">

            <h2>BishalCare Admin</h2>
            <p className="subtitle">Admin Login</p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleAdminLogin}>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Admin email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Admin password"
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

  // =========================
  // CUSTOMER LOGIN / REGISTER
  // =========================
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

            {isLogin ? (
              <form onSubmit={handleUserLogin}>

                <div className="form-group">
                  <label>Email</label>

                  <input
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
                  <label>Password</label>

                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
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
              <form onSubmit={handleRegister}>

                <div className="form-row">

                  <div className="form-group">
                    <label>First Name</label>

                    <input
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
                    <label>Last Name</label>

                    <input
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
                  <label>Email</label>

                  <input
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
                  <label>Password</label>

                  <input
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
                  <label>Phone Number</label>

                  <input
                    type="text"
                    name="phoneNumber"
                    className="form-control"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>

                  <input
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
                    <label>City</label>

                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>

                  <div className="form-group">
                    <label>Postal Code</label>

                    <input
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