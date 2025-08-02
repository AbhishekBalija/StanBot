import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

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
    
    // Create a chat session
    const chat = model.startChat({
      history: formatConversationHistory(conversationHistory),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    // Add system prompt based on sentiment
    await chat.sendMessage(getSystemPrompt(sentiment));
    
    // Send the user message and get response
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    
    return response.text();
  } catch (error) {
    console.error('Error generating response with Gemini:', error);
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
    
    You have long-term memory and can recall information shared earlier in the conversation.
    You should reference relevant past interactions when appropriate to create a sense of continuity.
    
    Avoid:
    - Making up information you don't know
    - Being overly formal or robotic
    - Providing harmful, illegal, or unethical advice
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
    console.error('Error analyzing sentiment with Gemini:', error);
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
    console.error('Error generating embedding with Gemini:', error);
    return null;
  }
};