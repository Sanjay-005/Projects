import {Link} from "react-router-dom";

function CartPage({cart, removeFromCart}) {
    const total = cart.reduce((s, p) => s + (p.price || 0), 0);

    return (
        <div>
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
                <div>
                    Cart is empty.<Link to="/">Go shopping</Link>

                </div>

            ) : (
                <div>
                    <ul>
                      {cart.map((item, idx) => (
                        <li key={`${item.id}-${idx}`}>
                            {item.name} - ₹{item.price}{" "}
                            <button onClick={() => removeFromCart(idx)}>Remove</button>

                        </li>
                      ))}
                    </ul>
                    
                    <div>
                        <strong>Total: ₹{total}</strong>

                    </div>

                    <div style={{ marginTop: 10 }}>
                        <button onClick={() => alert("Checkout flow not implemented yet")}>Procced to Checkout</button>

                    </div>
                
                </div>
            )}
        </div>
    );

}

export default CartPage;