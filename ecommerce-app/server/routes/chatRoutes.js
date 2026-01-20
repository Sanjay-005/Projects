// import express from "express";
// import Product from "../models/Product.js";
// import Groq from "groq-sdk"; 
// import dotenv from "dotenv";

// dotenv.config();

// const router = express.Router();

// // Initialize Groq Client
// let groq;
// if (process.env.GROQ_API_KEY) {
//   groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// }

// router.post("/", async (req, res) => {
//   const { message } = req.body;

//   try {
//     const lowerMsg = message.toLowerCase();

//     // ----------------------------------------
//     // 1. STATIC RULES (Instant & Free)
//     // ----------------------------------------
//     if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
//       return res.json({ reply: "Hello! I am your AI shopping assistant. Ask me about products, shipping, or returns!" });
//     }

//     if (lowerMsg.includes("return") || lowerMsg.includes("refund")) {
//       return res.json({ reply: "We accept returns within 30 days of purchase. Please visit our Contact page to initiate a return." });
//     }

//     if (lowerMsg.includes("shipping") || lowerMsg.includes("deliver")) {
//       return res.json({ reply: "We ship orders within 24 hours. Delivery usually takes 3-5 business days." });
//     }

//     // ----------------------------------------
//     // 2. DATABASE LOOKUP (Smart Product Search)
//     // ----------------------------------------
//     // Detect intent: "show me shoes", "price of laptop", "looking for bag"
//     if (lowerMsg.includes("show") || lowerMsg.includes("find") || lowerMsg.includes("looking for") || lowerMsg.includes("buy") || lowerMsg.includes("price")) {
      
//       // Clean the string to find keywords (e.g., "show me red shoes" -> "red shoes")
//       const keywords = lowerMsg.replace(/show me|find|looking for|i want to buy|price of|do you have/gi, "").trim();

//       if (keywords.length > 1) {
//         // Search MongoDB for name OR category
//         const products = await Product.find({
//           $or: [
//             { name: { $regex: keywords, $options: "i" } },
//             { category: { $regex: keywords, $options: "i" } }
//           ]
//         }).limit(3); // Limit to top 3 results

//         if (products.length > 0) {
//           return res.json({ 
//             reply: `I found some items matching "${keywords}":`,
//             products: products 
//           });
//         } else {
//           // If DB has no results, let AI handle it or apologize
//            // We intentionally fall through to Groq here to be polite
//         }
//       }
//     }

//     // ----------------------------------------
//     // 3. GROQ AI FALLBACK (Conversational)
//     // ----------------------------------------
//     if (groq) {
//       const completion = await groq.chat.completions.create({
//         messages: [
//           { 
//             role: "system", 
//             content: "You are a friendly e-commerce sales assistant. Keep answers short (max 2 sentences). If the user asks for a product we don't have, suggest they check the search bar." 
//           },
//           { role: "user", content: message }
//         ],
//         model: "llama-3.3-70b-versatile",
//       });

//       return res.json({ reply: completion.choices[0]?.message?.content || "I'm not sure about that." });
//     }

//     // Default if no API key and no DB match
//     res.json({ reply: "I can help you browse products. Try asking 'Show me electronics'." });

//   } catch (err) {
//     console.error("Chat Error:", err);
//     res.status(500).json({ reply: "Sorry, I'm having trouble connecting right now." });
//   }
// });

// export default router;

import express from "express";
import Product from "../models/Product.js";
import Groq from "groq-sdk"; 
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

let groq;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

router.post("/", async (req, res) => {
  const { message } = req.body;
  
  // DEBUG 1: Did we receive the message?
  console.log("\n--- NEW CHAT REQUEST ---");
  console.log("User asked:", message);

  try {
    const lowerMsg = message.toLowerCase();

    // 1. Keyword Extraction
    // We remove common filler words to find the "core" search term
    const keywords = lowerMsg.replace(/how many|total|products|is|available|do|you|have|looking|for|show|me|buy|price|of|the|a|an/gi, "").trim();
    
    console.log("Extracted Keywords:", keywords);

    // 2. Database Search
    // We fetch basic fields to see if ANYTHING matches
    let foundProducts = [];
    
    if (keywords.length > 0) {
       foundProducts = await Product.find({
        $or: [
          { name: { $regex: keywords, $options: "i" } },
          { category: { $regex: keywords, $options: "i" } }
        ]
      }).select("name price category").limit(5);
    }

    // DEBUG 2: What did the database actually return?
    console.log(`DB Search Result for "${keywords}":`, foundProducts.length, "items found.");
    if (foundProducts.length > 0) {
      console.log("Items:", foundProducts.map(p => p.name));
    } else {
      console.log("⚠️ DB returned EMPTY. The bot should NOT say we have items.");
    }

    // 3. Construct the "Truth" for the AI
    // If DB is empty, we explicitly tell the AI "WE HAVE NOTHING".
    let inventoryContext = "NO PRODUCTS FOUND MATCHING THIS REQUEST.";
    
    if (foundProducts.length > 0) {
      inventoryContext = foundProducts.map(p => `- ${p.name} (₹${p.price})`).join("\n");
    }

    // 4. Send to AI with Strict Orders
    if (groq) {
      const systemPrompt = `
        You are a truthful sales assistant for a small store.
        
        REAL-TIME INVENTORY CHECK:
        ${inventoryContext}

        STRICT RULES:
        1. IF the Inventory above says "NO PRODUCTS FOUND", you MUST say: "I'm sorry, we don't have that."
        2. NEVER make up products. If it's not in the list above, it doesn't exist.
        3. Do NOT say "we have thousands of products". We are a small store.
        4. If the user asks "total products", say "We have a curated collection of exclusive items."
      `;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
      });

      const aiReply = completion.choices[0]?.message?.content;
      
      // DEBUG 3: What did the AI decide to say?
      console.log("AI Reply:", aiReply);

      return res.json({ 
        reply: aiReply,
        products: foundProducts 
      });
    }

  } catch (err) {
    console.error("❌ Chat Error:", err);
    res.status(500).json({ reply: "My brain is offline right now." });
  }
});

export default router;