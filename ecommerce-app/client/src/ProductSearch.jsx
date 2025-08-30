import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  async function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    if (val.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/search/suggest?q=${encodeURIComponent(val)}`
      );
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
  }

  return (
    <div style={{ position: "relative", maxWidth: 300 }}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search products..."
        style={{ width: "100%", padding: 8 }}
      />
      {suggestions.length > 0 && (
        <ul style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "#fff",
          border: "1px solid #ccc",
          zIndex: 10,
          listStyle: "none",
          margin: 0,
          padding: 0
        }}>
          {suggestions.map((s, i) => (
            <li key={i} style={{ padding: 8 }}>
              <Link to={`/product/${s._id || s.id}`}>
                {s.image && (
                  <img src={s.image} alt={s.name} style={{ width: 40, height: 40, objectFit: "cover", marginRight: 8 }} />
                )}
                {s.name} - ₹{s.price}
                {s.category && <span style={{ color: "#666", marginLeft: 6 }}>({s.category})</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}