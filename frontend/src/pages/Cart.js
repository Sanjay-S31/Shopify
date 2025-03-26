import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { FaRupeeSign, FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';
import './style_pages/cart.css';

export default function Cart() {
    const { user } = useAuthContext();
    const [cartProduct, setCartProduct] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function displayAll() {
            setIsLoading(true);
            try {
                const response = await fetch("/api/cart", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${user.token}`,
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const updatedData = data.map(item => ({
                        ...item,
                        selectedQuantity: 1
                    }));
                    calculateTotal(updatedData);
                    setCartProduct(updatedData);
                } 
                else {
                    console.log("Failed to fetch cart items");
                }
            } 
            catch (error) {
                console.error("Fetch cart items error:", error);
            }
            finally {
                setIsLoading(false);
            }
        }

        displayAll();
    }, [user.token]);

    const calculateTotal = (products) => {
        const totalCost = products.reduce((acc, product) => acc + (product.cost * product.selectedQuantity), 0);
        setTotal(totalCost);
    };

    const handleRemove = async (id) => {
        try {
            const response = await fetch('/api/cart/remove/' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const updatedCart = cartProduct.filter(item => item._id !== id);
                setCartProduct(updatedCart);
                calculateTotal(updatedCart);
            } else {
                console.log("Error occurred during removal");
            }
        } catch (error) {
            console.error("Removal error:", error);
        }
    };

    const handleQuantityChange = (id, delta) => {
        const updatedCart = cartProduct.map(item => {
            if (item._id === id) {
                const newQty = Math.min(Math.max(item.selectedQuantity + delta, 1), item.quantity);
                return { ...item, selectedQuantity: newQty };
            }
            return item;
        });

        setCartProduct(updatedCart);
        calculateTotal(updatedCart);
    };

    const showSwal = () => {
        withReactContent(Swal).fire({
            icon: 'success',
            title: 'Proceeding to Payment',
            text: 'Redirecting you to the payment page...',
            confirmButtonText: 'Continue'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/payment');
            }
        });
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const LoadingSpinner = () => (
        <div className="cart-loading-container">
            <FaSpinner className="cart-loading-spinner" />
            <p>Loading your cart...</p>
        </div>
    );

    // Render loading state
    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="cart-page">
            {cartProduct.length === 0 ? (
                <div className="empty-cart">
                    <h2>Your cart is empty.</h2>
                    <button className="go-home-button" onClick={handleGoHome}>Continue Shopping</button>
                </div>
            ) : (
                <>
                    {cartProduct.map(item => (
                        <div key={item._id} className="cart-items">
                            <div className="cart-item-img">
                                <img src={item.productImage} alt={item.productName} />
                            </div>
                            <div className="cart-item-info">
                                <h1>{item.productName}</h1>
                                <h3>Cost: <FaRupeeSign />{item.cost}</h3>
                                <div className="quantity-controls">
                                    <button onClick={() => handleQuantityChange(item._id, -1)}>-</button>
                                    <span>{item.selectedQuantity}</span>
                                    <button onClick={() => handleQuantityChange(item._id, 1)}>+</button>
                                </div>
                            </div>
                            <button className="cart-remove-button" onClick={() => handleRemove(item._id)}>Remove</button>
                        </div>
                    ))}
                    <div className="checkout-container">
                        <h3 className="total-amount">Total Amount: <FaRupeeSign />{total}</h3>
                        <button className="checkout-button" onClick={showSwal}>Checkout</button>
                    </div>
                </>
            )}
        </div>
    );
}
