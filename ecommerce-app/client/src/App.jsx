import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import ProductsList from "./ProductsList";
import ProductSearch from "./ProductSearch";/** */
import ProductDetails from "./ProductDetails";
import CartPage from "./CartPage";
import AdminPage from "./AdminPage";
import CheckoutPage from "./CheckoutPage";
import Login from "./Login";
import { ProductProvider } from "./ProductContext"; 

function App() {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
    <ProductProvider>
      <div>
        <header className="header">
          <div className="header-left">
            <h1 className="logo">
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              My E-Commerce
            </Link>
          </h1>
          </div>
          
          <div className="header-center">
            <ProductSearch />

          </div>
          <nav className="header-right">
            <Link to="/login">Login</Link>
            <Link to="/admin">Admin</Link>
            <Link to="/cart">Cart ({cart.length})</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<ProductsList />} />
          <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage cart={cart} removeFromCart={removeFromCart} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} clearCart={clearCart} />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>

        <hr />
        <footer style={{ marginTop: 20 }}>
          <small>Demo app - products, users, and orders persisted in MongoDB</small>
        </footer>
      </div>
    </ProductProvider>
  );
}

export default App;