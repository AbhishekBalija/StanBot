import { ChatSession } from '../models/ChatSession.js';
import { Message } from '../models/Message.js';
import { generateResponse, analyzeUserSentiment } from '../services/geminiService.js';
import { logError, logWarn, logInfo } from '../utils/logger.js';

/**
 * Process an incoming chat message
 * @route POST /api/chat
 */
export const processMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    // Get or create a chat session
    let session;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
    } else {
      // Create a new session if none exists
      session = await ChatSession.create({
        lastActive: new Date(),
      });
    }

    // Update session activity
    session.lastActive = new Date();
    await session.save();

    // Check if Gemini API key is valid
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Save user message without sentiment analysis
      await Message.create({
        sessionId: session._id,
        content: message,
        role: 'user',
        sentiment: 'neutral',
      });

      // Return a message about the missing API key
      return res.status(200).json({
        message: "I'm sorry, but I can't generate a response right now. The Gemini API key is not configured. Please set a valid API key in the server's .env file.",
        sessionId: session._id,
        error: 'GEMINI_API_KEY_MISSING'
      });
    }

    // Analyze user sentiment (optional)
    let sentiment;
    try {
      sentiment = await analyzeUserSentiment(message);
    } catch (error) {
      logError('Error analyzing sentiment', { error: error.message, message });
      sentiment = 'neutral'; // Default to neutral on error
    }
    
    // Save user message
    const userMessage = await Message.create({
      sessionId: session._id,
      content: message,
      role: 'user',
      sentiment: sentiment,
    });

    // Get recent conversation history
    const conversationHistory = await Message.find({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .sort({ createdAt: 1 });

    // Generate AI response
    let aiResponse;
    try {
      aiResponse = await generateResponse(message, conversationHistory, sentiment);
    } catch (error) {
      logError('Error generating response', { error: error.message, message });
      aiResponse = "I'm sorry, but I'm having trouble processing your request right now. Please try again later.";
    }

    // Save AI response
    const botMessage = await Message.create({
      sessionId: session._id,
      content: aiResponse,
      role: 'assistant',
    });

    // Return response with session info
    return res.status(200).json({
      message: aiResponse,
      sessionId: session._id,
    });
  } catch (error) {
    logError('Error processing message', { error: error.message, sessionId });
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};