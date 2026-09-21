import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import './Header.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop All' },
  { to: '/skin-quiz', label: 'Skin Quiz' },
  { to: '/membership', label: 'Membership' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [cartCount, setCartCount] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [wishlistCount, setWishlistCount] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const handleNavLinkClick = () => {
    setIsMenuOpen(false);
    scrollToTop();
  };

  const isActive = (path) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);

  // Lock page scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close the drawer with Escape, or when the window grows to desktop width
  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 768) setIsMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [isMenuOpen]);

  const handleAccountClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/my-account');
    } else {
      navigate('/login');
    }
    scrollToTop();
  };

  const handleWishlistClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/wishlist');
    } else {
      navigate('/login', { state: { from: '/wishlist', message: 'Please login to view your wishlist' } });
    }
    scrollToTop();
  };

  const handleCartClick = () => {
    navigate('/cart');
    scrollToTop();
  };

  return (
    <header className="header">
      <div className="header__topbar">
        <div className="container">
          <p>
            <span>Free shipping on orders over RS 2000</span>
            <span className="header__topbar-sep" aria-hidden="true">|</span>
            <span>Members get 15% off + free gift on every order!</span>
          </p>
        </div>
      </div>

      <div className="header__main">
        <div className="container">
          <div className="header__content">
            <button
              type="button"
              className="header__menu-toggle"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="primary-nav"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            <Link to="/" className="header__logo" onClick={scrollToTop}>
              <img src={require('../../assets/images/logo-icon.png')} alt="Bishal Care Logo" className="header__logo-icon" />
              <img src={require('../../assets/images/brand-text.png')} alt="Bishal Care" className="header__brand-text" />
            </Link>

            <nav id="primary-nav" className={`header__nav${isMenuOpen ? ' is-open' : ''}`} aria-label="Primary">
              <button type="button" className="header__nav-close" onClick={closeMenu} aria-label="Close menu">
                <FiX size={24} />
              </button>

              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`header__nav-link${isActive(to) ? ' is-active' : ''}`}
                  aria-current={isActive(to) ? 'page' : undefined}
                  onClick={handleNavLinkClick}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="header__icons">
              <button type="button" className="header__icon-btn" onClick={handleAccountClick} aria-label="My account">
                <FiUser size={22} />
              </button>

              <button
                type="button"
                className="header__icon-btn"
                onClick={handleWishlistClick}
                aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : 'Wishlist'}
              >
                <FiHeart size={22} />
                {wishlistCount > 0 && <span className="header__badge">{wishlistCount}</span>}
              </button>

              <button
                type="button"
                className="header__icon-btn"
                onClick={handleCartClick}
                aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : 'Cart'}
              >
                <FiShoppingCart size={22} />
                {cartCount > 0 && <span className="header__badge">{cartCount}</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`header__backdrop${isMenuOpen ? ' is-visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
    </header>
  );
};

export default Header;