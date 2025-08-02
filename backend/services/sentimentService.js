import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze the sentiment of a user message
 * @param {string} message - The user's message
 * @returns {Promise<string>} - The detected sentiment (positive, negative, neutral)
 */
export const analyzeUserSentiment = async (message) => {
  try {
    // Skip sentiment analysis for very short messages
    if (message.length < 5) {
      return 'neutral';
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a sentiment analysis tool. Analyze the sentiment of the following message and respond with exactly one word: "positive", "negative", or "neutral".',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const sentiment = response.choices[0].message.content.toLowerCase().trim();
    
    // Validate the response
    if (['positive', 'negative', 'neutral'].includes(sentiment)) {
      return sentiment;
    }
    
    return 'neutral'; // Default fallback
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return 'neutral'; // Default to neutral on error
  }
};