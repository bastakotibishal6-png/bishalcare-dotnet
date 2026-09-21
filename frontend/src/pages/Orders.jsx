import { useEffect, useState } from 'react';
import client from '../api/client';
import './Orders.css';

// Matches the Status values used across OrdersController.cs / AdminController.cs
const STATUS_OPTIONS = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/api/Admin/Orders');
      setOrders(res.data);
    } catch (err) {
      setError('Could not load orders. Make sure you are logged in with an Admin account.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId, newStatus) {
    try {
      await client.put(`/api/Admin/Orders/${orderId}/Status`, { status: newStatus });
      loadOrders();
    } catch (err) {
      setError('Could not update order status.');
      console.error(err);
    }
  }

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <h1>Orders</h1>
        <p className="orders-subtitle">Manage order status and track fulfillment</p>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <div className="table-skeleton">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="skeleton-row" key={i}></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed</th>
                <th>Tracking #</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderId}>
                  <td className="order-id-cell">#{o.orderId}</td>
                  <td>
                    <div className="customer-name">{o.customerName}</div>
                    <div className="customer-email">{o.customerEmail}</div>
                  </td>
                  <td>{o.itemCount}</td>
                  <td className="total-cell">RS {o.finalTotal}</td>
                  <td>
                    <select
                      className={`status-select status-select-${o.status?.toLowerCase()}`}
                      value={o.status}
                      onChange={(e) => updateStatus(o.orderId, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="date-cell">{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '-'}</td>
                  <td className="tracking-cell">{o.trackingNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}