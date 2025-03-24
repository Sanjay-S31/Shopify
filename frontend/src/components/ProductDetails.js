import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { useState, useEffect } from 'react';

import { useProductsContext } from '../hooks/useProductsContext';
import { useAuthContext } from '../hooks/useAuthContext';
import './style_components/productDetails.css';

const ProductDetails = ({ product }) => {
    const [productName, setProductName] = useState(product.productName);
    const [productType, setProductType] = useState(product.productType);
    const [description, setDescription] = useState(product.description);
    const [cost, setCost] = useState(product.cost);
    const [quantity, setQuantity] = useState(product.quantity);
    const [tags, setTags] = useState(product.tags);
    const [productImage, setProductImage] = useState(product.productImage);

    const [modal, setModal] = useState(false);

    const { dispatch } = useProductsContext();
    const { user } = useAuthContext();

    const toggleModal = () => setModal(!modal);

    // Effect to manage body class for modal
    useEffect(() => {
        if (modal) {
            document.body.classList.add('active-modal');
        } else {
            document.body.classList.remove('active-modal');
        }
        
        // Cleanup function to ensure we remove the class when component unmounts
        return () => {
            document.body.classList.remove('active-modal');
        };
    }, [modal]);

    const imageToBase64 = (file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleUploadImage = async (event) => {
        const file = event.target.files[0];
        const image = await imageToBase64(file);
        setProductImage(image);
    };

    const handleDelete = async () => {
        if (!user) return;

        const response = await fetch('api/products/' + product._id, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user.token}` }
        });

        const jsonData = await response.json();

        if (response.ok) {
            dispatch({ type: 'DELETE_PRODUCT', payload: jsonData });
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!user) return;

        const updatedProduct = {
            productName,
            productType,
            description,
            cost,
            quantity,
            tags,
            productImage
        };

        const response = await fetch('api/products/' + product._id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify(updatedProduct)
        });

        const jsonData = await response.json();

        if (response.ok) {
            dispatch({ type: 'UPDATE_PRODUCT', payload: jsonData });
            toggleModal();
        }
    };

    return (
        <>
            <div className='product-details'>
                <h4>{product.productName}</h4>
                <p><strong>Type:</strong> {product.productType}</p>

                <div className='product-description-container'>
                    <p><strong>Description:</strong></p>
                    <span className="full-description">
                        {description.length > 30
                            ? description.slice(0, 30) + '...' 
                            : description
                        }
                    </span>
                </div>

                <p><strong>Cost:</strong> ₹{product.cost}</p>
                <p><strong>Quantity:</strong> {product.quantity}</p>
                <p><strong>Tags:</strong> {product.tags}</p>
                <img src={product.productImage} alt={product.productName} />
                <p className="date-text">{formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}</p>

                <div className="btn-modal">
                    <button className="product-delete-button" onClick={handleDelete}>Delete</button>
                    <button className="product-update-button" onClick={toggleModal}>Update</button>
                </div>
            </div>

            {/* Modal with updated form structure */}
            {modal && (
                <div className='update-modal'>
                    <div onClick={toggleModal} className='update-overlay'></div>
                    <div className='update-modal-content'>
                        <h2>Update Product</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="update-form-group">
                                <label>Product Name:</label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                />
                            </div>
                            <div className="update-form-group">
                                <label>Product Type:</label>
                                <input
                                    type="text"
                                    value={productType}
                                    onChange={(e) => setProductType(e.target.value)}
                                />
                            </div>
                            <div className="update-form-group">
                                <label>Description:</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="update-form-group">
                                <label>Cost:</label>
                                <input
                                    type="number"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                />
                            </div>
                            <div className="update-form-group">
                                <label>Quantity:</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                            <div className="update-form-group">
                                <label>Tags:</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                />
                            </div>
                            <div className="update-form-group">
                                <label>Image Upload:</label>
                                <input
                                    type='file'
                                    accept='image/*'
                                    onChange={handleUploadImage}
                                />
                            </div>
                            {productImage && <img src={productImage} alt='product' />}
                            <button type="submit">Submit</button>
                        </form>
                        <button onClick={toggleModal} className='update-close-modal'>X</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductDetails;