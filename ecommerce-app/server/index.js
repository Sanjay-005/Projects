import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import Product from "./models/Product.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to local MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected Successfully");
    // Seed products (temporary, comment out after running once)
    // const seedProducts = async () => {
    //   try {
    //     const products = JSON.parse(fs.readFileSync("./data/products.json", "utf-8"));
    //     await Product.deleteMany();
    //     await Product.insertMany(products);
    //     console.log("Products seeded successfully!");
    //   } catch (err) {
    //     console.error("Seeding error:", err);
    //   }
    // };
    // seedProducts();
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Root route
app.get("/", (req, res) => {
  res.send("E-commerce API is running...");
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// Start server after DB connection
mongoose.connection.once("open", () => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});