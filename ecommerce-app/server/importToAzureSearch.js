// // importToAzureSearch.js
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import Product from "./models/Product.js";
// import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

// dotenv.config();

// // MongoDB connect
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   });

// const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
// const apiKey = process.env.AZURE_SEARCH_API_KEY;
// const indexName = process.env.AZURE_SEARCH_INDEX_NAME;

// if (!endpoint || !apiKey || !indexName) {
//   console.error("❌ Missing Azure Search config. Check your .env file.");
//   process.exit(1);
// }


// const client = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));

// async function importToAzure() {
//   try {
//     // 1️⃣ Fetch from Mongo
//     const products = await Product.find({});
//     const docs = products.map((p) => ({
//       id: p._id.toString(),
//       name: p.name,
//       price: p.price,
//       category: p.category || "",
//       image: p.image || "",
//     }));

//     console.log(`📦 Found ${docs.length} products in MongoDB`);

//     // 2️⃣ Fetch existing docs from Azure
//     const searchResults = await client.search("*", { select: ["id"] });
//     const azureIds = [];
//     for await (const result of searchResults.results) {
//       azureIds.push(result.document.id);
//     }
//     console.log(`☁️ Found ${azureIds.length} docs in Azure Search`);

//     // 3️⃣ Find deleted ones
//     const mongoIds = docs.map((d) => d.id);
//     const toDelete = azureIds.filter((id) => !mongoIds.includes(id));

//     if (toDelete.length > 0) {
//          console.log(`🗑 Deleting ${toDelete.length} stale docs from Azure...`);
//          await client.deleteDocuments("id", toDelete.map((id) => String(id)));
//     }


//     // 4️⃣ Upload fresh Mongo snapshot
//     if (docs.length > 0) {
//       console.log(`⬆️ Uploading ${docs.length} docs to Azure...`);
//       const result = await client.uploadDocuments(docs);
//       console.log("✅ Upload result:", result);
//     }

//     console.log("🎉 Sync complete!");
//     process.exit(0);
//   } catch (err) {
//     console.error("❌ Error during import:", err);
//     process.exit(1);
//   }
// }

// importToAzure();



// importToAzureSearch.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

dotenv.config();

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const apiKey = process.env.AZURE_SEARCH_API_KEY;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME;

if (!endpoint || !apiKey || !indexName) {
  console.error("❌ Missing Azure Search config. Check your .env file.");
  process.exit(1);
}


const client = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));

async function importToAzure() {
  try {
    // 1️⃣ Fetch from Mongo
    const products = await Product.find({});
    const docs = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      category: p.category || "",
      image: p.image || (p.images?.length > 0 ? p.images[0] : ""),
      images: p.images || [],
    }));

    console.log(`📦 Found ${docs.length} products in MongoDB`);

    // 2️⃣ Fetch existing docs from Azure
    const searchResults = await client.search("*", { select: ["id"] });
    const azureIds = [];
    for await (const result of searchResults.results) {
      azureIds.push(result.document.id);
    }
    console.log(`☁️ Found ${azureIds.length} docs in Azure Search`);

    // 3️⃣ Find deleted ones
    const mongoIds = docs.map((d) => d.id);
    const toDelete = azureIds.filter((id) => !mongoIds.includes(id));

    if (toDelete.length > 0) {
         console.log(`🗑 Deleting ${toDelete.length} stale docs from Azure...`);
         await client.deleteDocuments("id", toDelete.map((id) => String(id)));
    }


    // 4️⃣ Upload fresh Mongo snapshot
    if (docs.length > 0) {
      console.log(`⬆️ Uploading ${docs.length} docs to Azure...`);
      const result = await client.uploadDocuments(docs);
      console.log("✅ Upload result:", result);
    }

    console.log("🎉 Sync complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during import:", err);
    process.exit(1);
  }
}

importToAzure();
