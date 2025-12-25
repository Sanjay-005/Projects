import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import API from "./api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query = useQuery().get("q") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    API
      .get("/api/search", {
        params: { q: query },
      })
      .then((res) => {
        setProducts(res.data);
        setError(null);
      })
      .catch(() => {
        setError("Failed to fetch search results.");
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  return (
    <div>
      <h2>Search Results for "{query}"</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && products.length === 0 && <p>No products found.</p>}
      <div className="products-grid">
        {products.map((product) => {
          const productImage =
            product.image ||
            (product.images && product.images.length > 0
              ? product.images[0]
              : "/placeholder.png");
          return (
            <Link
              key={product._id || product.id}
              to={`/product/${product._id || product.id}`}
              className="product-card"
            >
              <img src={productImage} alt={product.name} />
              <div className="product-name">{product.name}</div>
              <div className="product-price">₹{product.price}</div>
              <div className="product-category">{product.category}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
