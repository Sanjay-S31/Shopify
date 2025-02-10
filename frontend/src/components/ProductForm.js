import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import { useProductsContext } from '../hooks/useProductsContext'
import './style_components/addForm.css'

const ProductForm = () => {

    const [productName , setProductName] = useState('')
    const [productType , setProductType] = useState('')
    const [description , setDescription] = useState('')
    const [cost , setCost] = useState('')
    const [quantity , setQuantity] = useState('')
    const [tags , setTags] = useState('')
    const [productImage, setProductImage] = useState('')

    const [error,setError] = useState(null)
    const [isLoading, setIsLoading] = useState()
    const [emptyFields , setEmptyFields] = useState([])

    const { user } = useAuthContext()
    const { dispatch } = useProductsContext()

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

    const handleSubmit = async (event) => {
        event.preventDefault()

        //console.log(productName, productType, description, cost, quantity, tags)
        if(!user){
            setError("You must be logged in")
            return
        }

        setIsLoading(true)
        
        const product = {productName,productType,description,cost,quantity,tags,productImage}
        const response = await fetch('/api/products' , {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${user.token}`
            },
            body : JSON.stringify(product)
        })

        const jsonData = await response.json()

        if(!response.ok){
            setIsLoading(false)
            setError(jsonData.error)
            setEmptyFields(jsonData.emptyFields)
        }

        if(response.ok){
            setProductImage('')
            setIsLoading(false)
            setError(null)
            setCost('')
            setQuantity('')
            setProductName('')
            setProductType('')
            setDescription('')
            setTags('')
            setEmptyFields([])

            dispatch({type: 'CREATE_PRODUCT' ,payload: jsonData})

            console.log("New product added")
            console.log(emptyFields)
        }
    }

    return (
        <div className="product-add-form">
            <form onSubmit={handleSubmit}> 
                <h2>Add Products</h2>
                <label>Product Name : </label>
                <input
                    type="text"
                    value={productName}
                    onChange={(event) => setProductName(event.target.value)}
                    className={emptyFields.includes('productName') ? 'error' : ''}
                />
                <br/>
                <label>Product Type : </label>
                <input
                    type="text"
                    value={productType}
                    onChange={(event) => setProductType(event.target.value)}
                    className={emptyFields.includes('productType') ? 'error' : ''}
                />
                <br/>
                <label>Description : </label>
                <textarea
                    type="text"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className={emptyFields.includes('description') ? 'error' : ''}
                />
                <br/>
                <label>Cost : </label>
                <input
                    type="number"
                    value={cost}
                    onChange={(event) => setCost(event.target.value)}
                    className={emptyFields.includes('cost') ? 'error' : ''}
                />
                <br/>
                <label>Quantity : </label>
                <input
                    type="number"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className={emptyFields.includes('quantity') ? 'error' : ''}
                />
                <br/>
                <label>Tags : </label>
                <input
                    type="text"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    className={emptyFields.includes('tags') ? 'error' : ''}
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
                <button disabled={isLoading}>Submit</button>
                {error && <div className='error' >{error}</div>}
            </form>
        </div>
    )
}

export default ProductForm