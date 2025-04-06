import { useState } from "react";
import { useSignup } from '../hooks/useSignup';
import { Link } from "react-router-dom";

import './style_pages/signup.css'

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [userType, setUserType] = useState("user");

    const { signup, error, isLoading } = useSignup();

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
                        
                        <div className="divider">
                            <span>or sign up with</span>
                        </div>
                        
                        <div className="social-login">
                            <button type="button" className="social-button facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                                    <path fill="#1877F2" d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"></path>
                                    <path fill="#fff" d="M26.707,29.301h5.176l0.813-5.258h-5.989v-2.874c0-2.184,0.714-4.121,2.757-4.121h3.283V12.46 c-0.577-0.078-1.797-0.248-4.102-0.248c-4.814,0-7.636,2.542-7.636,8.334v3.498H16.06v5.258h4.948v14.452 C21.988,43.9,22.981,44,24,44c0.921,0,1.82-0.084,2.707-0.204V29.301z"></path>
                                </svg>
                                <span>Facebook</span>
                            </button>
                            <button type="button" className="social-button google">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                </svg>
                                <span>Google</span>
                            </button>
                        </div>
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