import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { FaRupeeSign, FaHeart, FaShoppingCart, FaStar, FaSpinner } from "react-icons/fa";
import './style_components/singleProduct.css';

export default function SingleProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthContext();

    const [product, setProduct] = useState({});
    const [liked, setLiked] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [newReview, setNewReview] = useState('');
    const [newRating, setNewRating] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [overallRating, setOverallRating] = useState(0);

    const [isLoading, setIsLoading] = useState(true);

    const fetchProductInfo = useCallback(async (id) => {
        try {
            setIsLoading(true);
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

                // Calculate overall rating
                const totalRatings = result.productRatings || [];
                const avgRating = totalRatings.length > 0 
                    ? totalRatings.reduce((a, b) => a + b, 0) / totalRatings.length 
                    : 0;
                setOverallRating(avgRating);

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
        finally {
            setIsLoading(false);
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
                body: JSON.stringify({ 
                    review: newReview,
                    rating: newRating 
                })
            });

            const result = await response.json();
            console.log(result)
            if (response.ok) {
                if (result.message === "Product deleted due to excessive negative reviews.") {
                    alert("This product has been removed due to too many negative reviews.");
                    navigate("/"); // Redirect to home page or product list
                } 
                else {
                    setProduct(result);
                    setReviews(result.productReviews);
                    
                    // Recalculate overall rating
                    const totalRatings = result.productRatings || [];
                    const avgRating = totalRatings.length > 0 
                        ? totalRatings.reduce((a, b) => a + b, 0) / totalRatings.length 
                        : 0;
                    setOverallRating(avgRating);

                    setNewReview('');
                    setNewRating(0);
                    setShowReviews(true);
                }
            } 
            else {
                console.log("Failed to add review");
            }
        } 
        catch (error) {
            console.error("Add review error:", error);
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar 
                key={index} 
                className={`star-icon ${index < Math.round(rating) ? 'filled' : 'empty'}`} 
            />
        ));
    };

    // Loading Spinner Component
    const LoadingSpinner = () => (
        <div className="single-product-loading-container">
            <FaSpinner className="single-product-loading-spinner" />
            <p>Loading product details...</p>
        </div>
    );

    // If loading, return the spinner
    if (isLoading) {
        return <LoadingSpinner />;
    }

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

                    <div className="product-overall-rating">
                        <span className="product-info-label">Overall Rating: </span>
                        {renderStars(overallRating)}
                        <span className="rating-value">({overallRating.toFixed(1)})</span>
                    </div>
                    
                    <button className="buy-button" onClick={handleBuy}>
                        <FaShoppingCart style={{ marginRight: '8px' }} /> Add to Cart
                    </button>

                    <div className="review-section">
                        <h3>Share Your Thoughts</h3>

                        <div className="rating-input">
                            <span className="product-info-label"> Your Rating: </span>
                            {[...Array(5)].map((_, index) => (
                                <FaStar 
                                    key={index} 
                                    className={`star-icon ${index < newRating ? 'filled' : 'empty'}`}
                                    onClick={() => setNewRating(index + 1)}
                                />
                            ))}
                        </div>
                        
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
                        {reviews && reviews.length > 0 ? (
                            reviews.map((rev, index) => (
                                <div key={index} className="review-item">
                                    {rev}
                                    <div className="review-rating">
                                        {renderStars(product.productRatings[index] || 0)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-reviews">No reviews yet. Be the first to review!</p>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
