
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import { productsAPI, cartAPI, wishlistAPI } from '../services/api';
import './Shop.css';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loadCount, setLoadCount] = useState(20);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceRange: '',
    skinType: '',
    vegan: false,
    crueltyFree: false
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    setDisplayedProducts(products.slice(0, loadCount));
  }, [products, loadCount]);

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const params = {};

      if (filters.category) {
        params.category = filters.category;
      }

      if (filters.skinType) {
        params.skinType = filters.skinType;
      }

      if (filters.vegan) {
        params.vegan = true;
      }

      if (filters.crueltyFree) {
        params.crueltyFree = true;
      }

      const response = await productsAPI.getAll(params);

      let filteredProducts = response.data;

      if (filters.priceRange) {
        filteredProducts = filteredProducts.filter((product) => {
          switch (filters.priceRange) {
            case 'under-100':
              return product.price < 100;

            case '100-150':
              return product.price >= 100 && product.price <= 150;

            case '150-200':
              return product.price >= 150 && product.price <= 200;

            case 'above-200':
              return product.price > 200;

            default:
              return true;
          }
        });
      }

      setProducts(filteredProducts);
      setLoadCount(20);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setLoadCount((prev) => prev + 20);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value
    }));

    if (filterType === 'category') {
      if (value) {
        setSearchParams({ category: value });
      } else {
        setSearchParams({});
      }
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please login to add items to cart');
        navigate('/login');
        return;
      }

      const cartData = {
        productId: product.productId,
        quantity: 1,
        selectedShade: product.availableShades?.[0] || 'N/A'
      };

      console.log('Adding to cart:', cartData);

      const response = await cartAPI.addToCart(cartData);

      console.log('✅ Cart response:', response.data);

      alert(`✅ ${product.name} added to cart!`);
    } catch (error) {
      console.error('Cart error:', error);

      if (error.response?.status === 401) {
        alert('Session expired. Please login again');

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        navigate('/login');
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors)
          .flat()
          .join('\n');

        alert(`Validation Error:\n${errorMessages}`);
      } else {
        alert('Failed to add to cart. Please try again.');
      }
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please login to add items to wishlist');
        navigate('/login');
        return;
      }

      await wishlistAPI.addToWishlist({ productId });

      alert('✅ Added to wishlist!');
    } catch (error) {
      console.error('Wishlist error:', error);

      if (error.response?.status === 401) {
        alert('Session expired. Please login again');

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        navigate('/login');
      } else if (error.response?.status === 400) {
        alert('Item already in wishlist');
      } else {
        alert('Failed to add to wishlist');
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      skinType: '',
      vegan: false,
      crueltyFree: false
    });

    setSearchParams({});
  };

  const activeFilterCount = [
    filters.category,
    filters.priceRange,
    filters.skinType,
    filters.vegan,
    filters.crueltyFree
  ].filter(Boolean).length;

  const currentCategory = filters.category || 'All Products';

  return (
    <main className="shop-page">
      <div className="shop-container">

        {/* =====================================================
            SHOP HERO
        ====================================================== */}
        <section className="shop-hero">
          <div className="shop-hero-kicker">
            <span className="shop-hero-line" />
            Bisahl Care Beauty Collection
            <span className="shop-hero-line" />
          </div>

          <h1>
            Find Your
            <em> Ritual.</em>
          </h1>

          <p>
            Discover thoughtfully selected beauty and skincare
            essentials for your everyday routine.
          </p>

          <div className="shop-hero-meta">
            <span>
              {loading ? 'Curating collection' : `${products.length} products`}
            </span>

            <span className="shop-meta-divider" />

            <span>
              {currentCategory}
            </span>
          </div>
        </section>

        {/* =====================================================
            SHOP CONTENT
        ====================================================== */}
        <div className="shop-content">

          {/* ===================================================
              FILTER SIDEBAR
          ==================================================== */}
          <aside className="filters-sidebar">

            <div className="filters-header">
              <div>
                <span className="filters-kicker">
                  Refine
                </span>

                <h2>Filters</h2>
              </div>

              {activeFilterCount > 0 && (
                <span className="active-filter-count">
                  {activeFilterCount}
                </span>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="clear-filters-btn"
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            )}

            {/* CATEGORY */}
            <div className="filter-group">
              <h3>Category</h3>

              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === ''}
                    onChange={() =>
                      handleFilterChange('category', '')
                    }
                  />

                  <span>All Products</span>
                </label>

                <label className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === 'Skincare'}
                    onChange={() =>
                      handleFilterChange('category', 'Skincare')
                    }
                  />

                  <span>Skincare</span>
                </label>

                <label className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === 'Makeup'}
                    onChange={() =>
                      handleFilterChange('category', 'Makeup')
                    }
                  />

                  <span>Makeup</span>
                </label>
              </div>
            </div>

            {/* PRICE */}
            <div className="filter-group">
              <h3>Price Range</h3>

              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.priceRange === ''}
                    onChange={() =>
                      handleFilterChange('priceRange', '')
                    }
                  />

                  <span>All Prices</span>
                </label>

                <label className="filter-option">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.priceRange === 'under-100'}
                    onChange={() =>
                      handleFilterChange(
                        'priceRange',
                        'under-100'
                      )
                    }
                  />

                  <span>Under Rs 100</span>
                </label>

                <label className="filter-option">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.priceRange === '100-150'}
                    onChange={() =>
                      handleFilterChange(
                        'priceRange',
                        '100-150'
                      )
                    }
                  />

                  <span>Rs 100 — 150</span>
                </label>

                <label className="filter-option">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.priceRange === '150-200'}
                    onChange={() =>
                      handleFilterChange(
                        'priceRange',
                        '150-200'
                      )
                    }
                  />

                  <span>Rs 150 — 200</span>
                </label>

                <label className="filter-option">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.priceRange === 'above-200'}
                    onChange={() =>
                      handleFilterChange(
                        'priceRange',
                        'above-200'
                      )
                    }
                  />

                  <span>Above Rs 200</span>
                </label>
              </div>
            </div>

            {/* SKIN TYPE */}
            <div className="filter-group">
              <h3>Skin Type</h3>

              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="skinType"
                    checked={filters.skinType === ''}
                    onChange={() =>
                      handleFilterChange('skinType', '')
                    }
                  />

                  <span>All Skin Types</span>
                </label>

                <label className="filter-option">
                  <input
                    type="radio"
                    name="skinType"
                    checked={filters.skinType === 'Oily'}
                    onChange={() =>
                      handleFilterChange('skinType', 'Oily')
                    }
                  />

                  <span>Oily</span>
                </label>

                <label className="filter-option">
                  <input
                    type="radio"
                    name="skinType"
                    checked={filters.skinType === 'Dry'}
                    onChange={() =>
                      handleFilterChange('skinType', 'Dry')
                    }
                  />

                  <span>Dry</span>
                </label>

                <label className="filter-option">
                  <input
                    type="radio"
                    name="skinType"
                    checked={filters.skinType === 'Combination'}
                    onChange={() =>
                      handleFilterChange(
                        'skinType',
                        'Combination'
                      )
                    }
                  />

                  <span>Combination</span>
                </label>

                <label className="filter-option">
                  <input
                    type="radio"
                    name="skinType"
                    checked={filters.skinType === 'Sensitive'}
                    onChange={() =>
                      handleFilterChange(
                        'skinType',
                        'Sensitive'
                      )
                    }
                  />

                  <span>Sensitive</span>
                </label>
              </div>
            </div>

            {/* PREFERENCES */}
            <div className="filter-group">
              <h3>Preferences</h3>

              <div className="filter-options">
                <label className="filter-option checkbox-option">
                  <input
                    type="checkbox"
                    checked={filters.vegan}
                    onChange={(e) =>
                      handleFilterChange(
                        'vegan',
                        e.target.checked
                      )
                    }
                  />

                  <span>Vegan</span>
                </label>

                <label className="filter-option checkbox-option">
                  <input
                    type="checkbox"
                    checked={filters.crueltyFree}
                    onChange={(e) =>
                      handleFilterChange(
                        'crueltyFree',
                        e.target.checked
                      )
                    }
                  />

                  <span>Cruelty-Free</span>
                </label>
              </div>
            </div>
          </aside>

          {/* ===================================================
              PRODUCTS
          ==================================================== */}
          <section className="products-section">

            <div className="products-header">
              <div className="products-heading">
                <span className="products-kicker">
                  Collection
                </span>

                <h2>
                  {currentCategory}
                </h2>
              </div>

              <div className="products-count">
                <strong>{products.length}</strong>
                <span>
                  {products.length === 1
                    ? 'product'
                    : 'products'}
                </span>
              </div>
            </div>

            {loading ? (
              <div
                className="loading-container"
                role="status"
                aria-live="polite"
              >
                <div className="shop-spinner" />

                <span className="loading-kicker">
                  Please wait
                </span>

                <p>
                  Curating the collection for you...
                </p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="products-grid">
                  {displayedProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="shop-product-item"
                      data-aos="fade-up"
                      data-aos-delay={
                        40 * (index % 8)
                      }
                    >
                      <ProductCard
                        product={product}
                        index={index}
                        onAddToCart={() =>
                          handleAddToCart(product)
                        }
                        onAddToWishlist={() =>
                          handleAddToWishlist(
                            product.productId
                          )
                        }
                      />
                    </div>
                  ))}
                </div>

                {/* LOAD MORE */}
                {loadCount < products.length && (
                  <div className="load-more-container">
                    <div className="load-more-progress">
                      <span>
                        Showing {displayedProducts.length} of{' '}
                        {products.length}
                      </span>

                      <div className="load-progress-track">
                        <div
                          className="load-progress-bar"
                          style={{
                            width: `${Math.min(
                              (displayedProducts.length /
                                products.length) *
                                100,
                              100
                            )}%`
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={loadMore}
                      className="load-more-btn"
                    >
                      <span>
                        Load More
                      </span>

                      <span className="load-more-arrow">
                        ↓
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-products">
                <div className="no-products-mark">
                  —
                </div>

                <span className="no-products-kicker">
                  Nothing here yet
                </span>

                <h3>
                  No products found
                </h3>

                <p>
                  We couldn't find products matching your
                  current filters. Try adjusting your
                  selection.
                </p>

                <button
                  type="button"
                  className="empty-state-btn"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Shop;
