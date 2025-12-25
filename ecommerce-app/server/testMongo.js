import mongoose from "mongoose";

const uri = "mongodb+srv://ecommerceuser:ecommerce12345@cluster0.5ihsx9a.mongodb.net/ecommerce?appName=Cluster0";

try {
  await mongoose.connect(uri);
  console.log("CONNECTED OK");
  process.exit(0);
} catch (err) {
  console.error("FAILED:", err.message);
  process.exit(1);
}
