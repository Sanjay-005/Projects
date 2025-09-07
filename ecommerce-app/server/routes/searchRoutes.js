import express from "express";
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

const router = express.Router();

// GET /api/search/suggest?q=term
router.get("/suggest", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: "Missing query" });

  // Create the client inside the handler to ensure env vars are loaded
  const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
  const apiKey = process.env.AZURE_SEARCH_API_KEY;
  const indexName = process.env.AZURE_SEARCH_INDEX_NAME;

  if (!endpoint || !apiKey || !indexName) {
    return res.status(500).json({ message: "Azure Search env vars not set" });
  }

  const client = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));

  try {
    const suggestResults = await client.suggest(q, "sg", {
      top: 5,
      select: ["name", "price", "image", "id"],
    });
    res.json(suggestResults.results.map(r => r.document));
  } catch (err) {
    res.status(500).json({ message: "Azure Search error", error: err.message });
  }
});

// GET /api/search?q=term
router.get("/", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: "Missing query" });

  const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
  const apiKey = process.env.AZURE_SEARCH_API_KEY;
  const indexName = process.env.AZURE_SEARCH_INDEX_NAME;

  if (!endpoint || !apiKey || !indexName) {
    return res.status(500).json({ message: "Azure Search config not set" });
  }

  const client = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));

  try {
    const searchResults = await client.search(q, {
      top: 20,
      select: ["id", "name", "price", "image", "category"]
    });

    const results = [];
    for await (const result of searchResults.results) {
      results.push(result.document);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Azure Search error", error: err.message });
  }
});


export default router;