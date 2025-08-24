import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import ProductsList from "./ProductsList";
import ProductDetails from "./ProductDetails";
import CartPage from "./CartPage";
import AdminPage from "./AdminPage";
import CheckoutPage from "./CheckoutPage";

function App() {
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
    axios
      .get("http://localhost:5000/api/products")
      .then((response) => {
        setProducts(response.data);
        setProductsError(null);
      })
      .catch(() => setProductsError("Failed to load products. Try again later."))
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addToCart = (product) => setCart((prev) => [...prev, product]);
  const removeFromCart = (indexToRemove) =>
    setCart((prev) => prev.filter((_, idx) => idx !== indexToRemove));

  const clearCart = () => setCart([]);

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            My E-Commerce
          </Link>
        </h1>
        <nav style={{ display: "flex", gap: 16 }}>
          <Link to="/admin">Admin</Link>
          <Link to="/cart">Cart ({cart.length})</Link>
        </nav>
      </header>

      <Routes>
        <Route
          path="/"
          element={<ProductsList products={products} loading={loadingProducts} error={productsError} />}
        />
        <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
        <Route path="/cart" element={<CartPage cart={cart} removeFromCart={removeFromCart} />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} clearCart={clearCart} />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>

      <hr />
      <footer style={{ marginTop: 20 }}>
        <small>Demo app — products persisted to JSON file on the server</small>
      </footer>
    </div>
  );
}

export default App;
