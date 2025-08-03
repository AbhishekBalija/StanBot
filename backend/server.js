import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { chatRouter } from './routes/chat.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logApiRequest, logInfo, logError, logWarn } from './utils/logger.js';

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

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    logApiRequest(req, res, responseTime);
  });
  next();
});

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
  
  // Rate limiting with configurable limits
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
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
    
    logInfo(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logError('MongoDB connection error', { error: err.message });
    });
    
    mongoose.connection.on('disconnected', () => {
      logWarn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logInfo('MongoDB reconnected');
    });
    
  } catch (error) {
    logError(`MongoDB Connection Error: ${error.message}`);
    
    if (process.env.NODE_ENV === 'production') {
      // In production, exit if database connection fails as it's critical
      logError('Critical: Database connection failed in production. Exiting...');
      process.exit(1);
    } else {
      // In development, continue running without database functionality
      logWarn('Server will run without database functionality');
    }
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logInfo('Received SIGINT. Graceful shutdown...');
  try {
    await mongoose.connection.close();
    logInfo('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    logError('Error during shutdown', { error: error.message });
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  logInfo('Received SIGTERM. Graceful shutdown...');
  try {
    await mongoose.connection.close();
    logInfo('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    logError('Error during shutdown', { error: error.message });
    process.exit(1);
  }
});

// Check Gemini API key
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
  logWarn('WARNING: Gemini API key is not set or is using a placeholder value.');
  logWarn('The chatbot will not be able to generate responses without a valid API key.');
  logWarn('Please set a valid GEMINI_API_KEY in your .env file.');
}

// Routes
app.use('/api/chat', chatRouter);

// Health check route
app.get('/', async (req, res) => {
  const healthCheck = {
    message: 'STAN AI Chatbot API is running',
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  // Check database connection
  if (mongoose.connection.readyState === 1) {
    healthCheck.database = 'connected';
  } else {
    healthCheck.database = 'disconnected';
    healthCheck.status = 'degraded';
  }

  // Check Gemini API key
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    healthCheck.gemini_api = 'configured';
  } else {
    healthCheck.gemini_api = 'not_configured';
    healthCheck.status = 'degraded';
  }

  // Check vector search availability (if database is connected)
  if (mongoose.connection.readyState === 1) {
    try {
      const { isVectorSearchAvailable } = await import('./utils/vectorSearch.js');
      const { Message } = await import('./models/Message.js');
      const vectorSearchAvailable = await isVectorSearchAvailable(Message);
      healthCheck.vectorSearch = vectorSearchAvailable ? 'available' : 'unavailable';
    } catch (error) {
      healthCheck.vectorSearch = 'error';
      logError('Error checking vector search availability', { error: error.message });
    }
  } else {
    healthCheck.vectorSearch = 'unknown';
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
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
  logError('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    url: req.originalUrl,
    method: req.method 
  });
  
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
  const server = app.listen(PORT, () => {
    logInfo(`🚀 STAN AI Chatbot API running on port ${PORT}`);
    logInfo(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logInfo(`🔗 Health check: http://localhost:${PORT}/`);
    
    if (process.env.NODE_ENV === 'production') {
      logInfo('🛡️  Production mode: Security features enabled');
      logInfo('📈 Rate limiting: Active');
      logInfo('🔒 CORS: Restricted to configured origins');
    }
  });

  // Handle server errors
  server.on('error', (error) => {
    logError('Server error', { error: error.message });
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
});