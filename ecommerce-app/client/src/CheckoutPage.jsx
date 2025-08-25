// src/CheckoutPage.jsx
import { useState } from "react";
import axios from "axios";

function CheckoutPage({ cart, clearCart }) {
  const [address, setAddress] = useState("");
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (!address) {
      alert("Please enter your shipping address");
      return;
    }
    try {
      const items = cart.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
      }));
      await axios.post(
        "http://localhost:5000/api/orders",
        { items, total: totalPrice, address },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert(`Order placed! Total: ₹${totalPrice}`);
      clearCart();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order");
    }
  };

  return (
    <div>
      <h1>Checkout</h1>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>
            {item.name} - ₹{item.price}
          </li>
        ))}
      </ul>
      <h2>Total: ₹{totalPrice}</h2>
      <textarea
        placeholder="Enter your shipping address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <br />
      <button onClick={handleCheckout}>Place Order</button>
    </div>
  );
}

export default CheckoutPage;