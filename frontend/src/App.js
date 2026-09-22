import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// ==========================================
// CUSTOMER COMPONENTS
// ==========================================
import ScrollToTop from './components/ScrollToTop';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Membership from './pages/Membership';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import SkinQuiz from './pages/SkinQuiz';
import MyAccount from './pages/MyAccount';
import Wishlist from './pages/Wishlist';
import QuizResults from './pages/QuizResults';



// ==========================================
// ADMIN COMPONENTS
// ==========================================
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Users from './pages/Users';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// ==========================================
// CSS
// ==========================================
import './App.css';

// ==========================================
// CUSTOMER WEBSITE LAYOUT
// ==========================================
function CustomerLayout({ children }) {
  return (
    <>
      <ScrollToTop />

      <Header />

      <main className="main-content">
        {children}
      </main>

      <Footer />

    </>
  );
}

// ==========================================
// ADMIN LAYOUT
// ==========================================
function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  );
}

// ==========================================
// APP
// ==========================================
function App() {
  return (
    <Router>
      <Routes>

        {/* ==========================================
            CUSTOMER WEBSITE
        ========================================== */}

        <Route
          path="/"
          element={
            <CustomerLayout>
              <Home />
            </CustomerLayout>
          }
        />

        <Route
          path="/shop"
          element={
            <CustomerLayout>
              <Shop />
            </CustomerLayout>
          }
        />

        <Route
          path="/product/:id"
          element={
            <CustomerLayout>
              <ProductDetail />
            </CustomerLayout>
          }
        />

        <Route
          path="/cart"
          element={
            <CustomerLayout>
              <Cart />
            </CustomerLayout>
          }
        />

        <Route
          path="/checkout"
          element={
            <CustomerLayout>
              <Checkout />
            </CustomerLayout>
          }
        />

        <Route
          path="/membership"
          element={
            <CustomerLayout>
              <Membership />
            </CustomerLayout>
          }
        />

        <Route
          path="/login"
          element={
            <CustomerLayout>
              <Login />
            </CustomerLayout>
          }
        />

        <Route
          path="/register"
          element={
            <CustomerLayout>
              <Login />
            </CustomerLayout>
          }
        />

        <Route
          path="/about"
          element={
            <CustomerLayout>
              <About />
            </CustomerLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <CustomerLayout>
              <Contact />
            </CustomerLayout>
          }
        />

        <Route
          path="/skin-quiz"
          element={
            <CustomerLayout>
              <SkinQuiz />
            </CustomerLayout>
          }
        />

        <Route
          path="/my-account"
          element={
            <CustomerLayout>
              <MyAccount />
            </CustomerLayout>
          }
        />

        <Route
          path="/wishlist"
          element={
            <CustomerLayout>
              <Wishlist />
            </CustomerLayout>
          }
        />

        <Route
          path="/quiz-results"
          element={
            <CustomerLayout>
              <QuizResults />
            </CustomerLayout>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <CustomerLayout>
              <MyAccount />
            </CustomerLayout>
          }
        />

        {/* ==========================================
            ADMIN PANEL
        ========================================== */}

        <Route
          path="/admin"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminLayout>
              <Products />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminLayout>
              <Orders />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <Users />
            </AdminLayout>
          }
        />

        {/* ==========================================
            FALLBACK
        ========================================== */}

        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />

      </Routes>
    </Router>
  );
}

export default App;