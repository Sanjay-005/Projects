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

//   try {
//     const lowerMsg = message.toLowerCase();

//     // ---------------------------------------------------------
//     // 1. KEYWORD EXTRACTION
//     // ---------------------------------------------------------
//     // Remove filler words to get the core terms (e.g., "i want teamspirit tshirt" -> "teamspirit tshirt")
//     const keywords = lowerMsg.replace(/is|available|do|you|have|looking|for|show|me|buy|price|of|the|a|an|products|items/gi, "").trim();
    
//     let foundProducts = [];

//     if (keywords.length > 1) {
//       // ---------------------------------------------------------
//       // 2. PRIMARY SEARCH (Specific)
//       // ---------------------------------------------------------
//       // Tries to find the whole phrase (e.g., "Teamspirit Tshirt")
//       foundProducts = await Product.find({
//         $or: [
//           { name: { $regex: keywords, $options: "i" } },
//           { category: { $regex: keywords, $options: "i" } }
//         ]
//       }).select("name price category").limit(4);

//       // ---------------------------------------------------------
//       // 3. RELAXED SEARCH (Category/Partial Match)
//       // ---------------------------------------------------------
//       // If specific search failed, split words and search individually.
//       // Example: "Teamspirit Tshirt" -> searches for "Teamspirit" OR "Tshirt"
//       if (foundProducts.length === 0) {
//         const words = keywords.split(" ").filter(w => w.length > 2); // Ignore short words like "is", "at"
        
//         if (words.length > 0) {
//           // Create a regex that matches ANY of the words (e.g., /Teamspirit|Tshirt/i)
//           const regexPattern = words.join("|");
          
//           foundProducts = await Product.find({
//             $or: [
//               { name: { $regex: regexPattern, $options: "i" } },
//               { category: { $regex: regexPattern, $options: "i" } }
//             ]
//           }).select("name price category").limit(4);
//         }
//       }
//     }

//     // REMOVED THE BLIND FALLBACK HERE 
//     // We deleted the lines that fetched random products if foundProducts was empty.
//     // Now, if foundProducts is empty, it stays empty.

//     // ---------------------------------------------------------
//     // 4. CONSTRUCT AI CONTEXT
//     // ---------------------------------------------------------
//     let inventoryContext = "";
//     if (foundProducts.length > 0) {
//       inventoryContext = foundProducts.map(p => `- ${p.name} (₹${p.price})`).join("\n");
//     } else {
//       inventoryContext = "No matching products found in inventory.";
//     }

//     // ---------------------------------------------------------
//     // 5. SEND TO AI
//     // ---------------------------------------------------------
//     if (groq) {
//       const systemPrompt = `
//         You are a smart sales assistant for "My E-Commerce".
        
//         CONTEXT:
//         - User asked: "${message}"
//         - Database Search Results: 
//         ${inventoryContext}

//         INSTRUCTIONS:
//         1. IF products were found: Present them enthusiastically. Say "Here is what we have related to your search:".
//         2. IF NO products were found: 
//            - You MUST say: "I'm sorry, we don't have that item in stock right now."
//            - Do NOT recommend random items.
//            - Do NOT apologize excessively.
//         3. If the user asks about location/contact:
//            - Location: Elbaph, New World.
//         4. Keep it short (max 2 sentences).
//       `;

//       const completion = await groq.chat.completions.create({
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: message }
//         ],
//         model: "llama-3.3-70b-versatile",
//       });

//       return res.json({ 
//         reply: completion.choices[0]?.message?.content,
//         products: foundProducts // This will be empty if no relevant products are found
//       });
//     }

//     // Fallback if AI is offline
//     if (foundProducts.length > 0) {
//         return res.json({ 
//             reply: `Here are the items matching "${keywords}":`, 
//             products: foundProducts 
//         });
//     } else {
//         return res.json({ 
//             reply: `Sorry, we don't have "${keywords}" in stock.`, 
//             products: [] 
//         });
//     }

//   } catch (err) {
//     console.error("Chat Error:", err);
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
    let lowerMsg = message.toLowerCase();
    let maxPrice = null;

    // ---------------------------------------------------------
    // 1. PRICE DETECTION LOGIC (NEW FEATURE)
    // ---------------------------------------------------------
    // Regex to find "under 5000", "below 200", "< 5000"
    // It captures the number in group 1
    const priceRegex = /(?:under|below|less than|cheaper than|budget)\s*(?:rs\.?|₹)?\s*(\d+)/i;
    const priceMatch = lowerMsg.match(priceRegex);

    if (priceMatch) {
      maxPrice = parseInt(priceMatch[1]);
      // Remove the price phrase from the message so it doesn't mess up keyword search
      // e.g., "Smartphones under 20000" becomes "Smartphones"
      lowerMsg = lowerMsg.replace(priceMatch[0], "").trim();
    }

    // ---------------------------------------------------------
    // 2. KEYWORD EXTRACTION
    // ---------------------------------------------------------
    const keywords = lowerMsg.replace(/is|available|do|you|have|looking|for|show|me|list|all|buy|price|of|the|a|an|products|items/gi, "").trim();
    
    let foundProducts = [];

    if (keywords.length > 1) {
      
      // Build the Base Query (Name or Category)
      let queryConditions = [
        { name: { $regex: keywords, $options: "i" } },
        { category: { $regex: keywords, $options: "i" } }
      ];

      // ---------------------------------------------------------
      // 3. APPLY PRICE FILTER TO DB QUERY
      // ---------------------------------------------------------
      let mongoQuery = { $or: queryConditions };

      if (maxPrice) {
        // If price exists, it becomes: (Name OR Category) AND (Price <= maxPrice)
        mongoQuery = {
          $and: [
            { $or: queryConditions },
            { price: { $lte: maxPrice } }
          ]
        };
      }

      // PRIMARY SEARCH
      foundProducts = await Product.find(mongoQuery)
        .select("name price category")
        .limit(5); // Limit to 5 so we don't spam the chat

      // ---------------------------------------------------------
      // 4. RELAXED SEARCH (Partial Matches)
      // ---------------------------------------------------------
      if (foundProducts.length === 0) {
        const words = keywords.split(" ").filter(w => w.length > 2);
        
        if (words.length > 0) {
          const regexPattern = words.join("|");
          
          let relaxedQuery = {
            $or: [
              { name: { $regex: regexPattern, $options: "i" } },
              { category: { $regex: regexPattern, $options: "i" } }
            ]
          };

          if (maxPrice) {
            relaxedQuery = {
              $and: [
                relaxedQuery,
                { price: { $lte: maxPrice } }
              ]
            };
          }

          foundProducts = await Product.find(relaxedQuery)
            .select("name price category")
            .limit(5);
        }
      }
    }

    // ---------------------------------------------------------
    // 5. CONSTRUCT AI CONTEXT
    // ---------------------------------------------------------
    let inventoryContext = "";
    if (foundProducts.length > 0) {
      inventoryContext = foundProducts.map(p => `- ${p.name} (₹${p.price})`).join("\n");
    } else {
      inventoryContext = "No matching products found in inventory.";
    }

    // ---------------------------------------------------------
    // 6. SEND TO AI
    // ---------------------------------------------------------
    if (groq) {
      const systemPrompt = `
        You are a smart sales assistant for "My E-Commerce".
        
        CONTEXT:
        - User asked: "${message}"
        - Detected Price Filter: ${maxPrice ? `Under ₹${maxPrice}` : "None"}
        - Database Results: 
        ${inventoryContext}

        INSTRUCTIONS:
        1. IF products found: 
           - If a price filter was used, say: "Here are the items I found under ₹${maxPrice}:"
           - If no price filter, say: "Here are the products matching your search:"
        2. IF NO products found: 
           - Say: "I couldn't find any products matching that description${maxPrice ? ` within that budget` : ""}."
           - Do NOT recommend fake items.
        3. Keep it short.
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
        products: foundProducts 
      });
    }

    // Fallback if AI is offline
    if (foundProducts.length > 0) {
        return res.json({ 
            reply: maxPrice 
              ? `Here are items under ₹${maxPrice}:` 
              : `Here are the items I found:`, 
            products: foundProducts 
        });
    } else {
        return res.json({ 
            reply: `Sorry, we don't have "${keywords}" ${maxPrice ? `under ₹${maxPrice}` : "in stock"}.`, 
            products: [] 
        });
    }

  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ reply: "My brain is offline right now." });
  }
});

export default router;