import { Message } from '../models/Message.js';
import { generateEmbedding } from './embeddingUtils.js';
import { logError, logInfo } from './logger.js';

/**
 * Extract key information from a conversation to store in memory
 * @param {string} text - The message text to analyze
 * @returns {Promise<Object>} - Extracted entities and topics
 */
export const extractKeyInformation = async (text) => {
  try {
    // For production: Consider using advanced NLP libraries like spaCy or cloud NLP services
    // This implementation uses regex-based entity extraction for basic functionality
    
    const entities = {};
    
    // Extract potential names (capitalized words)
    const nameMatches = text.match(/\b[A-Z][a-z]+\b/g);
    if (nameMatches) {
      entities.names = [...new Set(nameMatches)];
    }
    
    // Extract potential locations
    const locationMatches = text.match(/\b(in|at|from)\s+([A-Z][a-z]+)\b/g);
    if (locationMatches) {
      entities.locations = locationMatches.map(match => {
        return match.replace(/^(in|at|from)\s+/, '');
      });
    }
    
    // Extract potential interests/topics (simplified)
    const interestKeywords = ['like', 'love', 'enjoy', 'favorite', 'hobby', 'interested in'];
    const interestMatches = interestKeywords.flatMap(keyword => {
      const regex = new RegExp(`${keyword}\\s+([^.,!?]+)`, 'gi');
      const matches = [];
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push(match[1].trim());
      }
      return matches;
    });
    
    if (interestMatches.length > 0) {
      entities.interests = [...new Set(interestMatches)];
    }
    
    return entities;
  } catch (error) {
    logError('Error extracting key information', { error: error.message });
    return {};
  }
};

/**
 * Store a message with embeddings and extracted information
 * @param {string} sessionId - The chat session ID
 * @param {string} content - The message content
 * @param {string} role - The message role (user/assistant)
 * @param {string} sentiment - The detected sentiment
 * @returns {Promise<Object>} - The saved message
 */
export const storeMessageWithMemory = async (sessionId, content, role, sentiment = null) => {
  try {
    // Generate embedding for vector search
    const embedding = await generateEmbedding(content);
    
    // Extract key information for memory
    const extractedInfo = role === 'user' ? await extractKeyInformation(content) : {};
    
    // Create and save the message
    const message = new Message({
      sessionId,
      content,
      role,
      sentiment,
      embedding,
      metadata: extractedInfo,
    });
    
    await message.save();
    return message;
  } catch (error) {
    logError('Error storing message with memory', { error: error.message });
    throw error;
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

/**
 * Retrieve relevant memories for the current conversation
 * @param {string} sessionId - The chat session ID
 * @param {string} currentMessage - The current message for context
 * @param {number} limit - Maximum number of memories to retrieve
 * @returns {Promise<Array>} - Relevant memories
 */
export const retrieveRelevantMemories = async (sessionId, currentMessage, limit = 5) => {
  try {
    // Get recent conversation history
    const recentMessages = await Message.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Use enhanced vector search for semantic similarity
    const { findSimilarMessages } = await import('./embeddingUtils.js');
    const similarMessages = await findSimilarMessages(currentMessage, Message, limit, sessionId);
    
    // Filter out recent messages from similar results
    const recentMessageIds = recentMessages.map(msg => msg._id.toString());
    const filteredSimilarMessages = similarMessages.filter(message => 
      !recentMessageIds.includes(message._id.toString())
    );
    
    // Combine recent and similar messages, removing duplicates
    const allMessages = [...recentMessages, ...filteredSimilarMessages];
    const uniqueMessages = allMessages.filter((message, index, self) => {
      return index === self.findIndex(m => m._id.toString() === message._id.toString());
    });
    
    logInfo('Retrieved relevant memories', { 
      sessionId,
      recentCount: recentMessages.length,
      similarCount: filteredSimilarMessages.length,
      totalCount: uniqueMessages.length
    });
    
    return uniqueMessages;
  } catch (error) {
    logError('Error retrieving relevant memories', { error: error.message });
    return [];
  }
};