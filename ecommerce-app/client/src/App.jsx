import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import ProductsList from "./ProductsList";
import ProductDetails from "./ProductDetails";
import CartPage from "./CartPage.jsx";

function App(){
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);

const [cart, setCart] = useState(() => {
  try {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});


  useEffect(() => {
    setLoadingProducts(true);
    axios.get("http://localhost:5000/api/products")
      .then((response) => {
        setProducts(response.data);
        setProductsError(null);

        })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setProductsError("Failed to load products. Try again later.");
      })
      .finally(() => setLoadingProducts(false));

  }, []);

  useEffect(() => {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (err) {
    console.warn("Could not save cart to localStorage", err);
  }
}, [cart]);


  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (indexToRemove) => {
    setCart((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };



return (
    <div style={{ padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>
          <Link to="/">My E-Commerce</Link>
        </h1>
        <nav>
          <Link to="/cart">Cart ({cart.length})</Link>
        </nav>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <ProductsList products={products} loading={loadingProducts} error={productsError} />
          }
        />
        <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
        <Route path="/cart" element={<CartPage cart={cart} removeFromCart={removeFromCart} />} />
      </Routes>

      <hr />
      <footer style={{ marginTop: 20 }}>
        <small>Tip: open dev console to see network requests</small>
      </footer>
    </div>
  );
}

export default App;