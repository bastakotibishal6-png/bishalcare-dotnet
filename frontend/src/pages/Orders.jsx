import { useEffect, useState } from 'react';
import client from '../api/client';
import './Orders.css';

const STATUS_OPTIONS = [
  'Pending',
  'Paid',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled'
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadOrders() {
    setLoading(true);
    setError('');

    try {
      // client.js already contains /api in baseURL
      // Final URL:
      // https://bishalvoid-001-site1.ktempurl.com/api/Admin/Orders
      const res = await client.get('/Admin/Orders');

      console.log('Admin orders response:', res.data);
      console.log('Is orders array:', Array.isArray(res.data));

      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        console.error(
          'Unexpected orders response:',
          res.data
        );

        setOrders([]);
        setError('Invalid orders response from server.');
      }
    } catch (err) {
      console.error('Load orders error:', err);

      setOrders([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.Message ||
          err?.response?.data?.error ||
          err?.response?.data?.Error ||
          'Could not load orders. Make sure you are logged in with an Admin account.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId, newStatus) {
    try {
      setError('');

      // client.js already contains /api
      // Final URL:
      // /api/Admin/Orders/{orderId}/Status
      await client.put(
        `/Admin/Orders/${orderId}/Status`,
        {
          status: newStatus
        }
      );

      await loadOrders();
    } catch (err) {
      console.error(
        'Update order status error:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.Message ||
          err?.response?.data?.error ||
          err?.response?.data?.Error ||
          'Could not update order status.'
      );
    }
  }

  return (
    <div className="admin-orders">

      {/* HEADER */}
      <div className="orders-header">
        <h1>Orders</h1>

        <p className="orders-subtitle">
          Manage order status and track fulfillment
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <p className="error-text">
          {error}
        </p>
      )}

      {/* LOADING */}
      {loading ? (

        <div className="table-skeleton">

          {Array.from({ length: 6 }).map(
            (_, i) => (
              <div
                className="skeleton-row"
                key={i}
              />
            )
          )}

        </div>

      ) : orders.length === 0 ? (

        /* EMPTY */
        <div className="empty-orders">
          <p>No orders yet.</p>
        </div>

      ) : (

        /* TABLE */
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

              {Array.isArray(orders) &&
                orders.map((o) => (

                  <tr
                    key={o.orderId}
                  >

                    {/* ORDER ID */}
                    <td className="order-id-cell">
                      #{o.orderId}
                    </td>

                    {/* CUSTOMER */}
                    <td>

                      <div className="customer-name">
                        {o.customerName || '-'}
                      </div>

                      <div className="customer-email">
                        {o.customerEmail || '-'}
                      </div>

                    </td>

                    {/* ITEMS */}
                    <td>
                      {o.itemCount ?? 0}
                    </td>

                    {/* TOTAL */}
                    <td className="total-cell">
                      RS {o.finalTotal ?? 0}
                    </td>

                    {/* STATUS */}
                    <td>

                      <select
                        className={`status-select status-select-${(
                          o.status || ''
                        ).toLowerCase()}`}
                        value={
                          o.status || 'Pending'
                        }
                        onChange={(e) =>
                          updateStatus(
                            o.orderId,
                            e.target.value
                          )
                        }
                      >

                        {STATUS_OPTIONS.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          )
                        )}

                      </select>

                    </td>

                    {/* DATE */}
                    <td className="date-cell">

                      {o.orderDate
                        ? new Date(
                            o.orderDate
                          ).toLocaleDateString()
                        : '-'}

                    </td>

                    {/* TRACKING */}
                    <td className="tracking-cell">
                      {o.trackingNumber || '-'}
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