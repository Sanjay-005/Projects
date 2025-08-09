import { Link } from "react-router-dom";

function ProductsList({products}){
    return (
        <div>
            <h1>Our Products</h1>
            <ul>
                {products.map(product => (
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