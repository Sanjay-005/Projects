import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then(response => {
        setProducts(response.data);

      })
      .catch(error => {
        console.error("Error fetching products:", error);
      });
  }, []);

  return (
    <div>
      <h1>Our products</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} - ₹{product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;