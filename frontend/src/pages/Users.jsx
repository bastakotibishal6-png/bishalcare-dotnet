import React, { useEffect, useState } from 'react';
import client from '../api/client';
import './Users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/api/Admin/Users');
      setUsers(res.data);
    } catch (err) {
      setError('Could not load users. Make sure you are logged in with an Admin account.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="admin-users-page">
      <div className="au-header">
        <div className="au-header-text">
          <h1 className="au-title">Customer Directory</h1>
          <p className="au-subtitle">Manage and view registered Bisahl Care customers.</p>
        </div>
        <button 
          className="au-refresh-btn" 
          onClick={loadUsers} 
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="au-error-banner">
          <span className="au-error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {loading && users.length === 0 ? (
        <div className="au-loading-state">
          <div className="au-spinner"></div>
          <p>Loading customer data...</p>
        </div>
      ) : (
        <div className="au-table-container">
          <div className="au-table-wrapper">
            <table className="au-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Contact Info</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="au-name">{u.firstName} {u.lastName}</span>
                    </td>
                    <td>
                      <div className="au-contact-info">
                        <span className="au-email">{u.email}</span>
                        {u.phoneNumber && <span className="au-phone">{u.phoneNumber}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="au-text-muted">{u.city || '-'}</span>
                    </td>
                    <td>
                      <span className={`au-badge ${u.isMember ? 'au-badge-member' : 'au-badge-standard'}`}>
                        {u.isMember ? 'Member' : 'Standard'}
                      </span>
                    </td>
                    <td>
                      <span className="au-text-muted">
                        {u.createdDate ? new Date(u.createdDate).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td>
                      <span className="au-text-muted">
                        {u.lastLoginDate ? new Date(u.lastLoginDate).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="au-empty-state">
                      No customers found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}