import { useAuthContext } from "../hooks/useAuthContext";
import { FaPen } from "react-icons/fa";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import './style_pages/profile.css';

export default function Profile() {
    const { user } = useAuthContext();
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [gender, setGender] = useState("");
    const [address, setAddress] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/user/getUserProfile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setEmail(data.email || ""); 
                    setMobile(data.mobile_no || "");
                    setGender(data.gender || "");
                    setAddress(data.address || "");
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError("Failed to fetch profile");
            }
        };

        if (user) fetchProfile();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch('/api/user/editUserProfile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ mobile_no: mobile, gender, address })
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error);
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your profile has been updated successfully.',
                    confirmButtonColor: '#4CAF50'
                });
            }
        } catch (err) {
            setError("Failed to update profile");
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmNewPassword) {
            setError("New password and confirm password do not match");
            return;
        }

        try {
            const response = await fetch('/api/user/changePassword', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error);
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Changed',
                    text: 'Your password has been changed successfully.',
                    confirmButtonColor: '#4CAF50'
                });                
                setIsModalOpen(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
            }
        } catch (err) {
            setError("Failed to change password");
        }
    };

    return (
        <div className="profile-container">
            <h2>User Profile</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="profile-field">
                <label>Username:</label>
                <span>{user.username}</span>
            </div>
            <div className="profile-field">
                <label>Email:</label>
                <span>{email}</span>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                    <label className="form-label">Mobile:</label>
                    <div className="input-with-icon">
                        <input
                            type="text"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="Enter mobile number"
                        />
                        <FaPen className="edit-icon" />
                    </div>
                </div>

                <div className="form-row">
                    <label className="form-label">Gender:</label>
                    <div className="gender-options">
                        <label>
                            <input
                                type="radio"
                                value="Male"
                                checked={gender === "Male"}
                                onChange={(e) => setGender(e.target.value)}
                            />
                            <span>Male</span>
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="Female"
                                checked={gender === "Female"}
                                onChange={(e) => setGender(e.target.value)}
                            />
                            <span>Female</span>
                        </label>
                    </div>
                </div>

                <div className="form-row">
                    <label className="form-label">Address:</label>
                    <div className="input-with-icon">
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter your address"
                        />
                        <FaPen className="edit-icon" />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit">Submit</button>
                    <button
                        type="button"
                        className="password-btn"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Change Password
                    </button>
                </div>
            </form>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Change Password</h3>
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="form-row">
                                <label className="form-label">Old Password:</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Enter old password"
                                />
                            </div>
                            <div className="form-row">
                                <label className="form-label">New Password:</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="form-row">
                                <label className="form-label">Confirm Password:</label>
                                <input
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit">Submit</button>
                                <button
                                    type="button"
                                    className="close-btn"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
