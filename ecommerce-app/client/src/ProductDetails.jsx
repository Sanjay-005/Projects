import { useParams } from "react-router-dom";

function ProductDetails({products, addToCart}) {
    const { id } = useParams();//useParams() returns object and variable id stores the id as a string from the returned object!
    const product = products.find(p => p.id === parseInt(id));//returns the first product where the p.id equals the parsed id, if none match it will be undefined!!
    if(!product) return <h2>Product not found</h2>;

    return (
        <div>
            <h2>{product.name}</h2>
            <p>Price: ₹{product.price}</p>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
        </div>
    );




}

export default ProductDetails;