import {Link} from "react-router-dom";

function CartPage({cart, removeFromCart}) {
    const total = cart.reduce((s, p) => s + (p.price || 0), 0);

    return (
        <div>
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <div>
                Cart is empty. <Link to="/">Go shopping</Link>
            )}
        </div>
    )

}