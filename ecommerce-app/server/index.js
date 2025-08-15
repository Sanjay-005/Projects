import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url"; //needed to get the current file’s absolute path in ES modules
import fs from "fs/promises";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: CLIENT_URL }));//Only requests from a browser page running at http://localhost:5173 will pass the CORS check.

// We are using cors() so the React app (running on port 5173) can make requests to the Node server (port 5000) without browser blocking.
app.use(express.json());

//data layer--> more discussed in my project notes!!

const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "products.json");

let products = [];

async function ensureDataFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    // if file doesn't exist, write an empty array
    await fs.access(dataFile).catch(async () => {
      await fs.writeFile(dataFile, "[]", "utf-8");
    });
  } catch (err) {
    console.error("Failed to ensure data file:", err);
  }
}

async function loadProducts() {
  try {
    const raw = await fs.readFile(dataFile, "utf-8");
    products = JSON.parse(raw);
    if (!Array.isArray(products)) products = [];
  } catch (err) {
    console.error("Failed to read products.json:", err);
    products = [];
  }
}

async function saveProducts() {
  try {
    await fs.writeFile(dataFile, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save products.json:", err);
  }
}

function getNextId() {
  const max = products.reduce((m, p) => Math.max(m, p.id || 0), 0);
  return max + 1;
}

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


app.post("/api/products", async (req, res) => {
  const { name, price, image} = req.body;
  if(typeof name !== "string" || name.trim().length === 0){
    return res.status(400).json({ message: "Name is required" });
  }

  const numericPrice = Number(price);
  if(Number.isNaN(numericPrice) || numericPrice <=0){
    return res.status(400).json({ message: "Price must be a positive number" });
  }

  const newProduct = {
    id: getNextId(),
    name: name.trim(),
    price: numericPrice,
    image: image ? String(image).trim() : undefined
  };

  products.push(newProduct);
  await saveProducts();
  res.status(201).json(newProduct);

});

app.put("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => (p.id)===id);
  if(!product) return res.status(404).json({ message: "Product not found" });

  const { name, price, image } = req.body;
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ message: "Name must be a non-empty string" });
    }
    product.name = name.trim();
  }

  if (price !== undefined) {
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }
    product.price = numericPrice;
  }

  if (image !== undefined) {
    product.image = String(image).trim();
  }

  await saveProducts();
  res.json(product);
});

app.delete("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const idx = products.findIndex((p) => p.id === id);
  if(idx===-1) res.status(404).json({ message: "Product not found" });

  products.splice(idx, 1);
  await saveProducts();
  res.status(204).send();
});

(async () => {
  await ensureDataFile();
  await loadProducts();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();