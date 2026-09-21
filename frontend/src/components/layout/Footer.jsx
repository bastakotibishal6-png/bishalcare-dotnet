import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import './Footer.css';

// Paste your Instagram profile URL here. The icon is hidden until this is set.
const INSTAGRAM_URL = '';
const CONTACT_EMAIL = 'bishacare@gmail.com';

const QUICK_LINKS = [
  { to: '/shop', label: 'Shop All' },
  { to: '/skin-quiz', label: 'Skin Quiz' },
  { to: '/membership', label: 'Membership' },
  { to: '/about', label: 'About Us' },
];

const CARE_LINKS = [
  { to: '/contact', label: 'Contact Us' },
  { to: '/my-account', label: 'My Account' },
  { to: '/orders', label: 'Order Tracking' },
  { to: '/wishlist', label: 'Wishlist' },
];

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const Footer = () => {
  const renderLinks = (links) => (
    <ul className="footer__list">
      {links.map(({ to, label }) => (
        <li key={to}>
          <Link to={to} className="footer__link" onClick={scrollToTop}>{label}</Link>
        </li>
      ))}
    </ul>
  );

  const instagramLink = INSTAGRAM_URL ? (
    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Bishal Care on Instagram"><FaInstagram size={20} /></a>
  ) : null;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand-col">
            <h2 className="footer__brand">Bishal Care</h2>
            <p className="footer__blurb">
              Premium skincare and makeup curated for the modern beauty enthusiast.
              Vegan, cruelty-free, and luxuriously effective.
            </p>

            <div className="footer__social">
              {instagramLink}
              <a href={`mailto:${CONTACT_EMAIL}`} aria-label="Email Bishal Care"><FiMail size={20} /></a>
            </div>
          </div>

          <nav className="footer__col" aria-label="Quick links">
            <h3 className="footer__heading">Quick Links</h3>
            {renderLinks(QUICK_LINKS)}
          </nav>

          <nav className="footer__col" aria-label="Customer care">
            <h3 className="footer__heading">Customer Care</h3>
            {renderLinks(CARE_LINKS)}
          </nav>

          <div className="footer__col footer__contact">
            <h3 className="footer__heading">Connect</h3>

            <div className="footer__contact-item">
              <span className="footer__label">Email</span>
              <a href={`mailto:${CONTACT_EMAIL}`} className="footer__link footer__email">{CONTACT_EMAIL}</a>
            </div>

            <div className="footer__contact-item">
              <span className="footer__label">Location</span>
              <span className="footer__value">Pokhara, Nepal</span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} Bishal Care. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;