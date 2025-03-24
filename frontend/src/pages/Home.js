import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import "./style_pages/home.css";
import { FaChevronLeft, FaChevronRight, FaRobot } from "react-icons/fa";
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
    const [showChatbot, setShowChatbot] = useState(false);
    // New states for chatbot functionality
    const [messages, setMessages] = useState([
        { text: "How can I assist you with your shopping today?", sender: "bot" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom of messages when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 3000);
        return () => clearInterval(interval);
    }, [currentIndex]);

    // Your existing useEffects for products...
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
            console.log("hiiiiiiiii")
            try {
                const res = await fetch("/api/user/recommendation", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                console.log(res)
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

    const handleChatbotClick = () => {
        setShowChatbot(!showChatbot);
    };

    // New function to handle input changes
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    // New function to handle sending messages
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
    
        // Add user message to chat
        console.log(inputValue);
        const userMessage = { text: inputValue, sender: "user" };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
    
        // Clear input and set loading state
        const userQuery = inputValue;
        setInputValue("");
        setIsLoading(true);
    
        try {
            // Ensure the URL for the Flask backend is correct
            const response = await fetch("http://localhost:5000/chatbotresponse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: user?.token ? `Bearer ${user.token}` : "",
                },
                body: JSON.stringify({
                    query: userQuery,
                }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to get chatbot response");
            }
    
            const data = await response.json();
            console.log(data)
            // Assuming the response has a 'response' field (check your Flask backend for the exact structure)
            let botResponseText = data.recommend.abcd || "No response from the bot.";
    
            // Add bot response to messages
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: botResponseText, sender: "bot" },
            ]);
        } catch (error) {
            console.error("Error getting chatbot response:", error);
    
            // Add a fallback message for error
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    text: "Sorry, I'm having trouble connecting to my backend. Please try again later.",
                    sender: "bot",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
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

            {/* Chatbot Button */}
            <button className="chatbot-btn" onClick={handleChatbotClick}>
                <FaRobot />
            </button>

            {/* Enhanced Chatbot Interface */}
            {showChatbot && (
                <div className="chatbot-interface">
                    <div className="chatbot-header">
                        <h3>Shopping Assistant</h3>
                        <button onClick={handleChatbotClick}>X</button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((message, index) => (
                            <div 
                                key={index} 
                                className={`message ${message.sender === "user" ? "user-message" : "bot-message"}`}
                            >
                                {message.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot-message loading-message">
                                <span className="loading-dot"></span>
                                <span className="loading-dot"></span>
                                <span className="loading-dot"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chatbot-input" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="Type your message here..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "..." : "Send"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}