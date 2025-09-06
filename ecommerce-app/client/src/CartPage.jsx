// import { useNavigate } from "react-router-dom";

// function CartPage({ cart, removeFromCart }) {
//   const navigate = useNavigate();

//   return (
//     <div>
//       <h2>Your Cart</h2>
//       {cart.length === 0 ? (
//         <p>Your cart is empty.</p>
//       ) : (
//         <>
//           <ul style={{ listStyle: "none", padding: 0 }}>
//             {cart.map((item, index) => (
//               <li key={index} style={{ borderBottom: "1px solid #ddd", padding: "8px 0" }}>
//                 {item.name} - ₹{item.price}
//                 <button
//                   style={{ marginLeft: 8 }}
//                   onClick={() => removeFromCart(index)}
//                 >
//                   Remove
//                 </button>
//               </li>
//             ))}
//           </ul>
//           <button
//             style={{ marginTop: 16 }}
//             onClick={() => navigate("/checkout")}
//           >
//             Checkout
//           </button>
//         </>
//       )}
//     </div>
//   );
// }

// export default CartPage;



import { useNavigate } from "react-router-dom";

function CartPage({ cart, removeFromCart }) {
  const navigate = useNavigate();

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>

      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item, index) => (
              <li key={index} className="cart-item">
                <span>{item.name} - ₹{item.price}</span>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(index)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <button
              className="checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
