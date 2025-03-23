import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom"; // Import navigation hook
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
  const navigate = useNavigate(); // Initialize navigate
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedProducts, setLikedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [hasFetchedRecommendations, setHasFetchedRecommendations] = useState(false);


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

        const productDetailsPromises = likedProductIds.map(
          async (productId) => {
            const productRes = await fetch("/api/products/" + productId, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
            });
            return await productRes.json();
          }
        );

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
      if (!user || !user.token) return; // Ensure user is logged in before fetching
  
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
  }, [user]); // Runs every time the user state changes (including page refresh)
  
  

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
    navigate(`/product/${productId}`); // Navigate to product detail page
  };

  return (
    <div className="homepage">
      {/* Carousel */}
      <div className="carousel">
        <FaChevronLeft className="arrow arrow-left" onClick={prevSlide} />
        <img
          className="slides"
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
        />
        <FaChevronRight className="arrow arrow-right" onClick={nextSlide} />
      </div>

      {/* Recommended Products */}
      {/* <div className="recommended-products">
        <h2>Recommended Products</h2>
        <div className="product-grid">
          {images.map((image, index) => (
            <div key={index} className="product-card">
              <img src={image} alt={`Product ${index + 1}`} />
            </div>
          ))}
        </div>
      </div> */}

      <div className="recommended-products">
        <h2>Recommended Products</h2>
        <div className="product-grid">
          {recommendedProducts.length === 0 ? (
            <p>No recommendations available.</p>
          ) : (
            recommendedProducts.map((product) => (
              <div
                key={product._id}
                className="product-card"
                onClick={() => handleProductClick(product._id)}
              >
                <img src={product.productImage} alt={product.productName} />
                <p>{product.productName}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Liked Products */}
      <div className="liked-products">
        <h2>Your Liked Products</h2>
        {likedProducts.length === 0 ? (
          <p>No liked products yet.</p>
        ) : (
          <div className="product-grid">
            {likedProducts.map((product) => (
              <div
                key={product._id}
                className="product-card liked"
                onClick={() => handleProductClick(product._id)}
              >
                <img src={product.productImage} alt={product.productName} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}