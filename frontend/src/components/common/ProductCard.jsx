import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI, wishlistAPI } from '../../services/api';
import './ProductCard.css';
import ProductImage from './ProductImage';

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.4 4.8 6.6 4.8c1.9 0 3.5 1 5.4 3.2 1.9-2.2 3.5-3.2 5.4-3.2 3.2 0 5.1 3.2 3.9 6.5-1.8 4.6-9.3 9.2-9.3 9.2z" />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 8h14l-1 12H6L5 8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const formatPrice = (value) =>
  Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const navigate = useNavigate();
  const [cartStatus, setCartStatus] = useState('idle'); // 'idle' | 'loading' | 'added'
  const [isWishlisted, setIsWishlisted] = useState(false);
  const resetTimer = useRef(null);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return Array.from({ length: 5 }, (_, i) => {
      let state = 'empty';
      if (i < fullStars) state = 'full';
      else if (i === fullStars && hasHalfStar) state = 'half';

      return (
        <span
          key={i}
          className={`product-card__star product-card__star--${state}`}
          aria-hidden="true"
        >
          ★
        </span>
      );
    });
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (cartStatus === 'loading') return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to cart');
        navigate('/login');
        return;
      }

      setCartStatus('loading');

      await cartAPI.addToCart({
        productId: product.productId,
        quantity: 1
      });

      setCartStatus('added');
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCartStatus('idle'), 2200);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartStatus('idle');
      if (error.response?.status === 401) {
        alert('Please login to add items to cart');
        navigate('/login');
      } else {
        alert('Failed to add to cart. Please try again.');
      }
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to wishlist');
        navigate('/login');
        return;
      }

      await wishlistAPI.addToWishlist({ productId: product.productId });
      setIsWishlisted(true);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      if (error.response?.status === 401) {
        alert('Please login to add items to wishlist');
        navigate('/login');
      } else if (error.response?.status === 400) {
        setIsWishlisted(true);
        alert('Item already in wishlist');
      } else {
        alert('Failed to add to wishlist. Please try again.');
      }
    }
  };

  const hasStockInfo = product.stockQuantity !== undefined;
  const isOutOfStock = hasStockInfo && product.stockQuantity === 0;
  const isLowStock = hasStockInfo && product.stockQuantity > 0 && product.stockQuantity < 10;
  const isInStock = hasStockInfo && product.stockQuantity >= 10;

  const cartLabel = isOutOfStock
    ? 'Unavailable'
    : cartStatus === 'loading'
    ? 'Adding…'
    : cartStatus === 'added'
    ? 'Added'
    : 'Add to Cart';

  return (
    <article className={`product-card${isOutOfStock ? ' product-card--out' : ''}`}>
      <div className="product-card__media">
        <ProductImage
          src={product.imageUrl1}
          alt={product.name}
          className="product-card__image"
        />

        {isOutOfStock && <span className="product-card__flag">Out of stock</span>}

        <button
          type="button"
          className={`product-card__wish${isWishlisted ? ' is-active' : ''}`}
          onClick={handleAddToWishlist}
          aria-label={isWishlisted ? 'Added to wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
          title="Add to Wishlist"
        >
          <HeartIcon />
        </button>
      </div>

      <div className="product-card__body">
        {product.brand && <span className="product-card__brand">{product.brand}</span>}

        <h3 className="product-card__name">
          <Link to={`/product/${product.productId}`} className="product-card__link">
            {product.name}
          </Link>
        </h3>

        {(product.isVegan || product.isCrueltyFree) && (
          <div className="product-card__tags">
            {product.isVegan && <span className="product-card__tag">Vegan</span>}
            {product.isCrueltyFree && <span className="product-card__tag">Cruelty-Free</span>}
          </div>
        )}

        {product.rating > 0 && (
          <div
            className="product-card__rating"
            role="img"
            aria-label={`Rated ${product.rating} out of 5`}
          >
            <span className="product-card__stars">{renderStars(product.rating)}</span>
            <span className="product-card__reviews">({product.reviewCount})</span>
          </div>
        )}

        <div className="product-card__footer">
          <div className="product-card__price">Rs. {formatPrice(product.price)}</div>

          {(isLowStock || isInStock) && (
            <div
              className={`product-card__stock ${
                isLowStock ? 'product-card__stock--low' : 'product-card__stock--in'
              }`}
            >
              {isLowStock ? `Only ${product.stockQuantity} left` : 'In stock'}
            </div>
          )}

          <button
            type="button"
            className={`product-card__cart${cartStatus === 'added' ? ' is-added' : ''}${
              cartStatus === 'loading' ? ' is-loading' : ''
            }`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-live="polite"
          >
            {cartStatus === 'added' ? <CheckIcon /> : <BagIcon />}
            <span>{cartLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;