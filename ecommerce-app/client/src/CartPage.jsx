// src/CartPage.jsx
function CartPage({ cart, removeFromCart }) {
  return (
    <div>
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {cart.map((item, index) => (
            <li key={index} style={{ borderBottom: "1px solid #ddd", padding: "8px 0" }}>
              {item.name} - ₹{item.price}
              <button
                style={{ marginLeft: 8 }}
                onClick={() => removeFromCart(index)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CartPage;