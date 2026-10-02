import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  rating: number;
  reviews: number;
  vector: number[];
  description: string;
  tags: string[];
  featured: boolean;
  image?: string;          // ✅ image field (optional)
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    brand: { type: String, required: true, index: true },
    price: { type: Number, required: true, index: true },
    stock: { type: Number, required: true, default: 0, index: true },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    vector: { type: [Number], default: [] },
    description: { type: String, default: '' },
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    image: { type: String, default: '' },   // ✅ image field
  },
  { timestamps: true }
);

// Text index for search
ProductSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text', tags: 'text' });

// Compound indexes
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ brand: 1, rating: -1 });
ProductSchema.index({ featured: 1, createdAt: -1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);