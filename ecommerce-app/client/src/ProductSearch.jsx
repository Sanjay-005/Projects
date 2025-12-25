import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import API from "./api";

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  async function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    if (val.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const { data } = await API.get(
        `/api/search/suggest?q=${encodeURIComponent(val)}`
      );
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
  }

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSuggestions([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    setSuggestions([]);
    if (location.pathname === "/") {
      setQuery(""); // clear query only on home page
    }
  }, [location]);

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Search products..."
        className="search-input"
      />

      <button className="search-button" onClick={handleSearch}>
        <FaSearch />
      </button>

      {suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((s, i) => (
            <li
              key={i}
              style={{ padding: 8 }}
              onClick={() => setSuggestions([])}
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
                  <span className="suggestion-cat">({s.category})</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
