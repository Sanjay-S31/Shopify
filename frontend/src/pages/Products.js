import { useEffect, useState } from "react"
import { useAuthContext } from "../hooks/useAuthContext"
import { useProductsContext } from "../hooks/useProductsContext"
import { FaSearch } from 'react-icons/fa'
import { useNavigate } from "react-router-dom"

import AllProducts from "../components/AllProducts"
import './style_pages/product.css'


export default function Products(){

    const { products, dispatch } = useProductsContext()
    const { user }  = useAuthContext()
    const navigate = useNavigate()

    const [searchInput,setSearchInput] = useState('')

    useEffect(() => {

        async function fetchProducts(){
            const response = await fetch('/api/products/all' , {
                headers : {
                    'Authorization' : `Bearer ${user.token}`
                }
            })

            const jsonData = await response.json()

            if(response.ok){
                dispatch({type: 'SET_PRODUCTS', payload : jsonData})
            }
        }

        if(user){
            fetchProducts()
        }

    }, [dispatch,user])

    const handleSearch = async (event) => {
        event.preventDefault()

        const response = await fetch('/api/products/search', {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${user.token}`
            },
            body : JSON.stringify({searchInput})
        }) 

        const result = await response.json()

        if(response.ok){
            dispatch({type: 'SET_PRODUCTS', payload : result})
        }

        if(!response){
            console.log("Error occured in getting the product")
        }
    }
    const clearSearch = () => {
        setSearchInput('')
    }

    return (
        <div className="productpage">
            <h1 style={{textAlign:"center"}}>Our Products</h1>
            <div className="search-bar">
                <input className="search-bar-input" 
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                />
                <FaSearch className="search-icon" onClick={handleSearch}/>
                <button className="clear-btn" onClick={clearSearch}>Clear</button>
            </div>
            <div className="productpage-products">
                { products && products.map((item) => (
                    <div key={item._id} onClick={() => navigate('/product/'+item._id)}>
                        <AllProducts
                            key = {item._id}
                            product = {item}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}