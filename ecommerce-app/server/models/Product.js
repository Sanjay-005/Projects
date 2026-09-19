// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   price: { type: Number, required: true, min: 0 },
//   image: { type: String }, // keep old single image for backward compatibility
//   images: [{ type: String }], // new multiple images support
//   category: { type: String, required: true },
// });

// export default mongoose.model("Product", productSchema);

//Implementing AI descriptions feature
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String }, // keep old single image for backward compatibility
  images: [{ type: String }], // new multiple images support
  category: { type: String, required: true },
  description: { type: String, default: "" }, // new: optional, AI-generatable product description
});

export default mongoose.model("Product", productSchema);