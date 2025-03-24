import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { FaRupeeSign, FaBoxOpen, FaShippingFast, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './style_pages/order.css';

export default function Order() {
    const { user } = useAuthContext();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/orders/current_user", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${user.token}`,
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data);
                // If there are orders and none is selected, select the first one
                if (data.length > 0 && !selectedOrder) {
                    setSelectedOrder(data[0]);
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user.token, selectedOrder]);

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
    };

    const handleCancelOrder = async (orderId) => {
        try {
            const response = await fetch(`/api/orders/cancel/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${user.token}`,
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to cancel order');
            }

            // Refresh the selected order and orders list
            const updatedOrdersResponse = await fetch("/api/orders/current_user", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${user.token}`,
                }
            });
            
            if (updatedOrdersResponse.ok) {
                const updatedOrders = await updatedOrdersResponse.json();
                setOrders(updatedOrders);
                
                // Update the selected order
                if (selectedOrder) {
                    const updatedSelectedOrder = updatedOrders.find(order => order._id === selectedOrder._id);
                    if (updatedSelectedOrder) {
                        setSelectedOrder(updatedSelectedOrder);
                    }
                }
            }
        } catch (err) {
            console.error("Error cancelling order:", err);
            alert(err.message);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processing':
                return <FaBoxOpen className="user-status-icon user-processing" />;
            case 'shipped':
                return <FaShippingFast className="user-status-icon user-shipped" />;
            case 'delivered':
                return <FaCheckCircle className="user-status-icon user-delivered" />;
            case 'cancelled':
                return <FaTimesCircle className="user-status-icon user-cancelled" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <div className="user-order-loading">Loading your orders...</div>;
    }

    if (error) {
        return <div className="user-order-error">Error: {error}</div>;
    }

    return (
        <div className="user-order-page">
            <h1 className="user-page-title">My Orders</h1>
            
            {orders.length === 0 ? (
                <div className="user-no-orders">
                    <h2>You haven't placed any orders yet</h2>
                    <p>Once you place an order, you'll be able to track it here.</p>
                    <Link to="/" className="user-shop-now-btn">Shop Now</Link>
                </div>
            ) : (
                <div className="user-order-container">
                    <div className="user-order-list">
                        <h2>Order History</h2>
                        {orders.map(order => (
                            <div 
                                key={order._id} 
                                className={`user-order-item ${selectedOrder && selectedOrder._id === order._id ? 'user-selected' : ''}`}
                                onClick={() => handleViewOrder(order)}
                            >
                                <div className="user-order-item-header">
                                    <div className="user-order-date">{formatDate(order.orderDate)}</div>
                                    <div className={`user-order-status ${order.orderStatus}`}>
                                        {getStatusIcon(order.orderStatus)}
                                        <span>{order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}</span>
                                    </div>
                                </div>
                                <div className="user-order-item-content">
                                    <div className="user-order-amount">
                                        <FaRupeeSign /> {order.totalAmount}
                                    </div>
                                    <div className="user-order-items-count">
                                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="user-order-details">
                        {selectedOrder && (
                            <>
                                <div className="user-order-details-header">
                                    <h2>Order Details</h2>
                                    <div className="user-order-id">ID: {selectedOrder._id}</div>
                                </div>
                                
                                <div className="user-order-status-timeline">
                                    <div className={`user-timeline-item ${selectedOrder.orderStatus === 'processing' || selectedOrder.orderStatus === 'shipped' || selectedOrder.orderStatus === 'delivered' ? 'user-active' : ''}`}>
                                        <div className="user-timeline-icon">
                                            <FaBoxOpen />
                                        </div>
                                        <div className="user-timeline-content">
                                            <h4>Processing</h4>
                                            <p>Order confirmed and being processed</p>
                                        </div>
                                    </div>
                                    
                                    <div className={`user-timeline-item ${selectedOrder.orderStatus === 'shipped' || selectedOrder.orderStatus === 'delivered' ? 'user-active' : ''}`}>
                                        <div className="user-timeline-icon">
                                            <FaShippingFast />
                                        </div>
                                        <div className="user-timeline-content">
                                            <h4>Shipped</h4>
                                            <p>Your order is on the way</p>
                                        </div>
                                    </div>
                                    
                                    <div className={`user-timeline-item ${selectedOrder.orderStatus === 'delivered' ? 'user-active' : ''}`}>
                                        <div className="user-timeline-icon">
                                            <FaCheckCircle />
                                        </div>
                                        <div className="user-timeline-content">
                                            <h4>Delivered</h4>
                                            <p>{selectedOrder.deliveryDate ? `Delivered on ${formatDate(selectedOrder.deliveryDate)}` : 'Will be delivered soon'}</p>
                                        </div>
                                    </div>
                                    
                                    {selectedOrder.orderStatus === 'cancelled' && (
                                        <div className="user-timeline-item user-cancelled user-active">
                                            <div className="user-timeline-icon">
                                                <FaTimesCircle />
                                            </div>
                                            <div className="user-timeline-content">
                                                <h4>Cancelled</h4>
                                                <p>This order has been cancelled</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="user-order-sections">
                                    <div className="user-order-items-section">
                                        <h3>Items</h3>
                                        <div className="user-ordered-items">
                                            {selectedOrder.items.map((item, index) => (
                                                <div key={index} className="user-ordered-item">
                                                    <div className="user-ordered-item-image">
                                                        <img src={item.productImage} alt={item.productName} />
                                                    </div>
                                                    <div className="user-ordered-item-details">
                                                        <div className="user-ordered-item-name">{item.productName}</div>
                                                        <div className="user-ordered-item-quantity">Qty: {item.quantity}</div>
                                                        <div className="user-ordered-item-price">
                                                            <FaRupeeSign /> {item.cost}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="user-order-info-section">
                                        <div className="user-shipping-info">
                                            <h3>Shipping Address</h3>
                                            <p className="user-recipient-name">{selectedOrder.shippingInfo.name}</p>
                                            <p className="user-address-line">{selectedOrder.shippingInfo.address}</p>
                                            <p className="user-address-line">
                                                {selectedOrder.shippingInfo.city}{selectedOrder.shippingInfo.city && selectedOrder.shippingInfo.state ? ', ' : ''}
                                                {selectedOrder.shippingInfo.state} {selectedOrder.shippingInfo.pincode}
                                            </p>
                                            <p className="user-mobile">Mobile: {selectedOrder.shippingInfo.mobile}</p>
                                        </div>
                                        
                                        <div className="user-payment-info">
                                            <h3>Payment Details</h3>
                                            <div className="user-payment-row">
                                                <span>Method:</span>
                                                <span>{selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                                                       selectedOrder.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                                                       selectedOrder.paymentMethod === 'upi' ? 'UPI' : selectedOrder.paymentMethod}</span>
                                            </div>
                                            <div className="user-payment-row">
                                                <span>Status:</span>
                                                <span className={`user-payment-status ${selectedOrder.paymentStatus}`}>
                                                    {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                                                </span>
                                            </div>
                                            <div className="user-payment-row user-total">
                                                <span>Total:</span>
                                                <span><FaRupeeSign /> {selectedOrder.totalAmount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {selectedOrder.orderStatus === 'processing' && (
                                    <div className="user-order-actions">
                                        <button 
                                            className="user-cancel-order-btn" 
                                            onClick={() => handleCancelOrder(selectedOrder._id)}
                                        >
                                            Cancel Order
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}