import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const location = useLocation(); // track route changes

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

  // Clear suggestions on route change
  useEffect(() => {
    setSuggestions([]);
    setQuery("");
  }, [location]);

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search products..."
        className="search-input"
      />

      <button className="search-button">
        <FaSearch />
      </button>

      {suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((s, i) => (
            <li
              key={i}
              style={{ padding: 8 }}
              onClick={() => setSuggestions([])} // clear after click
            >
              <Link to={`/product/${s._id || s.id}`}>
                {s.image && (
                  <img
                    src={s.image}
                    alt={s.name}
                    className="suggestion-img"
                  />
                )}
                {s.name} - ₹{s.price}
                {s.category && (
                  <span className="suggestion-cat">
                    ({s.category})
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
