import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { FaRupeeSign } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';
import './style_pages/payment.css';

export default function Payment() {
    const { user } = useAuthContext();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        mobile: "",
        paymentMethod: "card"
    });
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch cart items when component mounts
        async function fetchCartItems() {
            try {
                const response = await fetch("/api/cart", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${user.token}`
                    }
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setCartItems(data);
                    
                    // Calculate total
                    const totalCost = data.reduce((acc, item) => 
                        acc + (item.cost * (item.selectedQuantity || 1)), 0);
                    setTotal(totalCost);
                } else {
                    console.log("Failed to fetch cart items");
                    navigate('/cart');
                }
            } catch (error) {
                console.error("Error fetching cart items:", error);
                navigate('/cart');
            }
        }

        // Fetch user info if available
        async function fetchUserInfo() {
            try {
                const response = await fetch("/api/user/getUserProfile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setFormData(prevData => ({
                        ...prevData,
                        name: userData.username || "",
                        address: userData.address || "",
                        city: userData.city || "",
                        state: userData.state || "",
                        pincode: userData.pincode || "",
                        mobile: userData.mobile_no || ""
                    }));
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        }
    
        fetchCartItems();
        fetchUserInfo();
    }, [user.token, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const requiredFields = ['name', 'address', 'mobile'];
        const emptyFields = requiredFields.filter(field => !formData[field]);
        
        if (emptyFields.length > 0) {
            withReactContent(Swal).fire({
                icon: 'error',
                title: 'Missing Information',
                text: `Please fill in the following fields: ${emptyFields.join(', ')}`,
                confirmButtonText: 'OK'
            });
            return;
        }

        // Create order object
        const orderData = {
            items: cartItems,
            totalAmount: total,
            shippingInfo: {
                name: formData.name,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                mobile: formData.mobile
            },
            paymentMethod: formData.paymentMethod
        };

        try {
            // Send order to backend
            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                // Clear cart after successful order
                await clearCart();
                
                // Show success message
                withReactContent(Swal).fire({
                    icon: 'success',
                    title: 'Order Placed Successfully!',
                    text: 'Thank you for your purchase. Your order has been placed successfully.',
                    confirmButtonText: 'Continue Shopping'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/');
                    }
                });
            } else {
                const error = await response.json();
                throw new Error(error.message || "Failed to place order");
            }
        } catch (error) {
            withReactContent(Swal).fire({
                icon: 'error',
                title: 'Order Failed',
                text: error.message || "Something went wrong. Please try again.",
                confirmButtonText: 'OK'
            });
        }
    };

    const clearCart = async () => {
        try {
            const response = await fetch('/api/cart/removeItems', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                console.error("Failed to clear cart");
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
    };

    return (
        <div className="payment-page">
            <div className="payment-container">
                <h1 className="payment-title">Checkout</h1>
                
                <div className="payment-sections">
                    <div className="payment-form-section">
                        <h2>Shipping Information</h2>
                        <form onSubmit={handleSubmit} className="payment-form">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleInputChange} 
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="address">Address</label>
                                <textarea 
                                    id="address" 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleInputChange} 
                                    required
                                ></textarea>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city">City</label>
                                    <input 
                                        type="text" 
                                        id="city" 
                                        name="city" 
                                        value={formData.city} 
                                        onChange={handleInputChange}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="state">State</label>
                                    <input 
                                        type="text" 
                                        id="state" 
                                        name="state" 
                                        value={formData.state} 
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="pincode">Pincode</label>
                                    <input 
                                        type="text" 
                                        id="pincode" 
                                        name="pincode" 
                                        value={formData.pincode} 
                                        onChange={handleInputChange}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="mobile">Mobile Number</label>
                                    <input 
                                        type="tel" 
                                        id="mobile" 
                                        name="mobile" 
                                        value={formData.mobile} 
                                        onChange={handleInputChange} 
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Payment Method</label>
                                <div className="payment-options">
                                    <label className="payment-option">
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="card" 
                                            checked={formData.paymentMethod === "card"} 
                                            onChange={handleInputChange}
                                        />
                                        <span>Credit/Debit Card</span>
                                    </label>
                                    
                                    <label className="payment-option">
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="upi" 
                                            checked={formData.paymentMethod === "upi"} 
                                            onChange={handleInputChange}
                                        />
                                        <span>UPI</span>
                                    </label>
                                    
                                    <label className="payment-option">
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="cod" 
                                            checked={formData.paymentMethod === "cod"} 
                                            onChange={handleInputChange}
                                        />
                                        <span>Cash on Delivery</span>
                                    </label>
                                </div>
                            </div>
                            
                            <button type="submit" className="pay-button">Place Order</button>
                        </form>
                    </div>
                    
                    <div className="order-summary-section">
                        <h2>Order Summary</h2>
                        <div className="cart-items-summary">
                            {cartItems.length > 0 ? (
                                cartItems.map(item => (
                                    <div key={item._id} className="summary-item">
                                        <div className="summary-item-info">
                                            <div className="summary-item-img">
                                                <img src={item.productImage} alt={item.productName} />
                                            </div>
                                            <div className="summary-item-details">
                                                <h4>{item.productName}</h4>
                                                <p>Quantity: {item.selectedQuantity || 1}</p>
                                            </div>
                                        </div>
                                        <div className="summary-item-price">
                                            <FaRupeeSign />{item.cost * (item.selectedQuantity || 1)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-cart-message">Your cart is empty</p>
                            )}
                        </div>
                        
                        <div className="price-summary">
                            <div className="price-row">
                                <span>Subtotal</span>
                                <span><FaRupeeSign />{total}</span>
                            </div>
                            <div className="price-row">
                                <span>Shipping</span>
                                <span>{total > 1000 ? 'Free' : <><FaRupeeSign />49</>}</span>
                            </div>
                            <div className="price-row total">
                                <span>Total</span>
                                <span><FaRupeeSign />{total > 1000 ? total : total + 49}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}