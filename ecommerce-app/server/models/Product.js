import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String }, // keep old single image for backward compatibility
  images: [{ type: String }], // new multiple images support
  category: { type: String, required: true },
});

export default mongoose.model("Product", productSchema);