import { Link } from "react-router-dom";
import { FaUser, FaShoppingCart, FaCaretDown } from "react-icons/fa";
import { useState } from "react";

import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";
import "./style_components/navbar.css";

export default function Navbar() {
	const { logout } = useLogout();
	const { user } = useAuthContext();
	const [showAdminDropdown, setShowAdminDropdown] = useState(false);

	const handleLogout = () => {
		logout();
	};

	const toggleAdminDropdown = () => {
		setShowAdminDropdown(!showAdminDropdown);
	};

	const closeAdminDropdown = () => {
		setShowAdminDropdown(false);
	};

	return (
		<header className="navbar-header">
			<div className="navbar">
				<Link to="/">
					<h1>SHOPIFY</h1>
				</Link>
				<nav>
					{user && (
						<div className="nav-links">
						<Link to="/profile">
							<span>
								<FaUser /> {user.username}
							</span>
							</Link>
							{user.userType === "admin" ? (
								<div className="dropdown" onMouseLeave={closeAdminDropdown}>
									<button className="dropdown-toggle" onClick={toggleAdminDropdown}>
										Admin <FaCaretDown />
									</button>
									{showAdminDropdown && (
										<div className="dropdown-menu">
											<Link to="/upload">Upload</Link>
											<Link to="/admin-orders">Orders</Link>
										</div>
									)}
								</div>
							) : (
								<Link to="/orders">My Orders</Link>
							)}

							<Link to="/">Home</Link>
							<Link to="/products">Products</Link>
							
							{user.userType !== "admin" && (
								<Link to="/cart">
									<FaShoppingCart className="cart-icon" />
								</Link>
							)}

							<button className="logout-btn" onClick={handleLogout}>Logout</button>
						</div>
					)}
					{!user && (
						<div className="auth-links">
							<Link to="/login">Login</Link>
							<Link to="/signup">Signup</Link>
						</div>
					)}
				</nav>
			</div>
		</header>
	);
}