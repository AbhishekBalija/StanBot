# STAN AI Chatbot - Backend

This is the backend server for the STAN AI Chatbot, built with Node.js, Express, and MongoDB.

## Features

- RESTful API for chat interactions
- MongoDB integration for persistent storage
- OpenAI integration for natural language processing
- Sentiment analysis for adaptive responses
- Session management for conversation context

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- OpenAI API key

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Make sure to add your OpenAI API key and MongoDB connection string.

3. Start the development server:

```bash
npm run dev
```

The server will start on port 5000 by default.

## API Endpoints

### POST /api/chat

Process a chat message and get a response.

**Request Body:**

```json
{
  "message": "Hello, how are you?",
  "sessionId": "optional-session-id"
}
```

**Response:**

```json
{
  "message": "I'm doing well, thank you for asking! How can I help you today?",
  "sessionId": "session-id"
}
```

## Architecture

The backend follows a modular architecture:

- **Controllers**: Handle API requests and responses
- **Models**: Define database schemas
- **Services**: Implement business logic
- **Routes**: Define API endpoints

## Memory Management

The chatbot uses a combination of short-term and long-term memory:

- **Session-based memory**: Tracks the current conversation
- **MongoDB storage**: Persists conversations for future reference
- **Sentiment analysis**: Adapts responses based on user emotions

## License

MIT