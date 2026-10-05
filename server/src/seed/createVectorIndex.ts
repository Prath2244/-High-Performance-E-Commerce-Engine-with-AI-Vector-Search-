import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { getVectorIndexDefinition } from '../services/vectorService';

/**
 * This script creates the vector index in MongoDB Atlas
 * Run it once after setting up your Atlas cluster
 */
const createVectorIndex = async () => {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('products');
    
    const indexDefinition = getVectorIndexDefinition();
    
    await collection.createSearchIndex(indexDefinition);
    
    console.log('✅ Vector index created successfully');
    console.log('📊 Index name: product_vector_index');
    console.log('📐 Vector dimensions: 768');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create vector index:', error);
    process.exit(1);
  }
};

// Uncomment and run this script after setting up Atlas
// createVectorIndex();