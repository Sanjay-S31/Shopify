import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import "./style_pages/home.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";
import img4 from "../assets/img4.jpg";
import img5 from "../assets/img5.jpg";

const images = [img1, img2, img3, img4, img5];

export default function Home() {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [likedProducts, setLikedProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 3000);
        return () => clearInterval(interval);
    }, [currentIndex]);

    useEffect(() => {
        const fetchLikedProducts = async () => {
            try {
                const res = await fetch("/api/user/likedProducts", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                const data = await res.json();
                const likedProductIds = data.liked_items || [];

                const productDetailsPromises = likedProductIds.map(async (productId) => {
                    const productRes = await fetch("/api/products/" + productId, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${user.token}`,
                        },
                    });
                    return await productRes.json();
                });

                const likedProductDetails = await Promise.all(productDetailsPromises);
                setLikedProducts(likedProductDetails);
            } catch (err) {
                console.error("Error fetching liked products:", err);
            }
        };

        if (user && user.token) {
            fetchLikedProducts();
        }
    }, [user]);

    useEffect(() => {
        const fetchRecommendedProducts = async () => {
            if (!user || !user.token) return;

            try {
                const res = await fetch("/api/user/recommendation", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch recommended products");
                }

                const data = await res.json();
                setRecommendedProducts(data.recommendedProducts || []);
                localStorage.setItem("recommendedProducts", JSON.stringify(data.recommendedProducts || []));
            } catch (err) {
                console.error("Error fetching recommended products:", err);
            }
        };

        fetchRecommendedProducts();
    }, [user]);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    return (
        <div className="homepage">
            {/* Carousel */}
            <div className="home-carousel">
                <FaChevronLeft className="home-arrow home-arrow-left" onClick={prevSlide} />
                <img
                    className="home-slides"
                    src={images[currentIndex]}
                    alt={`Slide ${currentIndex + 1}`}
                />
                <FaChevronRight className="home-arrow home-arrow-right" onClick={nextSlide} />
            </div>

            {/* Recommended Products */}
            <div className="home-recommended-products">
                <h2>Recommended Products</h2>
                {recommendedProducts.length === 0 ? (
                    <p>No recommendations available.</p>
                ) : (
                    <div className="home-product-grid">
                        {recommendedProducts.map((product) => (
                            <div
                                key={product._id}
                                className="home-product-card"
                                onClick={() => handleProductClick(product._id)}
                            >
                                <img src={product.productImage} alt={product.productName} />
                                <div className="home-product-info">
                                    <p className="home-product-name">{product.productName}</p>
                                    <p className="home-product-cost">₹{product.cost}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Liked Products */}
            <div className="home-liked-products">
                <h2>Your Liked Products</h2>
                {likedProducts.length === 0 ? (
                    <p>No liked products yet.</p>
                ) : (
                    <div className="home-product-grid">
                        {likedProducts.map((product) => (
                            <div
                                key={product._id}
                                className="home-product-card"
                                onClick={() => handleProductClick(product._id)}
                            >
                                <img src={product.productImage} alt={product.productName} />
                                <div className="home-product-info">
                                    <p className="home-product-name">{product.productName}</p>
                                    <p className="home-product-cost">₹{product.cost}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}