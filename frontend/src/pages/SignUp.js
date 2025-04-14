import { useState, useEffect } from "react";
import { useSignup } from '../hooks/useSignup';
import { Link, useNavigate } from "react-router-dom";

import './style_pages/signup.css'

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [userType, setUserType] = useState("user");

    const navigate = useNavigate();
    const { signup, error, isLoading, success } = useSignup();

    useEffect(() => {
        // If signup is successful, redirect to login page
        if (success) {
            navigate('/login');
        }
    }, [success, navigate]);


    const handleSubmit = async (event) => {
        event.preventDefault();
        await signup(username, email, password, userType);
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-content">
                    <div className="signup-header">
                        <p>Create an account to start shopping</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="johndoe"
                            />
                        </div>
                        
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your@email.com"
                            />
                        </div>
                        
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        
                        <div className="input-group" style={{ display: "none" }}>
                            <label htmlFor="userType">Account Type</label>
                            <select 
                                id="userType"
                                className="select-user" 
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="signup-button" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                        
                        {error && <div className="error-message">{error}</div>}
                        
                    </form>
                    
                    <div className="login-link">
                        <p>Already have an account? <Link to="/login">Sign in</Link></p>
                    </div>
                </div>
                
                <div className="signup-image">
                    <div className="signup-overlay">

                        <div className="floating-elements">
                            <div className="price-tag price-tag-1">SALE</div>
                            <div className="price-tag price-tag-2">50% OFF</div>
                            <div className="price-tag price-tag-3">NEW</div>
                            <div className="shopping-bag shopping-bag-1"></div>
                            <div className="shopping-bag shopping-bag-2"></div>
                        </div>
                        
                        <div className="welcome-text">
                            <h2>Join Shopify Today</h2>
                            <p>Create an account and start exploring our amazing products</p>
                        </div>
                        
                        <div className="animation-container">
                            <div className="shopping-cart">
                                <div className="cart-body"></div>
                                <div className="cart-handle"></div>
                                <div className="cart-wheel cart-wheel-left"></div>
                                <div className="cart-wheel cart-wheel-right"></div>
                            </div>
                            
                            <div className="product product-1"></div>
                            <div className="product product-2"></div>
                            <div className="product product-3"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}