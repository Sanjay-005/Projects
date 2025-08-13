import { Link } from "react-router-dom";

function ProductsList({ products, loading, error }){
    if(loading) return <div>Loading products...</div>;
    if(error) return <div style={{ color: "red" }}>{error}</div>
    if(!products || products.length === 0) return <div>No products available!</div>

    return (
        <div>
            <h2>Our Products</h2>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <Link to={`/product/${product.id}`}>
                          {product.name} - ₹{product.price}
                        </Link>

                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProductsList;