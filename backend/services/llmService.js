import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a response using OpenAI's API
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {string} sentiment - Detected sentiment of the user's message
 * @returns {Promise<string>} - The generated response
 */
export const generateResponse = async (userMessage, conversationHistory, sentiment = null) => {
  try {
    // Format conversation history for the API
    const messages = [
      {
        role: 'system',
        content: getSystemPrompt(sentiment),
      },
      // Add conversation history
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // Use appropriate model based on your needs
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response:', error);
    return 'I apologize, but I\'m having trouble processing your request right now. Please try again later.';
  }
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