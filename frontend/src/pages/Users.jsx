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
      const res = await client.get('/Admin/Users');

      console.log('Admin users response:', res.data);
      console.log('Is array:', Array.isArray(res.data));

      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        console.error(
          'Admin Users API did not return an array:',
          res.data
        );

        setUsers([]);
        setError(
          'Invalid users response from server.'
        );
      }
    } catch (err) {
      console.error('Load users error:', err);

      setUsers([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.Message ||
          err?.response?.data?.error ||
          err?.response?.data?.Error ||
          'Could not load users. Make sure you are logged in with an Admin account.'
      );
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
          <h1 className="au-title">
            Customer Directory
          </h1>

          <p className="au-subtitle">
            Manage and view registered Bishal Care customers.
          </p>
        </div>

        <button
          type="button"
          className="au-refresh-btn"
          onClick={loadUsers}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="au-error-banner">
          <span className="au-error-icon">
            ⚠️
          </span>

          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="au-loading-state">
          <div className="au-spinner"></div>

          <p>
            Loading customer data...
          </p>
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
                {Array.isArray(users) &&
                  users.map((u) => (
                    <tr key={u.id}>

                      <td>
                        <span className="au-name">
                          {u.firstName || ''}{' '}
                          {u.lastName || ''}
                        </span>
                      </td>

                      <td>
                        <div className="au-contact-info">

                          <span className="au-email">
                            {u.email || '-'}
                          </span>

                          {u.phoneNumber && (
                            <span className="au-phone">
                              {u.phoneNumber}
                            </span>
                          )}

                        </div>
                      </td>

                      <td>
                        <span className="au-text-muted">
                          {u.city || '-'}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`au-badge ${
                            u.isMember
                              ? 'au-badge-member'
                              : 'au-badge-standard'
                          }`}
                        >
                          {u.isMember
                            ? 'Member'
                            : 'Standard'}
                        </span>
                      </td>

                      <td>
                        <span className="au-text-muted">
                          {u.createdDate
                            ? new Date(
                                u.createdDate
                              ).toLocaleDateString()
                            : '-'}
                        </span>
                      </td>

                      <td>
                        <span className="au-text-muted">
                          {u.lastLoginDate
                            ? new Date(
                                u.lastLoginDate
                              ).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </td>

                    </tr>
                  ))}

                {!loading &&
                  Array.isArray(users) &&
                  users.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="au-empty-state"
                      >
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