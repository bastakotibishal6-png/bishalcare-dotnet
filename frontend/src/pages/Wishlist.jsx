import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiHeart } from 'react-icons/fi';
import { wishlistAPI, cartAPI } from '../services/api';
import './Wishlist.css';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await wishlistAPI.removeFromWishlist(itemId);
      fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove item');
    }
  };

  const handleMoveToCart = async (itemId) => {
    try {
      await wishlistAPI.moveToCart(itemId);
      fetchWishlist();
    } catch (error) {
      console.error('Error moving to cart:', error);
      alert('Failed to move to cart');
    }
  };

  if (loading) {
    return (
      <div className="wl-loading-container">
        <div className="wl-spinner"></div>
      </div>
    );
  }

  return (
    <div className="wl-page">
      <div className="wl-container">
        
        <div className="wl-header" data-aos="fade-up">
          <h1 className="wl-title">My Wishlist</h1>
          {wishlist && wishlist.items.length > 0 && (
            <p className="wl-subtitle">
              {wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'} saved
            </p>
          )}
        </div>

        {!wishlist || wishlist.items.length === 0 ? (
          <div className="wl-empty-state" data-aos="fade-up">
            <div className="wl-empty-icon">
              <FiHeart size={48} strokeWidth={1} />
            </div>
            <h2>Your wishlist is currently empty</h2>
            <p>Curate your routine by saving your favorite products here.</p>
            <Link to="/shop" className="wl-btn-primary wl-btn-shop">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="wl-grid">
            {wishlist.items.map(item => (
              <div key={item.wishlistItemId} className="wl-card" data-aos="fade-up">
                
                {/* Image & Top Actions */}
                <div className="wl-image-wrapper">
                  <Link to={`/product/${item.productId}`}>
                    <img src={item.imageUrl1} alt={item.name} className="wl-image" />
                  </Link>
                  
                  <button
                    className="wl-remove-btn"
                    onClick={() => handleRemove(item.wishlistItemId)}
                    aria-label="Remove from wishlist"
                  >
                    <FiX size={18} />
                  </button>

                  {!item.inStock && (
                    <div className="wl-out-of-stock-overlay">
                      <span>Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="wl-info">
                  <div className="wl-info-top">
                    <p className="wl-brand">{item.brand}</p>
                    <Link to={`/product/${item.productId}`} className="wl-name-link">
                      <h3 className="wl-name">{item.name}</h3>
                    </Link>
                    <p className="wl-category">{item.subCategory}</p>
                  </div>
                  <p className="wl-price">RS {item.price.toFixed(2)}</p>
                </div>

                {/* Bottom Action */}
                <button
                  className="wl-btn-cart"
                  onClick={() => handleMoveToCart(item.wishlistItemId)}
                  disabled={!item.inStock}
                >
                  {item.inStock ? 'Move to Cart' : 'Currently Unavailable'}
                </button>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;