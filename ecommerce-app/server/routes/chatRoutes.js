// import express from "express";
// import Product from "../models/Product.js";
// import Groq from "groq-sdk"; 
// import dotenv from "dotenv";

// dotenv.config();

// const router = express.Router();

// let groq;
// if (process.env.GROQ_API_KEY) {
//   groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// }

// router.post("/", async (req, res) => {
//   const { message } = req.body;
  
//   // DEBUG 1: Did we receive the message?
//   console.log("\n--- NEW CHAT REQUEST ---");
//   console.log("User asked:", message);

//   try {
//     const lowerMsg = message.toLowerCase();

//     // 1. Keyword Extraction
//     // We remove common filler words to find the "core" search term
//     const keywords = lowerMsg.replace(/how many|total|products|is|available|do|you|have|looking|for|show|me|buy|price|of|the|a|an/gi, "").trim();
    
//     console.log("Extracted Keywords:", keywords);

//     // 2. Database Search
//     // We fetch basic fields to see if ANYTHING matches
//     let foundProducts = [];
    
//     if (keywords.length > 0) {
//        foundProducts = await Product.find({
//         $or: [
//           { name: { $regex: keywords, $options: "i" } },
//           { category: { $regex: keywords, $options: "i" } }
//         ]
//       }).select("name price category").limit(5);
//     }

//     // DEBUG 2: What did the database actually return?
//     console.log(`DB Search Result for "${keywords}":`, foundProducts.length, "items found.");
//     if (foundProducts.length > 0) {
//       console.log("Items:", foundProducts.map(p => p.name));
//     } else {
//       console.log("⚠️ DB returned EMPTY. The bot should NOT say we have items.");
//     }

//     // 3. Construct the "Truth" for the AI
//     // If DB is empty, we explicitly tell the AI "WE HAVE NOTHING".
//     let inventoryContext = "NO PRODUCTS FOUND MATCHING THIS REQUEST.";
    
//     if (foundProducts.length > 0) {
//       inventoryContext = foundProducts.map(p => `- ${p.name} (₹${p.price})`).join("\n");
//     }

//     // 4. Send to AI with Strict Orders
//     if (groq) {
//       const systemPrompt = `
//         You are a truthful sales assistant for a small store.
        
//         REAL-TIME INVENTORY CHECK:
//         ${inventoryContext}

//         STRICT RULES:
//         1. IF the Inventory above says "NO PRODUCTS FOUND", you MUST say: "I'm sorry, we don't have that."
//         2. NEVER make up products. If it's not in the list above, it doesn't exist.
//         3. Do NOT say "we have thousands of products". We are a small store.
//         4. If the user asks "total products", say "We have a curated collection of exclusive items."
//       `;

//       const completion = await groq.chat.completions.create({
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: message }
//         ],
//         model: "llama-3.3-70b-versatile",
//       });

//       const aiReply = completion.choices[0]?.message?.content;
      
//       // DEBUG 3: What did the AI decide to say?
//       console.log("AI Reply:", aiReply);

//       return res.json({ 
//         reply: aiReply,
//         products: foundProducts 
//       });
//     }

//   } catch (err) {
//     console.error("❌ Chat Error:", err);
//     res.status(500).json({ reply: "My brain is offline right now." });
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

  try {
    const lowerMsg = message.toLowerCase();

    // ---------------------------------------------------------
    // 1. KEYWORD SEARCH
    // ---------------------------------------------------------
    const keywords = lowerMsg.replace(/is|available|do|you|have|looking|for|show|me|buy|price|of|the|a|an|products|items/gi, "").trim();
    
    let foundProducts = [];
    let isFallback = false; // Flag to track if we are showing "alternatives"

    if (keywords.length > 1) {
      // Primary Search
      foundProducts = await Product.find({
        $or: [
          { name: { $regex: keywords, $options: "i" } },
          { category: { $regex: keywords, $options: "i" } }
        ]
      }).select("name price category").limit(4);
    }

    // ---------------------------------------------------------
    // 2. THE "SMART PIVOT" (Upselling Logic)
    // ---------------------------------------------------------
    // If the user asked for something valid (keywords exist) but we found NOTHING...
    if (keywords.length > 1 && foundProducts.length === 0) {
      isFallback = true;
      // Fetch 3 random "Best Sellers" to show instead of an empty screen
      // (In a real app, you might sort by popularity)
      foundProducts = await Product.find().limit(3).select("name price category");
    }

    // ---------------------------------------------------------
    // 3. CONSTRUCT AI CONTEXT
    // ---------------------------------------------------------
    let inventoryContext = "";
    if (foundProducts.length > 0) {
      inventoryContext = foundProducts.map(p => `- ${p.name} (₹${p.price})`).join("\n");
    } else {
      inventoryContext = "Store is completely empty.";
    }

    // ---------------------------------------------------------
    // 4. SEND TO AI
    // ---------------------------------------------------------
    if (groq) {
      const systemPrompt = `
        You are a smart sales assistant for "My E-Commerce" located in Elbaph, Grand Line.
        
        CONTEXT:
        - User asked: "${message}"
        - Products Found in Database: 
        ${inventoryContext}
        - Is this a Fallback/Alternative List?: ${isFallback ? "YES" : "NO"}

        INSTRUCTIONS:
        1. IF products matched exactly (Fallback=NO): Present them enthusiastically.
        2. IF we found NO matches but are showing alternatives (Fallback=YES): 
           - Say: "I couldn't find '${keywords}', but check out our popular items:"
           - Do NOT pretend the alternatives are what the user asked for. Be honest.
        3. IF the user asks about location/contact:
           - Location: Elbaph, New World.
           - Email: support@myecommerce.com.
        4. Keep it short (max 2 sentences).
      `;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
      });

      return res.json({ 
        reply: completion.choices[0]?.message?.content,
        products: foundProducts // The frontend will render these cards
      });
    }

    // Fallback if AI is down
    if (isFallback) {
        return res.json({ 
            reply: `We don't have "${keywords}", but here are some other items you might like:`, 
            products: foundProducts 
        });
    }

    res.json({ reply: "I can help you find products.", products: [] });

  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ reply: "My brain is offline right now." });
  }
});

export default router;