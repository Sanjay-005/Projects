import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import ProductsList from "./ProductsList";
import ProductDetails from "./ProductDetails";

function App(){
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then(response => setProducts(response.data))
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div>
      <Routes>
        <Route path="/" element={<ProductsList products={products} />} />
        <Route
          path="/product/:id"
          element={<ProductDetails products={products} addToCart={addToCart} />}
        />
      </Routes>
      <hr />
      <h2>Cart ({cart.length})</h2>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>{item.name} - ₹{item.price}</li>
        ))}
      </ul>
      

    </div>
  );
}