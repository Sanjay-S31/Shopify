const AllProducts = ({ product }) => {
    return (
        <div className='product-card'>
            <div className="product-image-wrapper">
                {product.productImage && (
                    <img src={product.productImage} alt={product.productName} />
                )}
            </div>
            <h4 className="product-name">{product.productName}</h4>
            <p className="product-cost"><strong>Cost:</strong> ₹{product.cost}</p>
        </div>
    );
};

export default AllProducts;
