import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Discount } from '../models/Discount';
import { connectDB } from '../config/db';
import { generateEmbedding, getProductEmbeddingText } from '../services/vectorService';
import dotenv from 'dotenv';
dotenv.config();

// ──────────────────────────────────────────────
// 1. Define product data with realistic categories
// ──────────────────────────────────────────────
interface MockProductInput {
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  rating: number;
  reviews: number;
  tags: string[];
  featured: boolean;
  description: string;
  vector: number[];
}

// Category mapping by product name keywords
const categoryMap: { [key: string]: string } = {
  'Headphones': 'Electronics',
  'Smart Watch': 'Electronics',
  'Bluetooth Speaker': 'Electronics',
  'Laptop Stand': 'Electronics',
  'Running Shoes': 'Apparel',
  'Winter Jacket': 'Apparel',
  'Coffee Maker': 'Home & Kitchen',
  'Desk Lamp': 'Home & Kitchen',
  'Fitness Tracker': 'Sports',
  'Backpack': 'Apparel',
  'Sunglasses': 'Apparel',
  'Tablet Case': 'Electronics',
  'Gaming Mouse': 'Electronics',
  'Mechanical Keyboard': 'Electronics',
  'USB-C Hub': 'Electronics',
  'Monitor Arm': 'Electronics',
  'Yoga Mat': 'Sports',
  'Water Bottle': 'Sports',
  'Phone Charger': 'Electronics',
  'Power Bank': 'Electronics',
  'Noise Cancelling Earbuds': 'Electronics',
  'Smartphone Gimbal': 'Electronics',
  'Portable Monitor': 'Electronics',
  'Wireless Charging Pad': 'Electronics',
  'Laptop Sleeve': 'Apparel',
  'Travel Adapter': 'Electronics',
  'Bluetooth Tracker': 'Electronics',
  'Smart Plug': 'Electronics',
  'LED Strip Lights': 'Home & Kitchen',
  'Webcam Cover': 'Electronics',
};

const brands = ['NovaTech', 'Apex', 'Zenith', 'Vivid', 'EcoSmart', 'Urban', 'PureLife'];
const productNames = [
  'Wireless Headphones', 'Smart Watch', 'Bluetooth Speaker', 'Laptop Stand',
  'Running Shoes', 'Winter Jacket', 'Coffee Maker', 'Desk Lamp',
  'Fitness Tracker', 'Backpack', 'Sunglasses', 'Tablet Case',
  'Gaming Mouse', 'Mechanical Keyboard', 'USB-C Hub', 'Monitor Arm',
  'Yoga Mat', 'Water Bottle', 'Phone Charger', 'Power Bank',
  'Noise Cancelling Earbuds', 'Smartphone Gimbal', 'Portable Monitor',
  'Wireless Charging Pad', 'Laptop Sleeve', 'Travel Adapter',
  'Bluetooth Tracker', 'Smart Plug', 'LED Strip Lights', 'Webcam Cover'
];

const tags = ['premium', 'best-seller', 'eco-friendly', 'new-arrival', 'limited-edition', 'trending', 'value'];

function getCategory(productName: string): string {
  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (productName.includes(keyword)) {
      return category;
    }
  }
  return 'Electronics'; // fallback
}

function generateMockProducts(count: number): MockProductInput[] {
  const products: MockProductInput[] = [];
  for (let i = 1; i <= count; i++) {
    const name = productNames[i % productNames.length] + (i > productNames.length ? ` ${Math.floor(i / productNames.length) + 1}` : '');
    const category = getCategory(name);
    const brand = brands[i % brands.length];
    const price = +(Math.random() * 180 + 19).toFixed(2);
    const stock = Math.floor(Math.random() * 120) + 5;
    const rating = +(Math.random() * 2 + 3).toFixed(1);
    const reviews = Math.floor(Math.random() * 400) + 10;
    const productTags = tags.filter(() => Math.random() > 0.6);
    
    products.push({
      name,
      category,
      brand,
      price,
      stock,
      rating,
      reviews,
      tags: productTags,
      featured: Math.random() > 0.8,
      description: `${brand} ${name} – premium quality designed for everyday use.`,
      vector: [],
    });
  }
  return products;
}

// ──────────────────────────────────────────────
// 2. Seed script
// ──────────────────────────────────────────────
const seedDB = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    await Discount.deleteMany({});
    console.log('🧹 Existing data cleared');

    // Generate products
    const mockProducts = generateMockProducts(5000);
    
    // Generate embeddings (fallback to random if API fails)
    console.log('🔄 Generating embeddings for products...');
    for (let i = 0; i < mockProducts.length; i++) {
      const product = mockProducts[i];
      const text = getProductEmbeddingText(product);
      
      try {
        const embedding = await generateEmbedding(text);
        product.vector = embedding;
      } catch (error) {
        console.error(`❌ Failed to generate embedding for product ${i + 1}:`, error);
        product.vector = Array.from({ length: 768 }, () => +(Math.random() * 2 - 1).toFixed(4));
      }
      
      if ((i + 1) % 100 === 0) {
        console.log(`✅ Processed ${i + 1}/${mockProducts.length} products`);
      }
    }
    
    await Product.insertMany(mockProducts as any);
    console.log(`✅ Seeded ${mockProducts.length} products with embeddings`);

    // ─── Admin User ───
    const adminUser = await User.create({
      email: 'admin@nexus.io',
      password: 'admin123',
      name: 'Admin Nexus',
      role: 'admin',
      address: {
        street: '123 Admin St',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India'
      }
    });
    console.log('✅ Admin user created (admin@nexus.io / admin123)');

    // ─── Test User ───
    const testUser = await User.create({
      email: 'user@nexus.io',
      password: 'user123',
      name: 'Test User',
      role: 'user'
    });
    console.log('✅ Test user created (user@nexus.io / user123)');

    // ─── Discounts ───
    await Discount.create([
      {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minOrderAmount: 50,
        maxDiscount: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        active: true
      },
      {
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        minOrderAmount: 100,
        maxDiscount: 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        usageLimit: 50,
        active: true
      },
      {
        code: 'FLAT50',
        type: 'fixed',
        value: 50,
        minOrderAmount: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usageLimit: 20,
        active: true
      }
    ]);
    console.log('✅ Discount codes created');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📧 Admin: admin@nexus.io / admin123`);
    console.log(`📧 Test User: user@nexus.io / user123`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();