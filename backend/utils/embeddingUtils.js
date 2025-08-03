import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { logError, logInfo } from './logger.js';

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
 * @param {string} sessionId - Optional session ID to filter results
 * @returns {Promise<Array>} - Array of similar messages
 */
export const findSimilarMessages = async (query, Message, limit = 5, sessionId = null) => {
  try {
    // Try to use MongoDB Atlas Vector Search first (production-ready)
    const { findSimilarMessagesVectorSearch, isVectorSearchAvailable } = await import('./vectorSearch.js');
    
    const vectorSearchAvailable = await isVectorSearchAvailable(Message);
    
    if (vectorSearchAvailable) {
      logInfo('Using MongoDB Atlas Vector Search for semantic similarity');
      const results = await findSimilarMessagesVectorSearch(query, Message, limit, sessionId);
      return results.map(result => ({
        ...result,
        _id: result._id,
        content: result.content,
        role: result.role,
        sentiment: result.sentiment,
        sessionId: result.sessionId,
        metadata: result.metadata,
        createdAt: result.createdAt
      }));
    } else {
      // Fallback to manual cosine similarity (development/legacy)
      logInfo('Vector search not available, using manual cosine similarity');
      return await findSimilarMessagesLegacy(query, Message, limit, sessionId);
    }
  } catch (error) {
    logError('Error finding similar messages', { error: error.message });
    // Final fallback to basic search
    return await findSimilarMessagesBasic(query, Message, limit, sessionId);
  }
};

/**
 * Legacy implementation using manual cosine similarity
 * @param {string} query - The query text
 * @param {mongoose.Model} Message - The Message model
 * @param {number} limit - Maximum number of results to return
 * @param {string} sessionId - Optional session ID to filter results
 * @returns {Promise<Array>} - Array of similar messages
 */
const findSimilarMessagesLegacy = async (query, Message, limit = 5, sessionId = null) => {
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    if (!embedding) return [];

    // Build filter
    const filter = { embedding: { $exists: true } };
    if (sessionId) {
      filter.sessionId = new Message.base.Types.ObjectId(sessionId);
    }

    // Find messages with embeddings
    const messages = await Message.find(filter)
      .select('+embedding') // Include embedding field
      .limit(100); // Get recent messages with embeddings

    // Calculate cosine similarity manually
    const scoredMessages = messages.map(message => {
      const similarity = cosineSimilarity(embedding, message.embedding);
      return { message, similarity };
    });

    // Sort by similarity and return top results
    return scoredMessages
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => ({
        ...item.message.toObject(),
        score: item.similarity
      }));
  } catch (error) {
    logError('Error in legacy similarity search', { error: error.message });
    return [];
  }
};

/**
 * Basic text-based search as final fallback
 * @param {string} query - The query text
 * @param {mongoose.Model} Message - The Message model
 * @param {number} limit - Maximum number of results to return
 * @param {string} sessionId - Optional session ID to filter results
 * @returns {Promise<Array>} - Array of messages
 */
const findSimilarMessagesBasic = async (query, Message, limit = 5, sessionId = null) => {
  try {
    const filter = {};
    if (sessionId) {
      filter.sessionId = new Message.base.Types.ObjectId(sessionId);
    }

    // Use text search as fallback
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('content role sentiment sessionId createdAt metadata');

    logInfo('Using basic text search as fallback', { 
      resultsCount: messages.length,
      sessionId: sessionId || 'all'
    });

    return messages.map(msg => ({
      ...msg.toObject(),
      score: 0.5 // Default score for basic search
    }));
  } catch (error) {
    logError('Error in basic search', { error: error.message });
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