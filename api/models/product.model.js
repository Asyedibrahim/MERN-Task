import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unit: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["In Stock", "Out of Stock"], 
    default: "In Stock" 
  },
  image: { type: String, required: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
