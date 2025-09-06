import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./ProductDetails.css"; // ✅ add CSS for zoom

function ProductDetails({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setMainImage(res.data.images?.[0] || res.data.image || null);
        setError(null);
      })
      .catch(() => setError("Product not found or failed to load."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading product...</div>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;
  if (!product) return <h2>Product not found</h2>;

  return (
    <div className="product-details-container">
      <div className="image-section">
        {mainImage && (
          <div className="image-zoom-container">
            <img src={mainImage} alt={product.name} className="main-image" />
          </div>
        )}

        {/* Thumbnails */}
        <div className="thumbnail-list">
          {(product.images && product.images.length > 0
            ? product.images
            : [product.image]
          ).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              onClick={() => setMainImage(img)}
              className={mainImage === img ? "active" : ""}
            />
          ))}
        </div>
      </div>

      <div className="details-section">
        <h2>{product.name}</h2>
        <p className="price">Price: ₹{product.price}</p>
        <button className="add-to-cart-btn" onClick={() => addToCart(product)}>Add to Cart</button>
      </div>
    </div>
  );
}

export default ProductDetails;