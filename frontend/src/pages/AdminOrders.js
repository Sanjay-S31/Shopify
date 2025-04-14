import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import "./style_pages/admin_orders.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [statusUpdating, setStatusUpdating] = useState({});
  const { user } = useAuthContext();

  // Status options for dropdown
  const statusOptions = ["processing", "shipped", "delivered", "cancelled"];

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        if (!user) return;

        const response = await fetch("/api/orders/admin/all", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Failed to fetch orders");
        }

        setOrders(json);

        // Initialize selected status for each order
        const initialStatuses = {};
        json.forEach(order => {
          initialStatuses[order._id] = order.orderStatus || "processing";
        });
        setSelectedStatus(initialStatuses);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, [user]);

  const handleStatusChange = (orderId, newStatus) => {
    setSelectedStatus({
      ...selectedStatus,
      [orderId]: newStatus
    });
  };

  const updateOrderStatus = async (orderId) => {
    try {
      setStatusUpdating({
        ...statusUpdating,
        [orderId]: true
      });


      const response = await fetch(`/api/orders/admin/status/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ orderStatus: selectedStatus[orderId] }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to update order status");
      }

      // Update order in state
      setOrders(orders.map(order =>
        order._id === orderId
          ? { ...order, orderStatus: selectedStatus[orderId] }
          : order
      ));

      alert("Order status updated successfully!");
    } catch (err) {
      setError(err.message);
      alert("Failed to update order status: " + err.message);
    } finally {
      setStatusUpdating({
        ...statusUpdating,
        [orderId]: false
      });
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      'cod': 'Cash on Delivery',
      'card': 'Card Payment',
      'upi': 'UPI Payment'
    };
    return methods[method] || method;
  };

  const formatOrderStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) return <div className="admin-loading">Loading orders...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="admin-orders-container">
      <h1>Manage Customer Orders</h1>

      <div className="admin-orders-count">
        <span>Total Orders: {orders.length}</span>
      </div>

      <div className="admin-orders-table-container">
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Shipping Details</th>
              <th>Payment</th>
              <th>Current Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="9" className="admin-no-orders">No orders found</td>
              </tr>
            ) : (
              orders.map((order) => {
                const status = order.orderStatus || "processing";
                return (
                  <tr key={order._id} className={`admin-status-${status.toLowerCase()}`}>
                    <td className="admin-order-id">#{order._id.substring(order._id.length - 6)}</td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>
                      <div className="admin-order-items">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="admin-order-item">
                            <span className="admin-item-name">{item.productName}</span>
                            <span className="admin-item-quantity">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="admin-order-total">{order.totalAmount.toFixed(2)}</td>
                    <td className="admin-shipping-address">
                      <div>{order.shippingInfo.name}</div>
                      <div>{order.shippingInfo.address}</div>
                      <div>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.pincode}</div>
                      <div>Mobile: {order.shippingInfo.mobile}</div>
                    </td>
                    <td className="admin-payment-info">
                      <div>
                        <span className="admin-payment-method-label">Method:</span> {formatPaymentMethod(order.paymentMethod)}
                      </div>
                      <div className={`admin-payment-status admin-payment-${order.paymentStatus}`}>
                        Status: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </div>
                    </td>

                    <td className="admin-status">
                      <div className={`admin-status-label admin-status-${status.toLowerCase()}`}>
                        {formatOrderStatus(status)}
                      </div>
                    </td>

                    <td className="admin-actions">
                      <div className="admin-status-update">
                        <select
                          value={selectedStatus[order._id] || status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={statusUpdating[order._id]}
                        >
                          {statusOptions.map(statusOption => (
                            <option key={statusOption} value={statusOption}>
                              {formatOrderStatus(statusOption)}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => updateOrderStatus(order._id)}
                          disabled={statusUpdating[order._id] || selectedStatus[order._id] === status}
                          className="admin-update-btn"
                        >
                          {statusUpdating[order._id] ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}