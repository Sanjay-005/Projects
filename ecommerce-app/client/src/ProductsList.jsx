import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  // ✅ Fetch categories from backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/products/categories")
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  // ✅ Fetch products with filters/sort
  const fetchProducts = () => {
    const params = {};
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sort) params.sort = sort;

    axios.get("http://localhost:5000/api/products", { params })
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  };

  // ✅ Fetch all products on mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <h2>Products</h2>
      <div className="filters-container">
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
        />
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">Sort By</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A-Z</option>
          <option value="name_desc">Name: Z-A</option>
        </select>
        <button className="apply-btn" onClick={fetchProducts}>Apply</button>
      </div>

      <div className="products-grid">
        {products.map(product => {
          // ✅ Choose which image to display
          const productImage =
            product.image ||
            (product.images && product.images.length > 0 ? product.images[0] : "/placeholder.png");

          return (
              <Link key={product._id} to={`/product/${product._id}`} className="product-card">
                <img src={productImage} alt={product.name}
                />
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
