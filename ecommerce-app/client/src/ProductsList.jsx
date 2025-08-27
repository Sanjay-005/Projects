import { Link } from "react-router-dom";
import { useContext } from "react"; 
import { ProductContext } from "./ProductContext"; 

function ProductsList() {
  const { products, loading, error } = useContext(ProductContext); 

  if (loading) return <div>Loading products...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!products || products.length === 0) return <div>No products available!</div>;

  return (
    <div>
      <h2>Our Products</h2>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 16 }}>
        {products.map((product) => (
          <li key={product._id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <Link to={`/product/${product._id}`} style={{ textDecoration: "none", color: "inherit" }}>
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: 200, height: 250, objectFit: "cover", display: "block", marginBottom: 8 }}
                />
              )}
              <div style={{ fontWeight: 600 }}>{product.name}</div>
              <div>₹{product.price}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductsList;