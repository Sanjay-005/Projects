import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

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



const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
