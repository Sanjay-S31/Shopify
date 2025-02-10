import { useEffect } from "react"
import { useAuthContext } from "../hooks/useAuthContext"
import { useProductsContext } from "../hooks/useProductsContext"

import ProductDetails from "../components/ProductDetails"
import ProductForm from '../components/ProductForm'

export default function ArtisanUpload(){

    const { products, dispatch } = useProductsContext()
    const { user}  = useAuthContext()

    useEffect(() => {

        async function fetchProducts(){
            const response = await fetch('/api/products' , {
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

    return (
        <div className="artisan-homepage">
            <h2>Welcome back , {user.username}</h2>
            <div className="artisan-page">
                <div className="products">
                    {products && products.map((item) => (
                        <ProductDetails
                            key = {item._id}
                            product = {item}
                        />
                    ))}
                </div>
                <ProductForm/>
            </div>
        </div>
    )
}