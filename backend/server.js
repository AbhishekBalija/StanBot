import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { chatRouter } from './routes/chat.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || 'https://stan-bot.vercel.app'
    : true, // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware for production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use('/api/', limiter);
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };
    
    const conn = await mongoose.connect(
      process.env.MONGODB_URI,
      mongoOptions
    );
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Continue running the server even if MongoDB connection fails
    console.log('Server will run without database functionality');
    
    if (process.env.NODE_ENV === 'production') {
      // In production, you might want to exit if database is critical
      // Uncomment the next line if database is required
      // process.exit(1);
    }
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Graceful shutdown...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM. Graceful shutdown...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

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
  res.json({ 
    message: 'STAN AI Chatbot API is running', 
    status: 'healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (process.env.NODE_ENV === 'production') {
    // Don't leak error details in production
    res.status(err.status || 500).json({
      error: 'Internal server error',
      message: 'Something went wrong'
    });
  } else {
    // Detailed error in development
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack
    });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});