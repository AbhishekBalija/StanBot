# 🧠 STAN AI Chatbot

## 🎯 Overview

STAN AI Chatbot is a human-like conversational agent designed for consumer-facing platforms. It goes beyond basic Q&A systems by demonstrating:

- Human-like empathy and tone adaptation  
- Memory and personalization across sessions  
- Context-awareness and identity consistency  
- Scalable and efficient architecture  

## 📌 Key Features

1. **Human-Like Interaction**
   - Emotionally engaging, diverse, natural conversations
   - Adapts tone based on context and user sentiment

2. **Personalized Memory**
   - Long-term memory: recalls user info, preferences, chat history
   - Evolves over time with personalized responses

3. **Technical Implementation**
   - Uses Google's Gemini API for natural language processing
   - MongoDB for persistent storage of conversations
   - React frontend with modern UI/UX

## 💻 Technical Architecture

- **Backend Stack**: Node.js + Express.js with MongoDB
- **Frontend**: React.js with Tailwind CSS
- **Memory/Context Store**: MongoDB for document-based data storage
- **LLM Integration**: Google Gemini API
- **Memory Strategy**: Session + persistent memory via MongoDB

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Google Gemini API key

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/stan-chatbot.git
cd stan-chatbot
```

2. Set up the backend

```bash
cd backend
npm install
```

3. Configure environment variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/stan-chatbot
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Set up the frontend

```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server

```bash
cd backend
npm run dev
```

2. Start the frontend development server

```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## 🧪 Testing

### Quick Test Scenarios

| # | Scenario | How to Test |
|---|----------|-------------|
| ✅ 1 | Long-Term Memory Recall | Chat, rejoin after delay, see if it remembers |
| ✅ 2 | Tone Adaptation | Say "I'm sad" → bot should react empathetically |
| ✅ 3 | Personalization | Repeat themes (e.g., anime), bot should reuse |
| ✅ 4 | Naturalness | Say "hi" 10x → observe variation in replies |
| ✅ 5 | Identity Consistency | Ask "What's your name?" multiple times |
| ✅ 6 | Hallucination Resistance | Ask vague/false prompts — avoid made-up facts |
| ✅ 7 | Memory Stability | Give conflicting info, test for graceful fallback |

### Comprehensive Test Suite

A comprehensive test suite is available in the `/test-data` directory. This suite includes:

1. **Human-Like Interaction Tests** - Verify natural conversation and tone adaptation
2. **Personalized Memory Tests** - Validate memory within and across sessions
3. **Context Awareness Tests** - Test context maintenance and topic handling
4. **Technical Implementation Tests** - Verify backend components functionality
5. **Edge Case Tests** - Test handling of unusual inputs

#### Running the Test Suite

```bash
cd test-data
npm install
npm test
```

See the `/test-data/README.md` file for detailed information on the test suite.

## 📁 Project Structure

```
/
├── backend/               # Express server
│   ├── controllers/       # Request handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   │   ├── geminiService.js # Gemini API integration
│   │   └── sentimentService.js # Sentiment analysis
│   └── server.js          # Entry point
│
├── frontend/              # React application
│   ├── public/            # Static assets
│   └── src/               # React components
│       ├── components/    # UI components
│       ├── App.jsx        # Main component
│       └── main.jsx       # Entry point
│
└── test-data/             # Comprehensive test suite
    ├── human-like-interaction.json    # Conversation tests
    ├── personalized-memory.json       # Memory tests
    ├── context-awareness.json         # Context tests
    ├── technical-and-edge-cases.json  # Technical tests
    └── test-runner.js                 # Test execution script
```

## 🛠 Technologies Used

| Layer | Technologies |
|-------|-------------|
| Backend | Node.js, Express.js, MongoDB |
| Frontend | React, Tailwind CSS |
| AI | Google Gemini API |
| State Management | React Hooks |
| Styling | Tailwind CSS |

## 📄 License

MIT

---

> Build smart. Build with personality. Build something memorable.

