import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function ProductDetails({ addToCart }) {
    const { id } = useParams();//useParams() returns object and variable id stores the id as a string from the returned object!
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:5000/api/products/${id}`)
          .then((res) => {
            setProduct(res.data);
            setError(null);
          })
          .catch((err) => {
            console.error("Failed to load product:", err);
            setError("Product not found or failed to load.");

          })
          .finally(() => setLoading(false));
    }, [id]); //Runs whenever id changes (including first render).

    if(loading) return <div>Loading product...</div>;

    if(error) return <h2 style={{ color: "red" }}>{error}</h2>;

    if(!product) return <h2>Product not found</h2>;

    return (
        <div>
            <h2>{product.name}</h2>
            {product.image && (
              <img 
                src={product.image}
                alt={product.name}
                style={{ width: 300, height: 350, objectFit: "cover", display: "block", marginBottom: 12 }}
              
              
              />
            )}
            <p>Price: ₹{product.price}</p>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
        </div>
    );



}

export default ProductDetails;