import { useEffect, useState } from 'react';
import client from '../api/client';
import { getAdminName } from '../api/auth';
import './Dashboard.css';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        // client.js already contains /api in baseURL
        const response = await client.get('/Admin/Summary');

        console.log('Admin dashboard response:', response.data);
        setSummary(response.data);
      } catch (err) {
        console.error('Dashboard error:', err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.Message ||
            'Could not load dashboard summary.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {getAdminName()}</h1>
        <p className="dashboard-subtitle">
          Here's what's happening with your store
        </p>
      </div>

      {loading && (
        <div className="stat-grid">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="stat-card skeleton" key={i}>
              <span className="stat-value skeleton-block"></span>
              <span className="stat-label skeleton-block small"></span>
            </div>
          ))}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {!loading && summary && (
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-value">
              {summary.totalOrders ?? 0}
            </span>
            <span className="stat-label">Total Orders</span>
          </div>

          <div className="stat-card">
            <span className="stat-value">
              RS {summary.totalRevenue ?? 0}
            </span>
            <span className="stat-label">Total Revenue</span>
          </div>

          <div className="stat-card">
            <span className="stat-value">
              {summary.totalUsers ?? 0}
            </span>
            <span className="stat-label">Total Users</span>
          </div>

          <div className="stat-card">
            <span className="stat-value">
              {summary.totalProducts ?? 0}
            </span>
            <span className="stat-label">Total Products</span>
          </div>

          <div className="stat-card highlight">
            <span className="stat-value">
              {summary.pendingOrders ?? 0}
            </span>
            <span className="stat-label">Pending Orders</span>
          </div>
        </div>
      )}

      <p className="dashboard-footnote">
        Use the sidebar to manage Products, Orders, and Users.
      </p>
    </div>
  );
}