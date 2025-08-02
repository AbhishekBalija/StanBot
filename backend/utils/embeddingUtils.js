import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

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
    console.error('Error generating embedding with Gemini:', error);
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
    // Note: This is a simplified version. In production, you would use a vector database
    // or MongoDB's $vectorSearch operator (MongoDB 5.0+)
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
    console.error('Error finding similar messages:', error);
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