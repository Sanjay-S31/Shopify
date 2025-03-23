import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { FaRupeeSign, FaHeart, FaShoppingCart } from "react-icons/fa";
import './style_components/singleProduct.css';

export default function SingleProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthContext();

    const [product, setProduct] = useState({});
    const [liked, setLiked] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [newReview, setNewReview] = useState('');
    const [reviews, setReviews] = useState([]);

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
                setReviews(result.productReviews || []);

                // Add product ID to product_ids set (history or recent views)
                await fetch('/api/user/addProductId', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ productId: id })
                });

                // Fetch liked products to check if this one is already liked
                const likedResponse = await fetch('/api/user/likedProducts', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (likedResponse.ok) {
                    const likedData = await likedResponse.json();
                    if (likedData.liked_items.includes(id)) {
                        setLiked(true);  // Set liked to true if product is in liked list
                    }
                }

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

            const data = await response.json();

            if (response.ok && data) {
                navigate('/cart');
            } else {
                console.log("Error occurred during the purchase");
            }
        } catch (error) {
            console.error("Purchase error:", error);
        }
    };

    const handleLike = async () => {
        try {
            await fetch('/api/user/addLikedProduct', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ productId: id })
            });
    
            setLiked(prev => !prev); // Toggle like visually
        } catch (error) {
            console.error("Like error:", error);
        }
    };
    
    const handleAddReview = async () => {
        if (!newReview.trim()) return;

        try {
            const response = await fetch('/api/products/addReview/' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ review: newReview })
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                setProduct(updatedProduct);
                setReviews(updatedProduct.productReviews);
                setNewReview('');
                // Automatically show reviews after submitting
                setShowReviews(true);
            } else {
                console.log("Failed to add review");
            }
        } catch (error) {
            console.error("Add review error:", error);
        }
    };

    return (
        <div className="single-product-page">
            <div className="single-product-container">
                <div className="single-product-image-section">
                    <img 
                        className="single-product-image" 
                        src={product.productImage} 
                        alt={product.productName} 
                    />
                </div>
                
                <div className="single-product-details">
                    <div className="product-name-like">
                        <h1 className="single-product-name">{product.productName}</h1>
                        <FaHeart
                            className="like-icon"
                            onClick={handleLike}
                            style={{ color: liked ? '#ff3366' : '#ddd', fontSize: '28px' }}
                        />
                    </div>
                    
                    <div className="product-price">
                        <FaRupeeSign className="price-icon" /> {product.cost}
                    </div>
                    
                    <div className="product-info">
                        <div className="product-info-item">
                            <span className="product-info-label">Description:</span>
                            <span>{product.description}</span>
                        </div>
                        
                        <div className="product-info-item">
                            <span className="product-info-label">Category:</span>
                            <span>{product.productType}</span>
                        </div>
                        
                        <div className="product-info-item">
                            <span className="product-info-label">In Stock:</span>
                            <span>{product.quantity} units</span>
                        </div>
                        
                        {product.tags && (
                            <div className="product-info-item">
                                <span className="product-info-label">Tags:</span>
                                <span>{product.tags}</span>
                            </div>
                        )}
                    </div>
                    
                    <button className="buy-button" onClick={handleBuy}>
                        <FaShoppingCart style={{ marginRight: '8px' }} /> Buy Now
                    </button>

                    <div className="review-section">
                        <h3>Share Your Thoughts</h3>
                        <textarea
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            placeholder="Write your review here..."
                            className="review-input"
                        ></textarea>
                        
                        <div className="review-actions">
                            <button onClick={handleAddReview} className="review-button">
                                Submit Review
                            </button>
                            
                            <button 
                                onClick={() => setShowReviews(!showReviews)} 
                                className="review-toggle-button"
                            >
                                {showReviews ? "Hide Reviews" : "View Reviews"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Reviews section moved outside the single-product-container */}
            {showReviews && (
                <div className="reviews-container">
                    <div className="reviews-list">
                        <h4>Customer Reviews</h4>
                        {reviews.length === 0 ? (
                            <p className="no-reviews">No reviews yet. Be the first to review!</p>
                        ) : (
                            reviews.map((rev, index) => (
                                <div key={index} className="review-item">
                                    {rev}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}