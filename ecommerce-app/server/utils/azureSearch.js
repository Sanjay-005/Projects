//we are creating this file for enabling auto sync feature i.e whenever admin adds,deletes product updates in mongodb, automatically will get indexed or removed in azure search as well!!
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const apiKey = process.env.AZURE_SEARCH_API_KEY;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME;

if (!endpoint || !apiKey || !indexName) {
  throw new Error("Azure Search environment variables missing");
}

const client = new SearchClient(
  endpoint,
  indexName,
  new AzureKeyCredential(apiKey)
);

export async function upsertProductToSearch(product) {
  const doc = {
    id: product._id.toString(),
    name: product.name,
    price: product.price,
    category: product.category || "",
    image: product.image || (product.images?.[0] || ""),
    images: product.images || [],
  };

  await client.uploadDocuments([doc]);
}

export async function deleteProductFromSearch(productId) {
  await client.deleteDocuments("id", [productId.toString()]);
}
