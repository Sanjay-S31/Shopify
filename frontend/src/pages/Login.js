import { useState } from "react";
import { useLogin } from '../hooks/useLogin';
import { Link } from "react-router-dom";
import './style_pages/login.css';
import { useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login,googleLogin,error, isLoading } = useLogin();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const error = params.get("error");

        if (error) {
            alert(decodeURIComponent(error));  // ✅ Show browser alert box
        }
    }, [location]);

    const handleSubmit = async (event) => {
        console.log(event)
        event.preventDefault();
        await login(email, password);
    };

    const handleGoogleLogin = () => {
        googleLogin(); // ✅ this now works
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-content">
                    <div className="login-header">
                        <p>Welcome back! Please login to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
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

                        <div className="forgot-password">
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </div>

                        <button 
                            type="submit" 
                            className="login-button" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Log in'}
                        </button>

                        {error && <div className="error-message">{error}</div>}

                        <div className="divider">
                            <span>or continue with</span>
                        </div>

                        <div className="social-login">
                            <button type="button" className="social-button google" onClick={handleGoogleLogin}>
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

                    <div className="signup-link">
                        <p>Don't have an account? <Link to="/signup">Signup</Link></p>
                    </div>
                </div>

                <div className="login-image">
                    <div className="login-overlay">
                        <div className="welcome-text">
                            <h2>Welcome to Shopify</h2>
                            <p>Discover amazing products and shop with confidence</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
