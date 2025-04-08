import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from 'sweetalert2';
import './style_pages/forgotPassword.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/user/forgotPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            Swal.fire({
                title: 'Success!',
                text: 'Password reset link has been sent to your email',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/login');
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <div className="forgot-password-content">
                    <div className="forgot-password-header">
                        <h2>Forgot Password</h2>
                        <p>Enter your email address to receive a password reset link</p>
                    </div>

                    <form onSubmit={handleSubmit} className="forgot-password-form">
                        <div className="forgot-password-input-group">
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

                        <button
                            type="submit"
                            className="forgot-password-verify-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify'}
                        </button>

                        {error && <div className="forgot-password-error-message">{error}</div>}

                        <div className="forgot-password-back-to-login">
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </form>
                </div>

                <div className="forgot-password-image">
                    <div className="forgot-password-overlay">
                        <div className="forgot-password-welcome-text">
                            <h2>Recover Access</h2>
                            <p>We'll help you get back to your account</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
