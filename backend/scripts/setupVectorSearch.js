#!/usr/bin/env node

/**
 * MongoDB Atlas Vector Search Setup Script
 * 
 * This script helps you set up vector search for the STAN AI Chatbot.
 * Run this script after setting up MongoDB Atlas to configure vector search.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logInfo, logError, logWarn } from '../utils/logger.js';
import { Message } from '../models/Message.js';
import { 
  createVectorSearchIndex, 
  isVectorSearchAvailable, 
  getVectorSearchStats 
} from '../utils/vectorSearch.js';

dotenv.config();

/**
 * Main setup function
 */
async function setupVectorSearch() {
  try {
    logInfo('Starting MongoDB Atlas Vector Search setup...');
    
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      logError('MONGODB_URI environment variable is not set');
      console.log('\nPlease set your MongoDB URI in your .env file:');
      console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
      process.exit(1);
    }
    
    // Connect to MongoDB
    logInfo('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    logInfo('Connected to MongoDB successfully');
    
    // Check current vector search status
    logInfo('Checking current vector search status...');
    const stats = await getVectorSearchStats(Message);
    
    console.log('\n📊 Current Vector Search Status:');
    console.log(`Total Messages: ${stats.totalMessages}`);
    console.log(`Messages with Embeddings: ${stats.messagesWithEmbeddings}`);
    console.log(`Embedding Coverage: ${(stats.embeddingCoverage * 100).toFixed(1)}%`);
    console.log(`Vector Search Available: ${stats.vectorSearchAvailable ? '✅ Yes' : '❌ No'}`);
    
    if (stats.vectorSearchAvailable) {
      logInfo('Vector search is already available!');
      console.log('\n✅ Vector search is working correctly.');
      console.log('No additional setup required.');
    } else {
      logWarn('Vector search is not available. Setting up...');
      
      // Create vector search index
      console.log('\n🔧 Setting up Vector Search Index...');
      console.log('\nTo enable MongoDB Atlas Vector Search, you need to:');
      console.log('\n1. Go to MongoDB Atlas Dashboard');
      console.log('2. Navigate to: Database > Browse Collections > messages');
      console.log('3. Click on "Indexes" tab');
      console.log('4. Click "Create Index"');
      console.log('5. Choose "JSON Editor"');
      console.log('6. Paste the following index definition:');
      
      const indexDefinition = {
        mappings: {
          dynamic: true,
          fields: {
            embedding: {
              dimensions: 768,
              similarity: "cosine",
              type: "knnVector"
            },
            content: {
              type: "text"
            },
            sessionId: {
              type: "objectId"
            },
            role: {
              type: "string"
            },
            sentiment: {
              type: "string"
            },
            createdAt: {
              type: "date"
            }
          }
        }
      };
      
      console.log('\n' + JSON.stringify(indexDefinition, null, 2));
      console.log('\n7. Click "Create"');
      console.log('\n⚠️  Note: Vector search requires MongoDB Atlas M10 or higher cluster');
      console.log('   If you\'re using a free tier, vector search will fall back to manual similarity');
      
      // Test if we can create the index programmatically (requires admin privileges)
      const indexCreated = await createVectorSearchIndex(Message);
      if (indexCreated) {
        logInfo('Vector search index definition created successfully');
      }
    }
    
    // Test vector search functionality
    console.log('\n🧪 Testing Vector Search Functionality...');
    const testAvailable = await isVectorSearchAvailable(Message);
    
    if (testAvailable) {
      console.log('✅ Vector search test passed!');
      console.log('Your setup is complete and ready for production use.');
    } else {
      console.log('⚠️  Vector search test failed.');
      console.log('This is normal if you haven\'t set up the index yet.');
      console.log('The application will fall back to manual similarity search.');
    }
    
    // Provide usage information
    console.log('\n📖 Usage Information:');
    console.log('- Vector search will automatically be used when available');
    console.log('- Fallback to manual similarity search when vector search is not available');
    console.log('- Fallback to basic text search as final option');
    console.log('- All fallbacks are handled automatically by the application');
    
    console.log('\n🚀 Setup complete! Your STAN AI Chatbot is ready for production.');
    
  } catch (error) {
    logError('Error during vector search setup', { error: error.message });
    console.error('\n❌ Setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your MongoDB connection string');
    console.log('2. Ensure you have proper database permissions');
    console.log('3. Verify your MongoDB Atlas cluster supports vector search (M10+)');
    process.exit(1);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logInfo('Database connection closed');
    }
  }
}

// Run the setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupVectorSearch();
}

export { setupVectorSearch }; 