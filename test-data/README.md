# STAN AI Chatbot Test Suite

## Overview

This test suite provides comprehensive test cases and tools for validating the STAN AI Chatbot functionality. The tests cover all key requirements including human-like interaction, personalized memory, context awareness, technical implementation, and edge cases.

## Test Suite Structure

```
/test-data/
├── README.md                       # This file
├── human-like-interaction.json     # Tests for conversation quality and tone adaptation
├── personalized-memory.json        # Tests for memory capabilities
├── context-awareness.json          # Tests for context handling
├── technical-and-edge-cases.json   # Tests for technical implementation and edge cases
├── test-runner.js                  # Script to execute tests
└── /results/                       # Directory for test results (created automatically)
```

## Test Categories

1. **Human-Like Interaction Tests** - Verify the chatbot's ability to engage in natural conversation and adapt its tone based on user sentiment.

2. **Personalized Memory Tests** - Validate the chatbot's ability to remember information within and across sessions.

3. **Context Awareness Tests** - Test the chatbot's ability to maintain context over multiple turns and handle topic changes.

4. **Technical Implementation Tests** - Verify the proper functioning of backend components like MongoDB connection and API integration.

5. **Edge Case Tests** - Test the chatbot's handling of unusual inputs and situations.

## Running Tests

### Prerequisites

- Node.js installed
- STAN AI Chatbot backend running on port 5001
- MongoDB running (for database-related tests)

### Installation

```bash
npm install axios
```

### Running the Test Runner

```bash
node test-runner.js
```

The test runner will:
1. Display available test files
2. Allow you to select a test file or run all tests
3. Execute the selected tests
4. Prompt for evaluation of each response
5. Save results to the `/results` directory

## Manual Testing

You can also use the test cases as a guide for manual testing:

1. Open the relevant JSON file (e.g., `human-like-interaction.json`)
2. Follow the conversation flow, sending each user message to the chatbot
3. Compare the responses to the expected behavior
4. Document your findings

## Adding New Tests

To add new tests:

1. Create a new test case in the appropriate JSON file following the existing format
2. For conversation tests, include user messages and expected responses with evaluation criteria
3. For technical tests, include clear steps and expected behavior

## Test Results

Test results are saved as JSON files in the `/results` directory with the following information:

- Test ID and name
- Timestamp
- For conversation tests: each exchange with user message, bot response, and evaluation
- For technical tests: notes and observations
- Overall pass/fail status

## Continuous Testing

It's recommended to run these tests:

- After any significant code changes
- Before deploying to production
- Periodically to ensure ongoing functionality

## Troubleshooting

If tests are failing:

1. Check that the backend server is running on port 5001
2. Verify MongoDB connection (for database tests)
3. Check that the Gemini API key is valid
4. Review server logs for any errors
5. Ensure all dependencies are installed