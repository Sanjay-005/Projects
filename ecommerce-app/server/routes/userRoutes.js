// import express from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const router = express.Router();

// router.post("/register", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password) return res.status(400).json({ message: "Username and password required" });

//     const existingUser = await User.findOne({ username });
//     if (existingUser) return res.status(400).json({ message: "User already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ username, password: hashedPassword, role: "user" }); // default role user
//     await user.save();
//     res.status(201).json({ message: "User registered" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.post("/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(400).json({ message: "Wrong password" });

//     const token = jwt.sign(
//       { username: user.username, _id: user._id, role: user.role }, // include role in token
//       process.env.JWT_SECRET,
//       { expiresIn: "24h" }
//     );
//     res.json({ token, role: user.role }); // send role along with token
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;


import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role: "user" });
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { username: user.username, _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({ token, role: user.role, cart: user.cart }); // send cart along with token
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's cart
router.get("/cart", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user's cart
router.post("/cart", protect, async (req, res) => {
  try {
    const { cart } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = cart;
    await user.save();
    res.json({ message: "Cart updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
