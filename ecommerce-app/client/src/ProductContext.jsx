import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import API from "./api";

export const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const response = await API.get("/api/products");
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load products. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error, refreshProducts }}>
      {children}
    </ProductContext.Provider>
  );
}