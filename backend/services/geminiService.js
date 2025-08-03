import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { logError, logWarn } from '../utils/logger.js';

dotenv.config();

// Initialize Google Generative AI client with specific API endpoint
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
});

/**
 * Generate a response using Google's Gemini API
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {string} sentiment - Detected sentiment of the user's message
 * @returns {Promise<string>} - The generated response
 */
export const generateResponse = async (userMessage, conversationHistory, sentiment = null) => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Check if this is a new conversation
    const isNewConversation = conversationHistory.length === 0;
    
    // Log conversation state for debugging
    logInfo('Generating response', {
      isNewConversation,
      conversationHistoryLength: conversationHistory.length,
      userMessage: userMessage.substring(0, 100),
      conversationHistory: conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content.substring(0, 50)
      }))
    });
    
    // Create a chat session
    const chat = model.startChat({
      history: formatConversationHistory(conversationHistory),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    // Add system prompt based on sentiment and conversation state
    let systemPrompt = getSystemPrompt(sentiment);
    if (isNewConversation) {
      systemPrompt += `
        
        CRITICAL: This is a BRAND NEW conversation with a NEW user. 
        - This is the FIRST message in this conversation
        - There are NO previous messages or interactions
        - Do NOT reference any previous conversations
        - Do NOT say things like "as I mentioned before", "as we discussed earlier", "I just told you", etc.
        - Do NOT assume the user has asked questions before
        - Start completely fresh and respond as if this is the first time you're meeting this user
        - Be welcoming and introduce yourself naturally
        - If they ask your name, simply tell them your name without referencing previous conversations
      `;
    }

    await chat.sendMessage(systemPrompt);
    
    // Send the user message and get response
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    
    return response.text();
  } catch (error) {
    logError('Error generating response with Gemini', { error: error.message });
    return 'I apologize, but I\'m having trouble processing your request right now. Please try again later.';
  }
};

/**
 * Format conversation history for Gemini API
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @returns {Array} - Formatted conversation history
 */
const formatConversationHistory = (conversationHistory) => {
  return conversationHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
};

/**
 * Get the system prompt based on user sentiment
 * @param {string} sentiment - Detected sentiment
 * @returns {string} - Appropriate system prompt
 */
const getSystemPrompt = (sentiment) => {
  // Base personality and capabilities
  let prompt = `
    You are STAN, a friendly and helpful AI assistant with a distinct personality. 
    You are empathetic, thoughtful, and occasionally witty. 
    You should maintain a consistent identity throughout the conversation.
    
    Your responses should be:
    - Conversational and natural-sounding
    - Helpful and informative
    - Respectful of the user's questions and concerns
    - Concise but thorough (aim for 1-3 paragraphs unless the user asks for more detail)
    
    IMPORTANT: Only reference information that has actually been shared in this specific conversation.
    - If this is the first message in a conversation, do NOT reference any previous interactions
    - Do NOT assume the user has asked questions before unless they actually have in this conversation
    - Do NOT mention "as I mentioned before" or "as we discussed earlier" unless those topics were actually discussed in this conversation
    - Each conversation should start fresh for new users
    
    Avoid:
    - Making up information you don't know
    - Being overly formal or robotic
    - Providing harmful, illegal, or unethical advice
    - Referencing conversations that haven't actually happened
  `;

  // Adapt tone based on detected sentiment
  if (sentiment === 'negative') {
    prompt += `
      The user seems to be expressing negative emotions. Be especially empathetic and supportive.
      Acknowledge their feelings and offer a compassionate response.
      Use a warm, understanding tone and avoid being overly cheerful.
    `;
  } else if (sentiment === 'positive') {
    prompt += `
      The user seems to be in a positive mood. Match their energy with an upbeat, enthusiastic tone.
      Feel free to be more conversational and include appropriate humor if it fits the context.
    `;
  }

  return prompt;
};

/**
 * Analyze the sentiment of a user message using Gemini
 * @param {string} message - The user's message
 * @returns {Promise<string>} - The detected sentiment (positive, negative, neutral)
 */
export const analyzeUserSentiment = async (message) => {
  try {
    // Skip sentiment analysis for very short messages
    if (message.length < 5) {
      return 'neutral';
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `
      You are a sentiment analysis tool. Analyze the sentiment of the following message and respond with exactly one word: "positive", "negative", or "neutral".
      
      Message: ${message}
      
      Sentiment:
    `;
    
    const result = await model.generateContent(prompt);
    const sentiment = result.response.text().toLowerCase().trim();
    
    // Validate the response
    if (['positive', 'negative', 'neutral'].includes(sentiment)) {
      return sentiment;
    }
    
    return 'neutral'; // Default fallback
  } catch (error) {
    logError('Error analyzing sentiment with Gemini', { error: error.message });
    return 'neutral'; // Default to neutral on error
  }
};

/**
 * Generate embeddings for a text string using Gemini
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