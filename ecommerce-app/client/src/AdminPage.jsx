import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ProductContext } from "./ProductContext";

const API = "http://localhost:5000/api/products";

export default function AdminPage() {
  const { refreshProducts } = useContext(ProductContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for add form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState(""); // comma separated input
  const [category, setCategory] = useState("");

  // States for edit form
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImages, setEditImages] = useState("");
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    axios
      .get(API, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
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
        images: images.split(",").map((img) => img.trim()).filter(Boolean), // convert to array
        category: category.trim(),
      };
      const { data } = await axios.post(API, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setItems((prev) => [...prev, data]);
      setName("");
      setPrice("");
      setImages("");
      setCategory("");
      refreshProducts();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add product");
    }
  }

  async function handleBulkUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById("excelFile");
    if (!fileInput.files[0]) {
      alert("Please select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
      await axios.post(`${API}/bulk-upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Products uploaded successfully");
      refresh();
      refreshProducts();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to upload products");
    }
  }

  function startEdit(p) {
    setEditingId(p._id);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditImages((p.images || []).join(", ")); // show as comma separated
    setEditCategory(p.category || "");
  }

  async function saveEdit(id) {
    try {
      const payload = {
        name: editName.trim(),
        price: Number(editPrice),
        images: editImages.split(",").map((img) => img.trim()).filter(Boolean),
        category: editCategory.trim(),
      };
      const { data } = await axios.put(`${API}/${id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setItems((prev) => prev.map((it) => (it._id === id ? data : it)));
      cancelEdit();
      refreshProducts();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update product");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditImages("");
    setEditCategory("");
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setItems((prev) => prev.filter((it) => it._id !== id));
      refreshProducts();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete product");
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Admin — Products</h2>
        <Link to="/">← Back to Shop</Link>
      </header>

      {/* Bulk Upload Form */}
      <form onSubmit={handleBulkUpload} style={{ margin: "16px 0", display: "flex", gap: 8 }}>
        <input type="file" id="excelFile" accept=".xlsx, .xls" />
        <button type="submit">Upload Excel</button>
      </form>

      {/* Add Product Form */}
      <form onSubmit={handleAdd} style={{ margin: "16px 0", display: "grid", gap: 8, maxWidth: 420 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input
          placeholder="Price (₹)"
          type="number"
          min="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          placeholder="Image URLs (comma separated)"
          value={images}
          onChange={(e) => setImages(e.target.value)}
        />
        <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <button type="submit">Add Product</button>
      </form>

      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : items.length === 0 ? (
        <div>No products yet.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {items.map((p) => (
            <li key={p._id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
              {editingId === p._id ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input
                    type="number"
                    min="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                  />
                  <input
                    placeholder="Image URLs (comma separated)"
                    value={editImages}
                    onChange={(e) => setEditImages(e.target.value)}
                  />
                  <input
                    placeholder="Category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    required
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => saveEdit(p._id)}>
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
                  {p.images?.length > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {p.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={p.name}
                          style={{ width: 100, height: 80, objectFit: "cover", borderRadius: 4 }}
                        />
                      ))}
                    </div>
                  )}
                  <div>₹{p.price}</div>
                  <div>{p.category}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => startEdit(p)}>Edit</button>
                    <button type="button" onClick={() => handleDelete(p._id)}>Delete</button>
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