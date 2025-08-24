// client/src/AdminPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api/products";

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // add form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImage, setEditImage] = useState("");

  // load items
  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    axios
      .get(API)
      .then((res) => {
        setItems(res.data);
        setError(null);
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      const payload = {
        name: name.trim(),
        price: Number(price),
        image: image.trim() || undefined
      };
      const { data } = await axios.post(API, payload);
      setItems((prev) => [...prev, data]);
      setName("");
      setPrice("");
      setImage("");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add product");
    }
  }

  function startEdit(p) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditImage(p.image || "");
  }

  async function saveEdit(id) {
    try {
      const payload = {
        name: editName.trim(),
        price: Number(editPrice),
        image: editImage.trim() || undefined
      };
      const { data } = await axios.put(`${API}/${id}`, payload);
      setItems((prev) => prev.map((it) => (it.id === id ? data : it)));
      cancelEdit();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update product");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditImage("");
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch {
      alert("Failed to delete product");
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Admin — Products</h2>
        <Link to="/">← Back to Shop</Link>
      </header>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ margin: "16px 0", display: "grid", gap: 8, maxWidth: 420 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Price (₹)"
          type="number"
          min="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          placeholder="Image URL (optional)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <button type="submit">Add Product</button>
      </form>

      {/* List */}
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : items.length === 0 ? (
        <div>No products yet.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {items.map((p) => (
            <li key={p.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
              {editingId === p.id ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input
                    type="number"
                    min="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                  />
                  <input
                    placeholder="Image URL"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => saveEdit(p.id)}>
                      Save
                    </button>
                    <button type="button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: 240, height: 140, objectFit: "cover" }}
                    />
                  )}
                  <div>₹{p.price}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => startEdit(p)}>Edit</button>
                    <button type="button" onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
