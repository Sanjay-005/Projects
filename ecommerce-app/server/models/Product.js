import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String },
  category: { type: String, required: true }, // ensure always saved
});


export default mongoose.model("Product", productSchema);