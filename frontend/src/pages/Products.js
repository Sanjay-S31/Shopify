import { useEffect, useState, useRef } from "react"
import { useAuthContext } from "../hooks/useAuthContext"
import { useProductsContext } from "../hooks/useProductsContext"
import { FaSearch, FaCamera } from 'react-icons/fa'
import { useNavigate } from "react-router-dom"
import Webcam from "react-webcam"

import AllProducts from "../components/AllProducts"
import './style_pages/product.css'

export default function Products() {
    const { products, dispatch } = useProductsContext()
    const { user } = useAuthContext()

    const navigate = useNavigate()

    const [searchInput, setSearchInput] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [showWebcam, setShowWebcam] = useState(false)

    const webcamRef = useRef(null);

    useEffect(() => {
        async function fetchProducts() {
            const response = await fetch('/api/products/all', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })

            const jsonData = await response.json()
            if (response.ok) {
                dispatch({ type: 'SET_PRODUCTS', payload: jsonData })
            }
        }

        if (user) {
            fetchProducts()
        }
    }, [dispatch, user])

    const handleSearch = async (event) => {
        event.preventDefault()

        const response = await fetch('/api/products/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ searchInput, category: selectedCategory })
        })

        const result = await response.json()
        if (response.ok) {
            dispatch({ type: 'SET_PRODUCTS', payload: result })
        }

        if (!response) {
            console.log("Error occurred in getting the product")
        }
    }

    const handleCategoryChange = async (event) => {
        const category = event.target.value;
        setSelectedCategory(category);

        if (category === '') {
            return;
        }

        const response = await fetch('/api/products/category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ category })
        });

        const result = await response.json();
        if (response.ok) {
            dispatch({ type: 'SET_PRODUCTS', payload: result });
        } else {
            console.log("Error occurred while fetching products by category");
        }
    };

    const captureImage = async () => {
        const imageSrc = webcamRef.current.getScreenshot();  // get base64 image
        if (!imageSrc) return;
    
        try {
            const response = await fetch('http://localhost:5000/image_search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ image: imageSrc })
            });
    
            const result = await response.json();
            console.log("Server Response:", result); // Log the result to the console

            if (response.ok) {
                alert('Image uploaded successfully!');
                setShowWebcam(false);
            } else {
                console.error('Failed to upload image:', result.message);
            }

        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const clearSearch = () => {
        setSearchInput('')
        setSelectedCategory('')
    }

    const toggleWebcam = () => {
        setShowWebcam(prev => !prev)
    }

    return (
        <div className="productpage">
            <h1 style={{ textAlign: "center" }}>Our Products</h1>
            <div className="search-bar">
                <select 
                    className="category-dropdown"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                >
                    <option value="">Categories</option>
                    <option value="Mobile">Mobiles</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Earphones">Earphones</option>
                </select>
                <input 
                    className="search-bar-input" 
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                />
                <FaSearch className="search-icon" onClick={handleSearch} />
                <FaCamera className="camera-icon" onClick={toggleWebcam} />
                <button className="clear-btn" onClick={clearSearch}>Clear</button>
            </div>

            {showWebcam && (
                <div className="webcam-container">
                    <Webcam
                        audio={false}
                        height={300}
                        screenshotFormat="image/jpeg"
                        width={400} 
                        ref={webcamRef}
                        videoConstraints={{ facingMode: "user" }}
                    />
                    <div className="webcam-buttons">
                        <button onClick={captureImage} className="capture-btn">Capture</button>
                        <button onClick={toggleWebcam} className="close-webcam-btn">Close</button>
                    </div>
                </div>
            )}

            <div className="productpage-products">
                {products && products.map((item) => (
                    <div key={item._id} onClick={() => navigate('/product/' + item._id)}>
                        <AllProducts key={item._id} product={item} />
                    </div>
                ))}
            </div>
        </div>
    )
}
