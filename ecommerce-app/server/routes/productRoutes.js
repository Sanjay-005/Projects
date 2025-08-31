// import express from "express";
// import Product from "../models/Product.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const products = await Product.find({});
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.get("/:id", async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.post("/", protect, async (req, res) => {
//   try {
//     const { name, price, image } = req.body;
//     if (!name || !price) return res.status(400).json({ message: "Name and price required" });
//     const product = new Product({ name, price, image });
//     await product.save();
//     res.status(201).json(product);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.put("/:id", protect, async (req, res) => {
//   try {
//     const { name, price, image } = req.body;
//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       { name, price, image },
//       { new: true, runValidators: true }
//     );
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.delete("/:id", protect, async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json({ message: "Product deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;








import express from "express";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const products = await Product.find({});
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// import express from "express";
// import Product from "../models/Product.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const products = await Product.find({});
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.get("/:id", async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.post("/", protect, async (req, res) => {
//   try {
//     const { name, price, image } = req.body;
//     if (!name || !price) return res.status(400).json({ message: "Name and price required" });
//     const product = new Product({ name, price, image });
//     await product.save();
//     res.status(201).json(product);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.put("/:id", protect, async (req, res) => {
//   try {
//     const { name, price, image } = req.body;
//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       { name, price, image },
//       { new: true, runValidators: true }
//     );
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.delete("/:id", protect, async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json({ message: "Product deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;



// GET all products with filters/sort
router.get("/", async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

    let query = Product.find(filter);

    // Sorting
    if (sort === "price_asc") query = query.sort({ price: 1 });
    else if (sort === "price_desc") query = query.sort({ price: -1 });
    else if (sort === "name_asc") query = query.sort({ name: 1 });
    else if (sort === "name_desc") query = query.sort({ name: -1 });

    const products = await query.exec();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ New route to fetch distinct categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE product
router.post("/", protect, async (req, res) => {
  try {
    const { name, price, image, category } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category required" });
    }
    const product = new Product({ name, price, image, category });
    await product.save();

    // --- Sync with Azure Search ---
    try {
      const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
      const apiKey = process.env.AZURE_SEARCH_API_KEY;
      const indexName = process.env.AZURE_SEARCH_INDEX_NAME;
      if (endpoint && apiKey && indexName) {
        const client = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));
        await client.uploadDocuments([{
          id: product._id.toString(),
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
        }]);
      }
    } catch (azureErr) {
      console.error("Azure Search sync failed:", azureErr.message);
    }
    // --- End sync ---

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE product
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, price, image, category } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, image, category },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE product
router.delete("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;