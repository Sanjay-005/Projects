// // src/CheckoutPage.jsx
// import { useState } from "react";
// import axios from "axios";

// function CheckoutPage({ cart, clearCart }) {
//   const [address, setAddress] = useState("");
//   const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

//   const handleCheckout = async () => {
//     if (!address) {
//       alert("Please enter your shipping address");
//       return;
//     }
//     try {
//       const items = cart.map((item) => ({
//         productId: item._id,
//         name: item.name,
//         price: item.price,
//         quantity: 1,
//       }));
//       await axios.post(
//         "http://localhost:5000/api/orders",
//         { items, total: totalPrice, address },
//         { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//       );
//       alert(`Order placed! Total: ₹${totalPrice}`);
//       clearCart();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to place order");
//     }
//   };

//   return (
//     <div>
//       <h1>Checkout</h1>
//       <ul>
//         {cart.map((item, index) => (
//           <li key={index}>
//             {item.name} - ₹{item.price}
//           </li>
//         ))}
//       </ul>
//       <h2>Total: ₹{totalPrice}</h2>
//       <textarea
//         placeholder="Enter your shipping address"
//         value={address}
//         onChange={(e) => setAddress(e.target.value)}
//       />
//       <br />
//       <button onClick={handleCheckout}>Place Order</button>
//     </div>
//   );
// }

// export default CheckoutPage;

import { useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51S1KEH0ecp93dnjZSYfISKzkGKLzdyE1TOl4qipjDnFtYkRrg4CkY4i3MC4QxRsmmM8FhKpXP2uMWZGOdVQEWMCA00Djn3tgbZ");

function CheckoutForm({ cart, clearCart }) {
  const [address, setAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // 1. Create payment intent on backend
      const { data } = await axios.post("http://localhost:5000/api/payment/create-payment-intent", {
        amount: totalPrice,
      });

      // 2. Confirm card payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { address: { line1: address } },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        // 3. Place order in your DB
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
        alert("Payment successful and order placed!");
        clearCart();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
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
        required
      />
      <div style={{ margin: "16px 0" }}>
        <CardElement />
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit" disabled={processing || !stripe}>
        {processing ? "Processing..." : "Pay & Place Order"}
      </button>
    </form>
  );
}

function CheckoutPage({ cart, clearCart }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm cart={cart} clearCart={clearCart} />
    </Elements>
  );
}

export default CheckoutPage;