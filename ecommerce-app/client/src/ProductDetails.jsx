// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import "./ProductDetails.css"; // ✅ add CSS for zoom

// function ProductDetails({ addToCart }) {
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [mainImage, setMainImage] = useState(null);

//   useEffect(() => {
//     setLoading(true);
//     axios
//       .get(`http://localhost:5000/api/products/${id}`)
//       .then((res) => {
//         setProduct(res.data);
//         setMainImage(res.data.images?.[0] || res.data.image || null);
//         setError(null);
//       })
//       .catch(() => setError("Product not found or failed to load."))
//       .finally(() => setLoading(false));
//   }, [id]);

//   if (loading) return <div>Loading product...</div>;
//   if (error) return <h2 style={{ color: "red" }}>{error}</h2>;
//   if (!product) return <h2>Product not found</h2>;

//   return (
//     <div className="product-details-container">
//       <div className="image-section">
//         {mainImage && (
//           <div className="image-zoom-container">
//             <img src={mainImage} alt={product.name} className="main-image" />
//           </div>
//         )}

//         {/* Thumbnails */}
//         <div className="thumbnail-list">
//           {(product.images && product.images.length > 0
//             ? product.images
//             : [product.image]
//           ).map((img, idx) => (
//             <img
//               key={idx}
//               src={img}
//               alt={`Thumbnail ${idx + 1}`}
//               onClick={() => setMainImage(img)}
//               className={mainImage === img ? "active" : ""}
//             />
//           ))}
//         </div>
//       </div>

//       <div className="details-section">
//         <h2>{product.name}</h2>
//         <p className="price">Price: ₹{product.price}</p>
//         <button className="add-to-cart-btn" onClick={() => addToCart(product)}>Add to Cart</button>
//       </div>
//     </div>
//   );
// }

// export default ProductDetails;



import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./ProductDetails.css";

function ProductDetails({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setMainImage(res.data.images?.[0] || res.data.image || null);
        setError(null);

        // fetch related products by category
        if (res.data.category) {
          axios
            .get("http://localhost:5000/api/products", {
              params: { category: res.data.category },
            })
            .then((resp) => {
              // exclude the current product
              const filtered = resp.data.filter((p) => p._id !== res.data._id);
              setRelatedProducts(filtered);
            })
            .catch(() => setRelatedProducts([]));
        }
      })
      .catch(() => setError("Product not found or failed to load."))
      .finally(() => setLoading(false));
  }, [id]);

  const nextSlide = () => {
    if (carouselIndex < relatedProducts.length - 3) {
      setCarouselIndex(carouselIndex + 1);
    }
  };

  const prevSlide = () => {
    if (carouselIndex > 0) {
      setCarouselIndex(carouselIndex - 1);
    }
  };

  if (loading) return <div>Loading product...</div>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;
  if (!product) return <h2>Product not found</h2>;

  return (
    <div>
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
          <button
            className="add-to-cart-btn"
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* === Related Products Carousel === */}
      {relatedProducts.length > 0 && (
        <div className="related-section">
          <h3>Related products</h3>
          <div className="carousel-container">
            <button
              className="carousel-btn left"
              onClick={prevSlide}
              disabled={carouselIndex === 0}
            >
              ◀
            </button>

            <div className="carousel-track">
              {relatedProducts
                .slice(carouselIndex, carouselIndex + 3)
                .map((rp) => {
                  const rpImage =
                    rp.image ||
                    (rp.images && rp.images.length > 0
                      ? rp.images[0]
                      : "/placeholder.png");
                  return (
                    <Link
                      key={rp._id}
                      to={`/product/${rp._id}`}
                      className="carousel-card"
                    >
                      <img src={rpImage} alt={rp.name} />
                      <div className="carousel-name">{rp.name}</div>
                      <div className="carousel-price">₹{rp.price}</div>
                    </Link>
                  );
                })}
            </div>

            <button
              className="carousel-btn right"
              onClick={nextSlide}
              disabled={carouselIndex >= relatedProducts.length - 3}
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
