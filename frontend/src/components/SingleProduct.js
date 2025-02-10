import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { FaRupeeSign } from "react-icons/fa";
import './style_components/singleProduct.css'

export default function SingleProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthContext();

    const [product, setProduct] = useState({});

    const fetchProductInfo = useCallback(async (id) => {
        try {
            const response = await fetch('/api/products/' + id, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setProduct(result);
            } else {
                console.log("Error fetching product information");
            }
        } catch (error) {
            console.error("Fetch product error:", error);
        }
    }, [user.token]);

    useEffect(() => {
        if (id && user) {
            fetchProductInfo(id);
        }
    }, [id, user, fetchProductInfo]);

    const handleBuy = async () => {
        try {
            const response = await fetch('/api/cart/add/' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            const data = await response.json()

            if (response.ok && data) {
                navigate('/cart');
            } else {
                console.log("Error occurred during the purchase");
            }
        } catch (error) {
            console.error("Purchase error:", error);
        }
    };

    return (
        <div className="single-product-container">
            <img className="single-product-image" src={product.productImage} alt={product.productName} />
            <div className="single-product-details">
                <h1 className="single-product-name">{product.productName}</h1>
                <p><strong>Cost: </strong><FaRupeeSign/>{product.cost}</p>
                <p><strong>Description: </strong>{product.description}</p>
                <p><strong>Type: </strong>{product.productType}</p>
                <p><strong>Left : </strong>{product.quantity}</p>
                <p><strong>Tags: </strong>{product.tags}</p>
                <button className="buy-button" onClick={handleBuy}>Buy Now</button>
            </div>
        </div>
    );
}
