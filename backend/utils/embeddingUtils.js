import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { logError } from './logger.js';

dotenv.config();

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate embeddings for a text string
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<number[]>} - The embedding vector
 */
export const generateEmbedding = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    logError('Error generating embedding with Gemini', { error: error.message });
    return null;
  }
};

/**
 * Find semantically similar messages in the database
 * @param {string} query - The query text
 * @param {mongoose.Model} Message - The Message model
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of similar messages
 */
export const findSimilarMessages = async (query, Message, limit = 5) => {
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    if (!embedding) return [];

    // Find similar messages using vector similarity
    // For production: Consider using MongoDB Atlas Vector Search or dedicated vector DB
    // This implementation uses cosine similarity for basic vector search
    const messages = await Message.find({
      embedding: { $exists: true },
    }).limit(100); // Get recent messages with embeddings

    // Calculate cosine similarity manually
    const scoredMessages = messages.map(message => {
      const similarity = cosineSimilarity(embedding, message.embedding);
      return { message, similarity };
    });

    // Sort by similarity and return top results
    return scoredMessages
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.message);
  } catch (error) {
    logError('Error finding similar messages', { error: error.message });
    return [];
  }
};

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Cosine similarity (-1 to 1)
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};