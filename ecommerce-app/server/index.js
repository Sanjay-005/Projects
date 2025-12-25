import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import searchRoutes from "./routes/searchRoutes.js";/** */
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ecommerce-qmku0qy9d-sanjays-projects-6f044a2a.vercel.app/"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/search", searchRoutes);/** */
app.use("/api/payment", paymentRoutes);

// mongoose
//   .connect(process.env.MONGO_URI, {//here we will connect with local MongoDB
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("MongoDB Connected Successfully");
//   })
//   .catch((err) => console.error("MongoDB Connection Error:", err));

mongoose.connect(process.env.MONGO_URI);


app.get("/", (req, res) => {
  res.send("E-commerce API is running...");
});

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

mongoose.connection.once("open", () => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));//here we connect the database before starting the server to prevent any api call to access database resulting in error before connecting the database
});