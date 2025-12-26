// import express from "express";
// import Product from "../models/Product.js";
// import { protect, admin } from "../middleware/authMiddleware.js"; // Updated to import admin
// import { SearchClient, AzureKeyCredential } from "@azure/search-documents";
// import multer from "multer";
// import xlsx from "xlsx";

// const router = express.Router();

// // ------------------
// // Bulk Upload Setup
// // ------------------
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Admin-only bulk upload route
// router.post("/bulk-upload", protect, admin, upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const rows = xlsx.utils.sheet_to_json(sheet);

//     if (!rows || rows.length === 0) {
//       return res.status(400).json({ message: "Excel file is empty" });
//     }

//     const products = rows.map((row) => ({
//       name: row.name,
//       price: row.price,
//       image: row.image || "",
//       images: row.images ? row.images.split(",").map((img) => img.trim()) : [],
//       category: row.category,
//     }));

//     await Product.insertMany(products);

//     res.json({
//       message: "Products uploaded successfully",
//       count: products.length,
//     });
//   } catch (error) {
//     console.error("Bulk upload error:", error);
//     res.status(500).json({ message: "Failed to upload products" });
//   }
// });

// // ------------------
// // Existing Routes
// // ------------------

// // GET all products with filters/sort
// router.get("/", async (req, res) => {
//   try {
//     const { category, minPrice, maxPrice, sort } = req.query;
//     const filter = {};
//     if (category) filter.category = category;
//     if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
//     if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

//     let query = Product.find(filter);

//     if (sort === "price_asc") query = query.sort({ price: 1 });
//     else if (sort === "price_desc") query = query.sort({ price: -1 });
//     else if (sort === "name_asc") query = query.sort({ name: 1 });
//     else if (sort === "name_desc") query = query.sort({ name: -1 });

//     const products = await query.exec();
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Get distinct categories
// router.get("/categories", async (req, res) => {
//   try {
//     const categories = await Product.distinct("category");
//     res.json(categories);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // GET single product
// router.get("/:id", async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Search results using Azure
// router.get("/search/results", async (req, res) => {
//   const { q } = req.query;
//   if (!q) return res.status(400).json({ message: "Missing search query" });

//   const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
//   const apiKey = process.env.AZURE_SEARCH_API_KEY;
//   const indexName = process.env.AZURE_SEARCH_INDEX_NAME;

//   if (!endpoint || !apiKey || !indexName) {
//     return res.status(500).json({ message: "Azure Search env vars not set" });
//   }

//   const client = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));

//   try {
//     const searchResults = await client.search(q, {
//       top: 50,
//       select: ["id", "name", "price", "image", "images", "category"],
//     });

//     const products = [];
//     for await (const result of searchResults.results) {
//       products.push(result.document);
//     }

//     res.json(products);
//   } catch (err) {
//     console.error("Search error:", err);
//     res.status(500).json({ message: "Search failed", error: err.message });
//   }
// });

// // CREATE product — Admin only
// router.post("/", protect, admin, async (req, res) => {
//   try {
//     const { name, price, image, images, category } = req.body;
//     if (!name || !price || !category) {
//       return res.status(400).json({ message: "Name, price, and category required" });
//     }

//     const product = new Product({
//       name,
//       price,
//       category,
//       image: image || "",
//       images: Array.isArray(images)
//         ? images
//         : images
//         ? images.split(",").map((img) => img.trim())
//         : image
//         ? [image]
//         : [],
//     });

//     await product.save();
//     res.status(201).json(product);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // UPDATE product — Admin only
// router.put("/:id", protect, admin, async (req, res) => {
//   try {
//     const { name, price, image, images, category } = req.body;
//     const updateData = {
//       name,
//       price,
//       category,
//       image: image || "",
//       images: Array.isArray(images)
//         ? images
//         : images
//         ? images.split(",").map((img) => img.trim())
//         : image
//         ? [image]
//         : [],
//     };

//     const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // DELETE product — Admin only
// router.delete("/:id", protect, admin, async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json({ message: "Product deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;


//Following is a code file for enabling auto sync feature with Azure Search whenever products are added, deleted, or updated in MongoDB

import express from "express";
import Product from "../models/Product.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import multer from "multer";
import xlsx from "xlsx";

// ✅ Azure Search auto-sync helpers
import {
  upsertProductToSearch,
  deleteProductFromSearch,
} from "../utils/azureSearch.js";

const router = express.Router();

// ------------------
// Bulk Upload Setup
// ------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ------------------
// Admin-only Bulk Upload
// ------------------
router.post(
  "/bulk-upload",
  protect,
  admin,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);

      if (!rows || rows.length === 0) {
        return res.status(400).json({ message: "Excel file is empty" });
      }

      const products = rows.map((row) => ({
        name: row.name,
        price: row.price,
        image: row.image || "",
        images: row.images
          ? row.images.split(",").map((img) => img.trim())
          : [],
        category: row.category,
      }));

      const insertedProducts = await Product.insertMany(products);

      // ✅ AUTO-SYNC BULK PRODUCTS (best effort)
      for (const product of insertedProducts) {
        try {
          await upsertProductToSearch(product);
        } catch (err) {
          console.error(
            "Azure sync failed (bulk upload):",
            err.message
          );
        }
      }

      res.json({
        message: "Products uploaded successfully",
        count: insertedProducts.length,
      });
    } catch (error) {
      console.error("Bulk upload error:", error);
      res.status(500).json({ message: "Failed to upload products" });
    }
  }
);

// ------------------
// GET all products (filters + sort)
// ------------------
router.get("/", async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

    let query = Product.find(filter);

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

// ------------------
// GET distinct categories
// ------------------
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------
// GET single product
// ------------------
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------
// CREATE product (Admin)
// ------------------
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, price, image, images, category } = req.body;

    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ message: "Name, price, and category required" });
    }

    const product = new Product({
      name,
      price,
      category,
      image: image || "",
      images: Array.isArray(images)
        ? images
        : images
        ? images.split(",").map((img) => img.trim())
        : image
        ? [image]
        : [],
    });

    await product.save();

    // ✅ AUTO-SYNC CREATE
    try {
      await upsertProductToSearch(product);
    } catch (err) {
      console.error("Azure sync failed (create):", err.message);
    }

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------
// UPDATE product (Admin)
// ------------------
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { name, price, image, images, category } = req.body;

    const updateData = {
      name,
      price,
      category,
      image: image || "",
      images: Array.isArray(images)
        ? images
        : images
        ? images.split(",").map((img) => img.trim())
        : image
        ? [image]
        : [],
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // ✅ AUTO-SYNC UPDATE
    try {
      await upsertProductToSearch(product);
    } catch (err) {
      console.error("Azure sync failed (update):", err.message);
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------
// DELETE product (Admin)
// ------------------
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // ✅ AUTO-SYNC DELETE
    try {
      await deleteProductFromSearch(product._id);
    } catch (err) {
      console.error("Azure sync failed (delete):", err.message);
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
