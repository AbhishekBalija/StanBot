import { logError, logInfo } from './logger.js';

/**
 * MongoDB Atlas Vector Search implementation for production use
 * This provides much better performance and scalability than manual cosine similarity
 */

/**
 * Create a vector search index for the messages collection
 * This should be run once to set up the vector search index in MongoDB Atlas
 * @param {mongoose.Model} Message - The Message model
 * @returns {Promise<boolean>} - Success status
 */
export const createVectorSearchIndex = async (Message) => {
  try {
    // This is the index definition for MongoDB Atlas Vector Search
    // You need to create this index in MongoDB Atlas dashboard or via MongoDB shell
    const indexDefinition = {
      mappings: {
        dynamic: true,
        fields: {
          embedding: {
            dimensions: 768, // Gemini embedding dimensions
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

    logInfo('Vector search index definition created', { 
      dimensions: 768, 
      similarity: 'cosine' 
    });

    // Note: This index needs to be created in MongoDB Atlas dashboard
    // Go to: Database > Browse Collections > messages > Indexes > Create Index
    // Use the definition above or run via MongoDB shell
    
    return true;
  } catch (error) {
    logError('Error creating vector search index', { error: error.message });
    return false;
  }
};

/**
 * Find semantically similar messages using MongoDB Atlas Vector Search
 * @param {string} query - The query text
 * @param {mongoose.Model} Message - The Message model
 * @param {number} limit - Maximum number of results to return
 * @param {string} sessionId - Optional session ID to filter results
 * @returns {Promise<Array>} - Array of similar messages with scores
 */
export const findSimilarMessagesVectorSearch = async (query, Message, limit = 5, sessionId = null) => {
  try {
    // Import the embedding generation function
    const { generateEmbedding } = await import('./embeddingUtils.js');
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) {
      logError('Failed to generate embedding for query', { query });
      return [];
    }

    // Build the aggregation pipeline for vector search
    const pipeline = [
      {
        $vectorSearch: {
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: limit * 10, // Get more candidates for better results
          limit: limit,
          index: "default", // Your vector search index name
        }
      },
      {
        $project: {
          content: 1,
          role: 1,
          sentiment: 1,
          sessionId: 1,
          createdAt: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];

    // Add session filter if provided
    if (sessionId) {
      pipeline.unshift({
        $match: {
          sessionId: new Message.base.Types.ObjectId(sessionId),
          embedding: { $exists: true }
        }
      });
    } else {
      pipeline.unshift({
        $match: {
          embedding: { $exists: true }
        }
      });
    }

    // Execute the vector search
    const results = await Message.aggregate(pipeline);

    logInfo('Vector search completed', { 
      queryLength: query.length, 
      resultsCount: results.length,
      sessionId: sessionId || 'all'
    });

    return results;
  } catch (error) {
    logError('Error in vector search', { 
      error: error.message, 
      query: query.substring(0, 100) 
    });
    
    // Fallback to basic search if vector search fails
    return await fallbackToBasicSearch(query, Message, limit, sessionId);
  }
};

/**
 * Fallback to basic text search when vector search is not available
 * @param {string} query - The query text
 * @param {mongoose.Model} Message - The Message model
 * @param {number} limit - Maximum number of results to return
 * @param {string} sessionId - Optional session ID to filter results
 * @returns {Promise<Array>} - Array of messages
 */
const fallbackToBasicSearch = async (query, Message, limit = 5, sessionId = null) => {
  try {
    const filter = { embedding: { $exists: true } };
    if (sessionId) {
      filter.sessionId = new Message.base.Types.ObjectId(sessionId);
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('content role sentiment sessionId createdAt metadata');

    logInfo('Fallback to basic search', { 
      resultsCount: messages.length,
      sessionId: sessionId || 'all'
    });

    return messages.map(msg => ({
      ...msg.toObject(),
      score: 0.5 // Default score for fallback results
    }));
  } catch (error) {
    logError('Error in fallback search', { error: error.message });
    return [];
  }
};

/**
 * Check if vector search is available in the current MongoDB setup
 * @param {mongoose.Model} Message - The Message model
 * @returns {Promise<boolean>} - Whether vector search is available
 */
export const isVectorSearchAvailable = async (Message) => {
  try {
    // Try to run a simple vector search query to test availability
    const testEmbedding = new Array(768).fill(0.1); // Test embedding
    
    await Message.aggregate([
      {
        $vectorSearch: {
          queryVector: testEmbedding,
          path: "embedding",
          numCandidates: 1,
          limit: 1,
          index: "default",
        }
      }
    ]);

    return true;
  } catch (error) {
    logError('Vector search not available', { error: error.message });
    return false;
  }
};

/**
 * Get vector search statistics
 * @param {mongoose.Model} Message - The Message model
 * @returns {Promise<Object>} - Vector search statistics
 */
export const getVectorSearchStats = async (Message) => {
  try {
    const totalMessages = await Message.countDocuments();
    const messagesWithEmbeddings = await Message.countDocuments({ 
      embedding: { $exists: true } 
    });
    const vectorSearchAvailable = await isVectorSearchAvailable(Message);

    return {
      totalMessages,
      messagesWithEmbeddings,
      vectorSearchAvailable,
      embeddingCoverage: messagesWithEmbeddings / totalMessages
    };
  } catch (error) {
    logError('Error getting vector search stats', { error: error.message });
    return {
      totalMessages: 0,
      messagesWithEmbeddings: 0,
      vectorSearchAvailable: false,
      embeddingCoverage: 0
    };
  }
}; 