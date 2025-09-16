// import { useEffect, useState } from "react";
// import { Routes, Route, Link, useLocation } from "react-router-dom";
// import axios from "axios";
// import ProductsList from "./ProductsList";
// import ProductSearch from "./ProductSearch";
// import ProductDetails from "./ProductDetails";
// import CartPage from "./CartPage";
// import AdminPage from "./AdminPage";
// import CheckoutPage from "./CheckoutPage";
// import Login from "./Login";
// import { ProductProvider } from "./ProductContext";
// import SearchResults from "./SearchResults";

// function App() {
//   const [cart, setCart] = useState(() => {
//     try {
//       const saved = localStorage.getItem("cart");
//       return saved ? JSON.parse(saved) : [];
//     } catch {
//       return [];
//     }
//   });

//   const [role, setRole] = useState(() => localStorage.getItem("role") || "user");

//   const location = useLocation();

//   useEffect(() => {
//     try {
//       localStorage.setItem("cart", JSON.stringify(cart));
//     } catch {}
//   }, [cart]);

//   useEffect(() => {
//     setRole(localStorage.getItem("role") || "user");
//   }, [location]);

//   useEffect(() => {
//     const handleStorageChange = () => {
//       setRole(localStorage.getItem("role") || "user");
//     };
//     window.addEventListener("storage", handleStorageChange);
//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//     };
//   }, []);

//   const addToCart = (product) => setCart((prev) => [...prev, product]);
//   const removeFromCart = (indexToRemove) =>
//     setCart((prev) => prev.filter((_, idx) => idx !== indexToRemove));
//   const clearCart = () => setCart([]);

//   return (
//     <ProductProvider>
//       <div>
//         <header className="header">
//           <div className="header-left">
//             <h1 className="logo">
//               <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
//                 My E-Commerce
//               </Link>
//             </h1>
//           </div>

//           <div className="header-center">
//             <ProductSearch />
//           </div>

//           <nav className="header-right">
//             <Link to="/login">Login</Link>
//             {role === "admin" && <Link to="/admin">Admin</Link>}
//             <Link to="/cart" className="cart-link">
//               <div className="cart-icon-container">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                   strokeWidth={2}
//                   className="cart-icon"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-6-5a1 1 0 100 2 1 1 0 000-2zm-6 0a1 1 0 100 2 1 1 0 000-2z"
//                   />
//                 </svg>
//                 {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
//               </div>
//               Cart
//             </Link>
//           </nav>
//         </header>

//         <Routes>
//           <Route path="/" element={<ProductsList />} />
//           <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
//           <Route path="/cart" element={<CartPage cart={cart} removeFromCart={removeFromCart} />} />
//           <Route path="/checkout" element={<CheckoutPage cart={cart} clearCart={clearCart} />} />
//           <Route path="/admin" element={<AdminPage />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/search" element={<SearchResults />} />
//         </Routes>

//         <hr />
//         <footer className="footer">
//           <small>Orewa Luffy!!</small>
//         </footer>
//       </div>
//     </ProductProvider>
//   );
// }

// export default App;


import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import ProductsList from "./ProductsList";
import ProductSearch from "./ProductSearch";
import ProductDetails from "./ProductDetails";
import CartPage from "./CartPage";
import AdminPage from "./AdminPage";
import CheckoutPage from "./CheckoutPage";
import Login from "./Login";
import { ProductProvider } from "./ProductContext";
import SearchResults from "./SearchResults";
import About from "./About";
import Contact from "./Contact";
import Faq from "./Faq";

function App() {
  const [cart, setCart] = useState([]);
  const [role, setRole] = useState(() => localStorage.getItem("role") || "user");

  const location = useLocation();

  const loadCart = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const { data } = await axios.get("http://localhost:5000/api/users/cart", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart(data.cart || []);
      } catch (err) {
        console.error("Failed to load cart:", err);
      }
    } else {
      setCart([]);
    }
  };

  useEffect(() => {
    loadCart();
  }, [location]);

  useEffect(() => {
    setRole(localStorage.getItem("role") || "user");
  }, [location]);

  const saveCart = async (newCart) => {
    setCart(newCart);
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post("http://localhost:5000/api/users/cart", { cart: newCart }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to save cart:", err);
      }
    }
  };

  const addToCart = (product) => saveCart([...cart, product]);
  const removeFromCart = (indexToRemove) =>
    saveCart(cart.filter((_, idx) => idx !== indexToRemove));
  const clearCart = () => saveCart([]);

  return (
    <ProductProvider>
      <div class="app-container">
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
            {role === "admin" && <Link to="/admin">Admin</Link>}
            <Link to="/cart" className="cart-link">
              <div className="cart-icon-container">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="cart-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-6-5a1 1 0 100 2 1 1 0 000-2zm-6 0a1 1 0 100 2 1 1 0 000-2z"
                  />
                </svg>
                {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
              </div>
              Cart
            </Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<ProductsList />} />
          <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage cart={cart} removeFromCart={removeFromCart} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} clearCart={clearCart} />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />

        </Routes>

        <footer className="footer">
          <div className="footer-container">
            <div className="footer-section">
              <h4>About</h4>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Help</h4>
              <ul>
                <li><Link to="/faq">FAQ's</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Mail Us</h4>
              <p>
                My E-Commerce Pvt. Ltd.<br />
                Elbaph,<br />
                New World, Grand Line - 545454
              </p>
            </div>
            <div className="footer-section">
              <h4>Registered Office Address</h4>
              <p>
                My E-Commerce Pvt. Ltd.<br />
                Elbaph,<br />
                New World, Grand Line - 545454
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ProductProvider>
  );
}

export default App;