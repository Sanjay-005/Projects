import mongoose from "mongoose";
import Product from "./models/Product.js";
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";
import dotenv from "dotenv";
dotenv.config();

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const apiKey = process.env.AZURE_SEARCH_API_KEY;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME;

async function main() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI);

  // Fetch all products from MongoDB
  const products = await Product.find({});
  // Map MongoDB _id to Azure Search id
  const docs = products.map(p => ({
    id: p._id.toString(),
    name: p.name,
    price: p.price,
    image: p.image,
  }));

  // Connect to Azure Search
  const client = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));
  // Upload documents
  const result = await client.uploadDocuments(docs);
  console.log("Upload result:", result);
  console.log(`Uploaded ${docs.length} products to Azure Search`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});