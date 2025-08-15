import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api/products";

export default function AdminPage(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImage, setEditImage] = useState("");

  useEffect(() => {
    refresh();
  }, [])

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
}