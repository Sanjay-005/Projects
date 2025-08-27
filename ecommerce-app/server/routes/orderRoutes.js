import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { items, total, address } = req.body;
    if (!items || !total || !address) return res.status(400).json({ message: "Missing required fields" });
    const order = new Order({
      user: req.user._id,
      items,
      total,
      address,
    });
    await order.save();
    res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;