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
    // 1. KEYWORD EXTRACTION
    // ---------------------------------------------------------
    // Remove filler words to get the core terms (e.g., "i want teamspirit tshirt" -> "teamspirit tshirt")
    const keywords = lowerMsg.replace(/is|available|do|you|have|looking|for|show|me|buy|price|of|the|a|an|products|items/gi, "").trim();
    
    let foundProducts = [];

    if (keywords.length > 1) {
      // ---------------------------------------------------------
      // 2. PRIMARY SEARCH (Specific)
      // ---------------------------------------------------------
      // Tries to find the whole phrase (e.g., "Teamspirit Tshirt")
      foundProducts = await Product.find({
        $or: [
          { name: { $regex: keywords, $options: "i" } },
          { category: { $regex: keywords, $options: "i" } }
        ]
      }).select("name price category").limit(4);

      // ---------------------------------------------------------
      // 3. RELAXED SEARCH (Category/Partial Match)
      // ---------------------------------------------------------
      // If specific search failed, split words and search individually.
      // Example: "Teamspirit Tshirt" -> searches for "Teamspirit" OR "Tshirt"
      if (foundProducts.length === 0) {
        const words = keywords.split(" ").filter(w => w.length > 2); // Ignore short words like "is", "at"
        
        if (words.length > 0) {
          // Create a regex that matches ANY of the words (e.g., /Teamspirit|Tshirt/i)
          const regexPattern = words.join("|");
          
          foundProducts = await Product.find({
            $or: [
              { name: { $regex: regexPattern, $options: "i" } },
              { category: { $regex: regexPattern, $options: "i" } }
            ]
          }).select("name price category").limit(4);
        }
      }
    }

    // REMOVED THE BLIND FALLBACK HERE 
    // We deleted the lines that fetched random products if foundProducts was empty.
    // Now, if foundProducts is empty, it stays empty.

    // ---------------------------------------------------------
    // 4. CONSTRUCT AI CONTEXT
    // ---------------------------------------------------------
    let inventoryContext = "";
    if (foundProducts.length > 0) {
      inventoryContext = foundProducts.map(p => `- ${p.name} (₹${p.price})`).join("\n");
    } else {
      inventoryContext = "No matching products found in inventory.";
    }

    // ---------------------------------------------------------
    // 5. SEND TO AI
    // ---------------------------------------------------------
    if (groq) {
      const systemPrompt = `
        You are a smart sales assistant for "My E-Commerce".
        
        CONTEXT:
        - User asked: "${message}"
        - Database Search Results: 
        ${inventoryContext}

        INSTRUCTIONS:
        1. IF products were found: Present them enthusiastically. Say "Here is what we have related to your search:".
        2. IF NO products were found: 
           - You MUST say: "I'm sorry, we don't have that item in stock right now."
           - Do NOT recommend random items.
           - Do NOT apologize excessively.
        3. If the user asks about location/contact:
           - Location: Elbaph, New World.
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
        products: foundProducts // This will be empty if no relevant products are found
      });
    }

    // Fallback if AI is offline
    if (foundProducts.length > 0) {
        return res.json({ 
            reply: `Here are the items matching "${keywords}":`, 
            products: foundProducts 
        });
    } else {
        return res.json({ 
            reply: `Sorry, we don't have "${keywords}" in stock.`, 
            products: [] 
        });
    }

  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ reply: "My brain is offline right now." });
  }
});

export default router;