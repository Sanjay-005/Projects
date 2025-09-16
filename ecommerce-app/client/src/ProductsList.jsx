import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  // Temporary filter inputs
  const [tempMinPrice, setTempMinPrice] = useState("");
  const [tempMaxPrice, setTempMaxPrice] = useState("");
  const [tempSort, setTempSort] = useState("");

  // Actual applied filters
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Fetch categories
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  // ✅ Fetch products
  const fetchProducts = () => {
    const params = {};

    if (category) params.category = category;
    if (minPrice !== "") params.minPrice = minPrice;
    if (maxPrice !== "") params.maxPrice = maxPrice;
    if (sort) params.sort = sort;

    axios
      .get("http://localhost:5000/api/products", { params })
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([]);
      });
  };

  // ✅ Refetch when category/min/max/sort changes
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [category, minPrice, maxPrice, sort]);

  // ✅ Apply filters manually
  const applyFilters = () => {
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setSort(tempSort);
  };

  return (
    <div>
      <div className="filters-container">
        {/* Sidebar Trigger */}
        <button
          className="categories-btn"
          onClick={() => setSidebarOpen(true)}
        >
          All
        </button>

        {/* Other filters */}
        <input
          type="number"
          placeholder="Min Price"
          value={tempMinPrice}
          onChange={(e) => setTempMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={tempMaxPrice}
          onChange={(e) => setTempMaxPrice(e.target.value)}
        />
        <select
          value={tempSort}
          onChange={(e) => setTempSort(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A-Z</option>
          <option value="name_desc">Name: Z-A</option>
        </select>

        {/* Apply button */}
        <button className="apply-btn" onClick={applyFilters}>
          Apply Filters
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>Categories</h3>
          <button
            className="close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="sidebar-items">
          <div
            className="sidebar-item"
            onClick={() => {
              setCategory("");
              setSidebarOpen(false);
            }}
          >
            All
          </div>
          {categories.map((cat) => (
            <div
              key={cat}
              className="sidebar-item"
              onClick={() => {
                setCategory(cat);
                setSidebarOpen(false);
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {products.map((product) => {
          const productImage =
            product.image ||
            (product.images && product.images.length > 0
              ? product.images[0]
              : "/placeholder.png");

          return (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
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
