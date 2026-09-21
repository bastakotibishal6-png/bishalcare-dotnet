import { useEffect, useState } from 'react';
import client from '../api/client';
import './Products.css';

const emptyForm = {
  name: '',
  brand: '',
  category: '',
  subCategory: '',
  price: '',
  size: '',
  description: '',
  keyIngredients: '',
  skinType: '',
  isVegan: false,
  isCrueltyFree: false,
  countryOfOrigin: '',
  stockQuantity: '',
  isMiniGift: false,
  imageUrl1: '',
  imageUrl2: '',
  imageUrl3: '',
  availableShades: ''
};

// Convert frontend form fields to backend Product model fields
function toPascalPayload(f) {
  return {
    Name: f.name,
    Brand: f.brand || null,
    Category: f.category,
    SubCategory: f.subCategory || null,
    Price: parseFloat(f.price) || 0,
    Size: f.size || null,
    Description: f.description || null,
    KeyIngredients: f.keyIngredients || null,
    SkinType: f.skinType || null,
    IsVegan: f.isVegan,
    IsCrueltyFree: f.isCrueltyFree,
    CountryOfOrigin: f.countryOfOrigin || null,
    StockQuantity: parseInt(f.stockQuantity, 10) || 0,
    IsMiniGift: f.isMiniGift,
    ImageUrl1: f.imageUrl1 || null,
    ImageUrl2: f.imageUrl2 || null,
    ImageUrl3: f.imageUrl3 || null,
    AvailableShades: f.availableShades || null
  };
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadProducts() {
    setLoading(true);
    setError('');

    try {
      // client.js already contains /api in baseURL
      // Final URL:
      // https://bishalvoid-001-site1.ktempurl.com/api/Products/Admin/All
      const res = await client.get('/Products/Admin/All');

      console.log('Admin products response:', res.data);

      // Make sure products is always an array
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        console.error('Unexpected products response:', res.data);
        setProducts([]);
        setError('Invalid products response from server.');
      }
    } catch (err) {
      console.error('Load products error:', err);

      setProducts([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.Message ||
          err?.response?.data?.error ||
          err?.response?.data?.Error ||
          'Could not load products. Make sure you are logged in with an Admin account.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function startCreate() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(true);
    setError('');
  }

  function startEdit(product) {
    setForm({
      name: product.name ?? '',
      brand: product.brand ?? '',
      category: product.category ?? '',
      subCategory: product.subCategory ?? '',
      price: product.price ?? '',
      size: product.size ?? '',
      description: product.description ?? '',
      keyIngredients: product.keyIngredients ?? '',
      skinType: product.skinType ?? '',
      isVegan: product.isVegan ?? false,
      isCrueltyFree: product.isCrueltyFree ?? false,
      countryOfOrigin: product.countryOfOrigin ?? '',
      stockQuantity: product.stockQuantity ?? '',
      isMiniGift: product.isMiniGift ?? false,
      imageUrl1: product.imageUrl1 ?? '',
      imageUrl2: product.imageUrl2 ?? '',
      imageUrl3: product.imageUrl3 ?? '',
      availableShades: product.availableShades ?? ''
    });

    setEditingId(product.productId);
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const payload = toPascalPayload(form);

    try {
      if (editingId) {
        await client.put(`/Products/${editingId}`, {
          ...payload,
          ProductId: editingId
        });
      } else {
        await client.post('/Products', payload);
      }

      setShowForm(false);
      setForm({ ...emptyForm });
      setEditingId(null);

      await loadProducts();
    } catch (err) {
      console.error('Save product error:', err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.Error ||
          err?.response?.data?.message ||
          err?.response?.data?.Message ||
          'Save failed.'
      );
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this product?');

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await client.delete(`/Products/${id}`);

      await loadProducts();
    } catch (err) {
      console.error('Delete product error:', err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.Error ||
          err?.response?.data?.message ||
          err?.response?.data?.Message ||
          'Delete failed.'
      );
    }
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError('');
  }

  return (
    <div className="admin-products">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Products</h1>

          <p className="products-subtitle">
            Manage your product catalog
          </p>
        </div>

        <button
          type="button"
          className="btn-add"
          onClick={startCreate}
        >
          + Add Product
        </button>
      </div>

      {/* ERROR */}
      {error && <p className="error-text">{error}</p>}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <form
          className="inline-form"
          onSubmit={handleSubmit}
        >
          <h3>
            {editingId ? 'Edit Product' : 'New Product'}
          </h3>

          {/* BASIC INFO */}
          <div className="form-section-label">
            Basic Info
          </div>

          <div className="form-grid">
            <input
              placeholder="Name *"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
              required
            />

            <input
              placeholder="Brand"
              value={form.brand}
              onChange={(e) =>
                setForm({
                  ...form,
                  brand: e.target.value
                })
              }
            />

            <input
              placeholder="Category *"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value
                })
              }
              required
            />

            <input
              placeholder="Sub Category"
              value={form.subCategory}
              onChange={(e) =>
                setForm({
                  ...form,
                  subCategory: e.target.value
                })
              }
            />
          </div>

          {/* PRICING & STOCK */}
          <div className="form-section-label">
            Pricing &amp; Stock
          </div>

          <div className="form-grid">
            <input
              placeholder="Price *"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: e.target.value
                })
              }
              required
            />

            <input
              placeholder="Size (e.g. 50ml)"
              value={form.size}
              onChange={(e) =>
                setForm({
                  ...form,
                  size: e.target.value
                })
              }
            />

            <input
              placeholder="Stock Quantity *"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  stockQuantity: e.target.value
                })
              }
              required
            />

            <input
              placeholder="Country of Origin"
              value={form.countryOfOrigin}
              onChange={(e) =>
                setForm({
                  ...form,
                  countryOfOrigin: e.target.value
                })
              }
            />
          </div>

          {/* DETAILS */}
          <div className="form-section-label">
            Details
          </div>

          <div className="form-grid">
            <input
              placeholder="Skin Type (e.g. All, Oily, Dry)"
              value={form.skinType}
              onChange={(e) =>
                setForm({
                  ...form,
                  skinType: e.target.value
                })
              }
            />

            <input
              placeholder="Available Shades (comma separated)"
              value={form.availableShades}
              onChange={(e) =>
                setForm({
                  ...form,
                  availableShades: e.target.value
                })
              }
            />
          </div>

          {/* IMAGES */}
          <div className="form-section-label">
            Images
          </div>

          <div className="form-grid">
            <input
              type="url"
              placeholder="Image URL 1"
              value={form.imageUrl1}
              onChange={(e) =>
                setForm({
                  ...form,
                  imageUrl1: e.target.value
                })
              }
            />

            <input
              type="url"
              placeholder="Image URL 2"
              value={form.imageUrl2}
              onChange={(e) =>
                setForm({
                  ...form,
                  imageUrl2: e.target.value
                })
              }
            />

            <input
              type="url"
              placeholder="Image URL 3"
              value={form.imageUrl3}
              onChange={(e) =>
                setForm({
                  ...form,
                  imageUrl3: e.target.value
                })
              }
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-section-label">
            Description
          </div>

          <div className="form-grid form-grid-single">
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value
                })
              }
            />

            <textarea
              placeholder="Key Ingredients"
              value={form.keyIngredients}
              onChange={(e) =>
                setForm({
                  ...form,
                  keyIngredients: e.target.value
                })
              }
            />
          </div>

          {/* CHECKBOXES */}
          <div className="checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isVegan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isVegan: e.target.checked
                  })
                }
              />

              Vegan
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isCrueltyFree}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isCrueltyFree: e.target.checked
                  })
                }
              />

              Cruelty-Free
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isMiniGift}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isMiniGift: e.target.checked
                  })
                }
              />

              Is Mini Gift
            </label>
          </div>

          <p className="form-help-text">
            Mini Gift products can be used for free-gift
            promotions and hidden from the normal shop.
          </p>

          {/* FORM BUTTONS */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary-admin"
            >
              {editingId ? 'Save Changes' : 'Create'}
            </button>

            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* PRODUCTS TABLE */}
      {loading ? (
        <div className="table-skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              className="skeleton-row"
              key={i}
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-products">
          <p>
            No products yet. Add your first product to get
            started.
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Mini Gift?</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.productId}>
                  <td className="product-name-cell">
                    {p.name || '-'}
                  </td>

                  <td>
                    {p.brand || '-'}
                  </td>

                  <td>
                    {p.category || '-'}

                    {p.subCategory
                      ? ` / ${p.subCategory}`
                      : ''}
                  </td>

                  <td className="price-cell">
                    RS {p.price ?? 0}
                  </td>

                  <td>
                    {p.stockQuantity ?? 0}
                  </td>

                  <td>
                    <span
                      className={`gift-pill ${
                        p.isMiniGift ? 'yes' : 'no'
                      }`}
                    >
                      {p.isMiniGift ? 'Yes' : 'No'}
                    </span>
                  </td>

                  <td className="actions-cell">
                    <button
                      type="button"
                      className="btn-edit-row"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="btn-delete-row"
                      onClick={() =>
                        handleDelete(p.productId)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}