import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: CLIENT_URL }));//Only requests from a browser page running at http://localhost:5173 will pass the CORS check.

// We are using cors() so the React app (running on port 5173) can make requests to the Node server (port 5000) without browser blocking.
app.use(express.json());

// temporary product list 
const products = [
  {
    id: 1,
    name: "Nord-buds-2-airpods",
    price: 2500
  },
  {
    id: 2,
    name: "one-plus-11r",
    price: 40000
  },
  {
    id: 3,
    name: "Acer-laptop",
    price: 90000
  }
];

app.get("/", (req, res) => {
  res.send("E-commerce API is running...");
});

app.get("/api/message", (req, res) => {//test api
  res.json({message: "Hello from backend!"});
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) =>{
  const id = parseInt(req.params.id, 10);//req.params.id will return a string hence converting string to inter and 10 represents decimal!!
  const product = products.find((p) => p.id === id);
  if(!product){
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
