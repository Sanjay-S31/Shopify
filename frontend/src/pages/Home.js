import { useState, useEffect } from "react";
import "./style_pages/home.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";
import img4 from "../assets/img4.jpg";
import img5 from "../assets/img5.jpg";

const images = [img1, img2, img3, img4, img5];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

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

      {/* <div className="homepage-description">
        <h1>Welcome to SHOPIFY</h1>
        <i>"Shop like crazy !!"</i>
      </div> */}

      {/* Recommended Products */}
      <div className="recommended-products">
        <h2>Recommended Products</h2>
        <div className="product-grid">
          {images.map((image, index) => (
            <div key={index} className="product-card">
              <img src={image} alt={`Product ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
