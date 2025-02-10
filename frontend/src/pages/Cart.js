import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { FaRupeeSign } from 'react-icons/fa'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useNavigate } from 'react-router-dom'
import './style_pages/cart.css'

export default function Cart() {
    const { user } = useAuthContext()
    const [cartProduct, setCartProduct] = useState([])
    const [total,setTotal] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        async function displayAll(){
            try {
                const response = await fetch("/api/cart", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${user.token}`,
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    calculateTotal(data)
                    setCartProduct(data)
                } 
                else {
                    console.log("Failed to fetch cart items")
                }
            } 
            catch (error) {
                console.error("Fetch cart items error:", error);
            }
        }

        displayAll()
    }, [user.token , total])

    //console.log(cartProduct)

    const calculateTotal = (products) => {
        const totalCost = products.reduce((acc, product) => acc + product.cost, 0);
        setTotal(totalCost);
    };

    const handleRemove = async (id) => {
    
        try {
            const response = await fetch('/api/cart/remove/' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (response.ok) {
                const updatedCart = cartProduct.filter(item => item._id !== id);
                setCartProduct(updatedCart)
                calculateTotal(updatedCart)
            } else {
                console.log("Error occurred during the purchase")
            }
        } catch (error) {
            console.error("Purchase error:", error);
        }
    }

    const showSwal = () => {
        withReactContent(Swal).fire({
            icon: 'success',
            title: 'Thank You!',
            text: 'Your order has been placed successfully. We appreciate your purchase!',
            confirmButtonText: 'Continue Shopping'
        }).then((result) => {
            if (result.isConfirmed) {
                removeCart()
                navigate('/')
            }
        })
    }

    const removeCart = async () => {
        const response = await fetch('/api/cart/remove' , {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        if(response.ok){
            console.log("Removed successfully")
        }
        else{
            console.log("Error occured")
        }
    }

    return (
        <div className="cart-page">
            {cartProduct && cartProduct.map(item => (
                <div key={item._id} className="cart-items">
                    <div className="cart-item-info">
                        <h1>{item.productName}</h1>
                        <h3>Cost : <FaRupeeSign/>{item.cost}</h3>
                    </div>
                    <button className="cart-remove-button" onClick={() => handleRemove(item._id)} >Remove</button>
                </div>
            ))}
            <div className="checkout-container">
                <h3 className="total-amount">Total Amount : <FaRupeeSign/>{total}</h3>
                <button className="checkout-button" onClick={showSwal}>Checkout</button>
            </div>
        </div>
    );
}
