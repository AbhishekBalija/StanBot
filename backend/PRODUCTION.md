# 🚀 STAN AI Chatbot - Production Deployment Guide

## 📋 Prerequisites

Before deploying to production, ensure you have:

- [ ] Node.js 18+ installed
- [ ] MongoDB Atlas account (or self-hosted MongoDB)
- [ ] Google Gemini API key
- [ ] Domain name for your frontend (optional but recommended)
- [ ] SSL certificate (handled by most cloud providers)

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=5001

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stan-chatbot?retryWrites=true&w=majority

# AI Service Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Security Configuration
JWT_SECRET=your_strong_jwt_secret_min_32_characters
JWT_EXPIRE=30d

# CORS Configuration
CLIENT_URL=https://your-frontend-domain.com

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging (optional)
LOG_LEVEL=info

# Health Check (optional)
HEALTH_CHECK_ENABLED=true
```

### Environment Variable Details

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `development` |
| `PORT` | Server port | No | `5000` |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRE` | JWT expiration time | No | `30d` |
| `CLIENT_URL` | Frontend URL for CORS | Yes | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | `100` |
| `LOG_LEVEL` | Logging level | No | `info` |
| `HEALTH_CHECK_ENABLED` | Enable health check | No | `true` |

## 🏗️ Deployment Options

### Option 1: Render (Recommended)

1. **Create Render Account**
   - Sign up at [render.com](https://render.com)
   - Connect your GitHub repository

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure the service:
     - **Name**: `stan-chatbot-backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Node Version**: `18`

3. **Set Environment Variables**
   - Go to your service → "Environment"
   - Add all required environment variables from above

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your application

### Option 2: Railway

1. **Create Railway Account**
   - Sign up at [railway.app](https://railway.app)
   - Connect your GitHub repository

2. **Deploy Service**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Node.js

3. **Configure Environment**
   - Go to "Variables" tab
   - Add all required environment variables

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set GEMINI_API_KEY=your_api_key
   # ... add all other variables
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. **Create DigitalOcean Account**
   - Sign up at [digitalocean.com](https://digitalocean.com)

2. **Create App**
   - Go to "Apps" → "Create App"
   - Connect your GitHub repository
   - Select Node.js environment

3. **Configure Environment**
   - Add all environment variables in the app settings

4. **Deploy**
   - Click "Create Resources"

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Atlas Account**
   - Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)

2. **Create Cluster**
   - Choose "Shared" (free tier) or "Dedicated"
   - Select your preferred cloud provider and region

3. **Configure Network Access**
   - Go to "Network Access"
   - Add your deployment platform's IP or use `0.0.0.0/0` for all IPs

4. **Create Database User**
   - Go to "Database Access"
   - Create a new user with read/write permissions

5. **Get Connection String**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string and replace `<password>` with your user's password

### Self-Hosted MongoDB

If using self-hosted MongoDB:

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mongodb

   # macOS
   brew install mongodb-community
   ```

2. **Start MongoDB**
   ```bash
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

3. **Create Database**
   ```bash
   mongo
   use stan-chatbot
   ```

## 🔒 Security Considerations

### API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Monitor API usage for unusual patterns

### CORS Configuration
- Restrict CORS to your frontend domain only
- Avoid using `*` in production
- Use HTTPS for all production traffic

### Rate Limiting
- Configure appropriate rate limits for your use case
- Monitor rate limit effectiveness
- Adjust limits based on legitimate traffic patterns

### Database Security
- Use strong passwords for database users
- Enable MongoDB authentication
- Restrict network access to database
- Regularly backup your data

## 📊 Monitoring & Logging

### Health Checks
Your application includes a health check endpoint at `/` that returns:
- Application status
- Database connection status
- API key configuration status
- Memory usage
- Uptime

### Logging
The application uses structured logging with configurable levels:
- `ERROR`: Critical errors
- `WARN`: Warning messages
- `INFO`: General information
- `DEBUG`: Detailed debugging (development only)

### Monitoring Setup
Consider setting up:
- Application performance monitoring (APM)
- Error tracking (Sentry, LogRocket)
- Uptime monitoring (Pingdom, UptimeRobot)
- Database monitoring (MongoDB Atlas provides this)

## 🚀 Post-Deployment Checklist

After deployment, verify:

- [ ] Health check endpoint returns 200 status
- [ ] Database connection is successful
- [ ] Gemini API integration works
- [ ] CORS allows requests from your frontend
- [ ] Rate limiting is active
- [ ] Error handling returns safe responses
- [ ] Frontend can successfully communicate with backend
- [ ] SSL certificate is valid (if using custom domain)
- [ ] Logs are being generated correctly
- [ ] Environment variables are properly set

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `CLIENT_URL` matches your frontend domain exactly
   - Check that your frontend is using HTTPS if backend is HTTPS

2. **MongoDB Connection Issues**
   - Verify connection string format
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

3. **API Key Issues**
   - Verify Gemini API key is valid
   - Check API quota and billing
   - Ensure key has necessary permissions

4. **Rate Limiting Problems**
   - Adjust rate limits if legitimate traffic is being blocked
   - Check if you're behind a proxy or load balancer

### Debug Commands

```bash
# Check application logs
heroku logs --tail  # Heroku
railway logs        # Railway
# Check via platform dashboard for other providers

# Test health endpoint
curl https://your-backend-url.com/

# Test API endpoint
curl -X POST https://your-backend-url.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "sessionId": "test"}'
```

## 📈 Performance Optimization

### Database Optimization
- Create indexes on frequently queried fields
- Use MongoDB Atlas for managed performance
- Monitor query performance

### Application Optimization
- Enable compression middleware
- Use connection pooling (already configured)
- Implement caching for frequently accessed data

### Scaling Considerations
- Use load balancers for high traffic
- Consider horizontal scaling with multiple instances
- Implement proper session management for multiple servers

## 🔄 CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Render
      env:
        RENDER_TOKEN: ${{ secrets.RENDER_TOKEN }}
        SERVICE_ID: ${{ secrets.SERVICE_ID }}
      run: |
        curl -X POST "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
          -H "Authorization: Bearer $RENDER_TOKEN" \
          -H "Content-Type: application/json"
```

## 📞 Support

For issues or questions:
1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Test the health check endpoint
4. Review the troubleshooting section above

---

**Happy Deploying! 🚀** 