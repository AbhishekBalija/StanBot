# STAN AI Chatbot Backend - Production Deployment Guide

## Render Deployment

### Prerequisites
1. MongoDB Atlas account with a cluster set up
2. Google Gemini API key
3. GitHub repository with your code

### Environment Variables for Render

Set these environment variables in your Render dashboard:

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
GEMINI_API_KEY=your_actual_gemini_api_key
JWT_SECRET=your_strong_jwt_secret_min_32_characters
JWT_EXPIRE=30d
CLIENT_URL=https://stan-bot.vercel.app
```

### Render Configuration

1. **Service Type**: Web Service
2. **Environment**: Node
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Node Version**: 18+ (specified in package.json engines)

### Security Features Enabled

- **CORS**: Configured to only allow requests from your frontend domain
- **Helmet**: Security headers for production
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Request Size Limits**: 10MB limit for JSON payloads
- **Error Handling**: Production-safe error responses

### Health Check

Your deployed API will have a health check endpoint at:
```
GET https://your-render-url.onrender.com/
```

Response:
```json
{
  "message": "STAN AI Chatbot API is running",
  "status": "healthy",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Add your Render IP addresses to the IP whitelist (or use 0.0.0.0/0 for all IPs)
4. Create a database user with read/write permissions
5. Get your connection string and add it to Render environment variables

### Post-Deployment Checklist

- [ ] Health check endpoint returns 200
- [ ] MongoDB connection is successful
- [ ] Gemini API integration works
- [ ] CORS allows requests from your frontend
- [ ] Rate limiting is active
- [ ] Error handling returns safe responses
- [ ] Frontend can successfully communicate with backend

### Monitoring

- Check Render logs for any errors
- Monitor MongoDB Atlas for connection issues
- Test API endpoints regularly
- Monitor rate limiting effectiveness

### Troubleshooting

**Common Issues:**

1. **CORS Errors**: Ensure CLIENT_URL matches your frontend domain exactly
2. **MongoDB Connection**: Check connection string and IP whitelist
3. **API Key Issues**: Verify Gemini API key is valid and has sufficient quota
4. **Rate Limiting**: Adjust limits if legitimate traffic is being blocked

**Logs to Check:**
- Render deployment logs
- Runtime logs in Render dashboard
- MongoDB Atlas logs

### Performance Optimization

- MongoDB connection pooling is configured (max 10 connections)
- Request timeouts are set appropriately
- Graceful shutdown handling for zero-downtime deployments