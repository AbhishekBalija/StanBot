import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { chatRouter } from './routes/chat.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stan-chatbot');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Continue running the server even if MongoDB connection fails
    console.log('Server will run without database functionality');
  }
};

// Check Gemini API key
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
  console.warn('WARNING: Gemini API key is not set or is using a placeholder value.');
  console.warn('The chatbot will not be able to generate responses without a valid API key.');
  console.warn('Please set a valid GEMINI_API_KEY in your .env file.');
}

// Routes
app.use('/api/chat', chatRouter);

// Health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});