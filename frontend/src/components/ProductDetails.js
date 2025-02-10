import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useState } from 'react'

import { useProductsContext } from '../hooks/useProductsContext'
import { useAuthContext } from '../hooks/useAuthContext'
import './style_components/productDetails.css'


const ProductDetails = ({ product }) => {
    const [productName , setProductName] = useState(product.productName)
    const [productType , setProductType] = useState(product.productType)
    const [description , setDescription] = useState(product.description)
    const [cost , setCost] = useState(product.cost)
    const [quantity , setQuantity] = useState(product.quantity)
    const [tags , setTags] = useState(product.tags)
    const [productImage, setProductImage] = useState(product.productImage)

    const [modal, setModal] = useState(false);

    const {dispatch} = useProductsContext()
    const {user} = useAuthContext()

    const toggleModal = () => {
        setModal(!modal);
    }

    if(modal) {
        document.body.classList.add('active-modal')
    } else {
        document.body.classList.remove('active-modal')
    }

    const imageToBase64 = (file) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        const data = new Promise((resolve,reject) => {
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error) 
        })
        return data
    }

    const handleUploadImage = async (event) => {
        const file = event.target.files[0]
        const image = await imageToBase64(file)
        setProductImage(image)
    }

    const handleDelete = async () => {

        if(!user){
            return
        }

        const response = await fetch('api/products/'+product._id , {
            method : 'delete',
            headers : {
                'Authorization' : `Bearer ${user.token}`
            }
        })

        const jsonData = await response.json()

        if(response.ok){
            dispatch({type: 'DELETE_PRODUCT', payload: jsonData})
        }
    }

    const handleUpdate = async () => {
        if(!user){
            return
        }

        const updatedProduct = {
            productName,
            productType,
            description,
            cost,
            quantity,
            tags,
            productImage
        }

        console.log(updatedProduct)

        const response = await fetch('api/products/'+product._id , {
            method : 'put',
            headers : {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${user.token}`
            },
            body: JSON.stringify(updatedProduct)
        })

        const jsonData = await response.json()
        console.log(jsonData)

        if(response.ok){
            dispatch({type: 'UPDATE_PRODUCT', payload: jsonData})
        }
    }   


    return (
        <div className='product-details'>
            <h4>{product.productName}</h4>
            <p><strong>Type : </strong>{product.productType}</p>
            <p><strong>Description : </strong>{product.description}</p>
            <p><strong>Cost : </strong>{product.cost}</p>
            <p><strong>Quantity : </strong>{product.quantity}</p>
            <p><strong>Tags : </strong>{product.tags}</p>
            <img src={product.productImage} alt={product.productName} height={200} width={200}/>
            <p>{formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}</p>
            <div className="btn-modal">
                <button className="product-delete-button" onClick={handleDelete}>Delete</button>
                <button className="product-update-button" onClick={toggleModal} >Update</button>
            </div>
            {
                modal && (
                    <div className='modal'>
                        <div onClick={toggleModal} className='overlay'></div>
                        <div className='modal-content'>
                            <h2>Update Product</h2>
                            <form onSubmit={handleUpdate} >
                                <label>Product Name : </label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(event) => setProductName(event.target.value)}
                                />
                                <br/>
                                <label>Product Type : </label>
                                <input
                                    type="text"
                                    value={productType}
                                    onChange={(event) => setProductType(event.target.value)}
                                />
                                <br/>
                                <label className="desc">Description : </label>
                                <textarea
                                    type="text"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                />
                                <br/>
                                <label>Cost : </label>
                                <input
                                    type="number"
                                    value={cost}
                                    onChange={(event) => setCost(event.target.value)}
                                />
                                <br/>
                                <label>Quantity : </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(event) => setQuantity(event.target.value)}
                                />
                                <br/>
                                <label>Tags : </label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(event) => setTags(event.target.value)}
                                />
                                <br/>
                                <label>Image Upload : </label>
                                <input
                                    type='file'
                                    accept='image/*'
                                    onChange = {handleUploadImage}
                                />
                                <br/>
                                {productImage && <img src={productImage} alt='product' width={200} height={200}/>}
                                <br/>
                                <button>Submit</button>
                            </form>
                            <button onClick={toggleModal} className='close-modal'>X</button>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default ProductDetails