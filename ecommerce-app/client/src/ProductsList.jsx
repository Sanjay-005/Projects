// import { Link } from "react-router-dom";
// import { useContext } from "react"; 
// import { ProductContext } from "./ProductContext"; 

// function ProductsList() {
//   const { products, loading, error } = useContext(ProductContext); 

//   if (loading) return <div>Loading products...</div>;
//   if (error) return <div style={{ color: "red" }}>{error}</div>;
//   if (!products || products.length === 0) return <div>No products available!</div>;

//   return (
//     <div>
//       <h2>Our Products</h2>
//       <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 16 }}>
//         {products.map((product) => (
//           <li key={product._id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
//             <Link to={`/product/${product._id}`} style={{ textDecoration: "none", color: "inherit" }}>
//               {product.image && (
//                 <img
//                   src={product.image}
//                   alt={product.name}
//                   style={{ width: 200, height: 250, objectFit: "cover", display: "block", marginBottom: 8 }}
//                 />
//               )}
//               <div style={{ fontWeight: 600 }}>{product.name}</div>
//               <div>₹{product.price}</div>
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default ProductsList;


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

  // Fetch categories for dropdown
  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then(res => {
        const cats = Array.from(new Set(res.data.map(p => p.category))).filter(Boolean);
        setCategories(cats);
      });
  }, []);

  // Fetch products with filters/sort
  const fetchProducts = () => {
    const params = {};
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sort) params.sort = sort;
    axios.get("http://localhost:5000/api/products", { params })
      .then(res => setProducts(res.data));
  };

  // Fetch all products on mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <h2>Products</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
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
        <button onClick={fetchProducts}>Apply</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {products.map(product => (
          <div key={product._id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <Link to={`/product/${product._id}`} style={{ textDecoration: "none", color: "inherit" }}>
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 4 }}
                />
              )}
              <div style={{ fontWeight: 600, margin: "8px 0" }}>{product.name}</div>
              <div>₹{product.price}</div>
              <div style={{ color: "#888" }}>{product.category}</div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}