import { Link } from "react-router-dom";
import { FaUser, FaShoppingCart } from "react-icons/fa";

import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";
import "./style_components/navbar.css";

export default function Navbar() {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="navbar-header">
      <div className="navbar">
        <Link to="/">
          <h2>SHOPIFY</h2>
        </Link>
        <nav>
          {user && (
            <div>
              <span>
                <FaUser /> {user.username}
              </span>
              {user.userType === "artisan" && <Link to="/upload">Upload</Link>}
              <Link to="/">Home</Link>
              <Link to="/product">Products</Link>
              <Link to="/cart">
                <FaShoppingCart className="cart-icon" />
              </Link>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
          {!user && (
            <div>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
