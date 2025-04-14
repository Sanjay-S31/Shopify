import React, { useEffect, useState, useRef, useCallback } from "react"
import { useAuthContext } from "../hooks/useAuthContext"
import { useProductsContext } from "../hooks/useProductsContext"
import { FaSearch, FaCamera, FaFilter, FaSpinner } from 'react-icons/fa'
import { useNavigate } from "react-router-dom"
import Webcam from "react-webcam"
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import AllProducts from "../components/AllProducts"
import './style_pages/product.css'

export default function Products() {
    const { products, dispatch } = useProductsContext()
    const { user } = useAuthContext()

    const navigate = useNavigate()

    const [searchInput, setSearchInput] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [showWebcam, setShowWebcam] = useState(false)
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [priceRange, setPriceRange] = useState([0, 300000])
    const [sortOrder, setSortOrder] = useState('')

    // New state for loading
    const [isLoading, setIsLoading] = useState(true)

    const webcamRef = useRef(null)

    const performSearch = useCallback(async () => {
        if (!user) {
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch('/api/products/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    searchInput,
                    category: selectedCategory,
                    minPrice: priceRange[0],
                    maxPrice: priceRange[1],
                    sortOrder
                })
            })

            const result = await response.json()
            if (response.ok) {
                dispatch({ 
                    type: 'SET_PRODUCTS', 
                    payload: result.products 
                })
            } 
            else {
                console.error("Error in search:", result)
            }
        } 
        catch (error) {
            console.error("Search error:", error)
        }
        finally {
            setIsLoading(false)
        }
    }, [user, searchInput, selectedCategory, priceRange, sortOrder, dispatch])

    // Trigger search when category changes or on component mount
    useEffect(() => {
        performSearch()
    }, [performSearch])

    const handleSearch = (event) => {
        event.preventDefault()
        performSearch()
    }

    const captureImage = async () => {
        const imageSrc = webcamRef.current.getScreenshot()
        if (!imageSrc) return

        try {
            const response = await fetch('http://localhost:5000/image_search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ image: imageSrc })
            })

            const result = await response.json()
            if (response.ok) {
                alert('Image uploaded successfully!')
                setShowWebcam(false)

                const mainCategory = result.result;
                const classNames = result.predictions.map(pred => pred.class_name);
                const searchTerms = [...classNames, mainCategory].join(', ');

                const res = await fetch('/api/products/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({
                        searchInput : searchTerms,
                        category: selectedCategory,
                        minPrice: priceRange[0],
                        maxPrice: priceRange[1],
                        sortOrder
                    })
                })
    
                const searchResult = await res.json()
                if (res.ok) {
                    dispatch({ 
                        type: 'SET_PRODUCTS', 
                        payload: searchResult.products 
                    })
                } 
                else {
                    console.error("Error in search:", searchResult)
                }
            } else {
                console.error('Failed to upload image:', result.message)
            }
        } catch (error) {
            console.error('Error uploading image:', error)
        }
    }

    const toggleFilterDropdown = () => {
        setShowFilterDropdown(prev => !prev)
    }

    const handlePriceRangeChange = (value) => {
        setPriceRange(value)
    }

    const handleSortOrderChange = (order) => {
        setSortOrder(order)
        setShowFilterDropdown(false)
    }

    const clearSearch = () => {
        setSearchInput('')
        setSelectedCategory('')
        setPriceRange([200, 300000])
        setSortOrder('')
        performSearch()
    }

    return (
        <div className="productpage">
            <h1 style={{ textAlign: "center" }}>Our Products</h1>
            
            <div className="search-bar">
                <div className="category-filter-container">
                    <select 
                        className="category-dropdown"
                        value={selectedCategory}
                        onChange={(event) => setSelectedCategory(event.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="Mobile">Mobiles</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Earphones">Earphones</option>
                    </select>
                    
                    <div className="filter-icon-container">
                        <FaFilter 
                            className="filter-icon" 
                            onClick={toggleFilterDropdown} 
                        />
                        {showFilterDropdown && (
                            <div className="filter-dropdown">
                                <div className="filter-section">
                                    <h4>Sort Price</h4>
                                    <button 
                                        onClick={() => handleSortOrderChange('low-to-high')}
                                        className={sortOrder === 'low-to-high' ? 'active' : ''}
                                    >
                                        Low to High
                                    </button>
                                    <button 
                                        onClick={() => handleSortOrderChange('high-to-low')}
                                        className={sortOrder === 'high-to-low' ? 'active' : ''}
                                    >
                                        High to Low
                                    </button>
                                </div>
                                <div className="filter-section">
                                    <h4>Price Range</h4>
                                    <div className="price-range-slider">
                                        <Slider
                                            range
                                            min={200}
                                            max={300000}
                                            value={priceRange}
                                            onChange={handlePriceRangeChange}
                                        />
                                        <div className="price-range-labels">
                                            <span>₹{priceRange[0]}</span>
                                            <span>₹{priceRange[1]}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <input 
                    className="search-bar-input" 
                    type="text"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                />
                
                <FaSearch className="search-icon" onClick={handleSearch} />
                <FaCamera className="camera-icon" onClick={() => setShowWebcam(prev => !prev)} />
                <button className="clear-btn" onClick={clearSearch}>Clear</button>
            </div>

            {/* Webcam Component */}
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
                        <button onClick={() => setShowWebcam(false)} className="close-webcam-btn">Close</button>
                    </div>
                </div>
            )}

            <div className="productpage-products">
                {isLoading ? (
                    <div className="products-page-products-loading">
                        <FaSpinner className="products-page-loading-spinner" />
                        <p>Loading products...</p>
                    </div>
                ) : products && products.length > 0 ? (
                    products.map((item) => (
                        <div key={item._id} onClick={() => navigate('/product/' + item._id)}>
                            <AllProducts key={item._id} product={item} />
                        </div>
                    ))
                ) : (
                    <div className="products-page-no-products">
                        <p>No products found.</p>
                    </div>
                )}
            </div>

        </div>
    )
}