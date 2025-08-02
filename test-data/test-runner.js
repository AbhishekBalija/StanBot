/**
 * STAN AI Chatbot Test Runner
 * 
 * This script helps execute and document test cases for the STAN AI Chatbot.
 * It can be used to run conversation-based tests and record results.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');

// Configuration
const CONFIG = {
  apiEndpoint: 'http://localhost:5001/api/chat',
  testDataDir: path.join(__dirname),
  resultsDir: path.join(__dirname, 'results'),
  // Don't pre-generate a session ID, let the backend create it
  useBackendSessionIds: true
};

// Ensure results directory exists
if (!fs.existsSync(CONFIG.resultsDir)) {
  fs.mkdirSync(CONFIG.resultsDir, { recursive: true });
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Load test data from a JSON file
 * @param {string} filename - The name of the test file
 * @returns {Object} The parsed test data
 */
function loadTestData(filename) {
  const filePath = path.join(CONFIG.testDataDir, filename);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading test data from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Send a message to the chatbot API
 * @param {string} message - The message to send
 * @param {string} sessionId - The session ID to use (optional)
 * @returns {Promise<Object>} The API response
 */
async function sendMessage(message, sessionId) {
  try {
    // Only include sessionId in the request if it's provided and not using backend-generated IDs
    const requestData = { message };
    if (sessionId && !CONFIG.useBackendSessionIds) {
      requestData.sessionId = sessionId;
    }
    
    const response = await axios.post(CONFIG.apiEndpoint, requestData);
    return response.data;
  } catch (error) {
    console.error('Error sending message to API:', error.message);
    if (error.response) {
      console.error('API response:', error.response.data);
    }
    return { error: error.message };
  }
}

/**
 * Run a conversation test
 * @param {Object} test - The test object containing conversation data
 * @returns {Promise<Object>} The test results
 */
async function runConversationTest(test) {
  console.log(`\n=== Running Test: ${test.testId} - ${test.testName} ===\n`);
  
  const results = {
    testId: test.testId,
    testName: test.testName,
    timestamp: new Date().toISOString(),
    exchanges: [],
    passed: true
  };
  
  const conversation = test.conversation || [];
  let sessionId = null; // Start with no session ID, will be set by the first API response
  
  for (let i = 0; i < conversation.length; i++) {
    const message = conversation[i];
    
    if (message.role === 'user') {
      console.log(`USER: ${message.content}`);
      
      // Send message to API
      const response = await sendMessage(message.content, sessionId);
      
      // Store the session ID returned by the API for subsequent messages
      if (response.sessionId) {
        sessionId = response.sessionId;
      }
      
      // Get next expected message if available
      const expected = (i + 1 < conversation.length && conversation[i + 1].role === 'expected') 
        ? conversation[i + 1] 
        : null;
      
      // Record exchange
      const exchange = {
        userMessage: message.content,
        botResponse: response.message || response.error || 'No response',
        sessionId: sessionId // Store the session ID with the exchange
      };
      
      if (expected) {
        exchange.expected = expected.content;
        exchange.evaluation = expected.evaluation;
        
        // Ask for user evaluation
        console.log(`BOT: ${exchange.botResponse}`);
        console.log(`\nEXPECTED: ${expected.content}`);
        console.log(`EVALUATION CRITERIA: ${expected.evaluation}`);
        
        const passed = await new Promise(resolve => {
          rl.question('Did the response meet the criteria? (y/n): ', answer => {
            resolve(answer.toLowerCase() === 'y');
          });
        });
        
        exchange.passed = passed;
        if (!passed) results.passed = false;
        
        // Skip the expected message in the next iteration
        i++;
      } else {
        console.log(`BOT: ${exchange.botResponse}`);
      }
      
      results.exchanges.push(exchange);
    }
  }
  
  // Save test results
  const resultsPath = path.join(CONFIG.resultsDir, `${test.testId}-results.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log(`\n=== Test ${test.testId} ${results.passed ? 'PASSED' : 'FAILED'} ===\n`);
  console.log(`Results saved to ${resultsPath}`);
  
  return results;
}

/**
 * Run a multi-session test
 * @param {Object} test - The test object containing multiple session data
 * @returns {Promise<Object>} The test results
 */
async function runMultiSessionTest(test) {
  console.log(`\n=== Running Multi-Session Test: ${test.testId} - ${test.testName} ===\n`);
  
  const results = {
    testId: test.testId,
    testName: test.testName,
    timestamp: new Date().toISOString(),
    sessions: [],
    passed: true
  };
  
  const sessions = test.sessions || [];
  
  for (const session of sessions) {
    console.log(`\n--- Starting Session: ${session.sessionId} ---\n`);
    
    const sessionResult = {
      sessionId: session.sessionId, // This is just a label for the test session
      exchanges: [],
      passed: true
    };
    
    // Start with no session ID, will be set by the first API response
    let sessionIdForApi = null;
    const conversation = session.conversation || [];
    
    for (let i = 0; i < conversation.length; i++) {
      const message = conversation[i];
      
      if (message.role === 'user') {
        console.log(`USER: ${message.content}`);
        
        // Send message to API
        const response = await sendMessage(message.content, sessionIdForApi);
        
        // Store the session ID returned by the API for subsequent messages
        if (response.sessionId) {
          sessionIdForApi = response.sessionId;
        }
        
        // Get next expected message if available
        const expected = (i + 1 < conversation.length && conversation[i + 1].role === 'expected') 
          ? conversation[i + 1] 
          : null;
        
        // Record exchange
        const exchange = {
          userMessage: message.content,
          botResponse: response.message || response.error || 'No response',
          sessionId: sessionIdForApi // Store the session ID with the exchange
        };
        
        if (expected) {
          exchange.expected = expected.content;
          exchange.evaluation = expected.evaluation;
          
          // Ask for user evaluation
          console.log(`BOT: ${exchange.botResponse}`);
          console.log(`\nEXPECTED: ${expected.content}`);
          console.log(`EVALUATION CRITERIA: ${expected.evaluation}`);
          
          const passed = await new Promise(resolve => {
            rl.question('Did the response meet the criteria? (y/n): ', answer => {
              resolve(answer.toLowerCase() === 'y');
            });
          });
          
          exchange.passed = passed;
          if (!passed) {
            sessionResult.passed = false;
            results.passed = false;
          }
          
          // Skip the expected message in the next iteration
          i++;
        } else {
          console.log(`BOT: ${exchange.botResponse}`);
        }
        
        sessionResult.exchanges.push(exchange);
      }
    }
    
    results.sessions.push(sessionResult);
    console.log(`\n--- Session ${session.sessionId} ${sessionResult.passed ? 'PASSED' : 'FAILED'} ---\n`);
    
    if (session !== sessions[sessions.length - 1]) {
      await new Promise(resolve => {
        rl.question('Press Enter to continue to the next session...', () => {
          resolve();
        });
      });
    }
  }
  
  // Save test results
  const resultsPath = path.join(CONFIG.resultsDir, `${test.testId}-results.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log(`\n=== Multi-Session Test ${test.testId} ${results.passed ? 'PASSED' : 'FAILED'} ===\n`);
  console.log(`Results saved to ${resultsPath}`);
  
  return results;
}

/**
 * Run a technical implementation test
 * @param {Object} test - The test object containing technical test data
 * @returns {Promise<Object>} The test results
 */
async function runTechnicalTest(test) {
  console.log(`\n=== Running Technical Test: ${test.testId} - ${test.testName} ===\n`);
  console.log(`Description: ${test.testData.description}`);
  
  if (test.testData.setup) {
    console.log(`\nSetup: ${test.testData.setup}`);
  }
  
  if (test.testData.checkpoints) {
    console.log('\nCheckpoints:');
    test.testData.checkpoints.forEach((checkpoint, index) => {
      console.log(`${index + 1}. ${checkpoint}`);
    });
  }
  
  if (test.testData.steps) {
    console.log('\nSteps:');
    test.testData.steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });
  }
  
  const results = {
    testId: test.testId,
    testName: test.testName,
    timestamp: new Date().toISOString(),
    notes: '',
    passed: false
  };
  
  // Get user input for test results
  results.notes = await new Promise(resolve => {
    rl.question('\nEnter test notes and observations: ', notes => {
      resolve(notes);
    });
  });
  
  results.passed = await new Promise(resolve => {
    rl.question('Did the test pass? (y/n): ', answer => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
  
  // Save test results
  const resultsPath = path.join(CONFIG.resultsDir, `${test.testId}-results.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log(`\n=== Test ${test.testId} ${results.passed ? 'PASSED' : 'FAILED'} ===\n`);
  console.log(`Results saved to ${resultsPath}`);
  
  return results;
}

/**
 * Main function to run tests
 */
async function main() {
  console.log('=== STAN AI Chatbot Test Runner ===');
  
  // List available test files
  const testFiles = fs.readdirSync(CONFIG.testDataDir)
    .filter(file => file.endsWith('.json') && !file.includes('results'));
  
  console.log('\nAvailable test files:');
  testFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  
  // Get user selection
  const fileIndex = await new Promise(resolve => {
    rl.question('\nSelect a test file (number): ', answer => {
      const index = parseInt(answer) - 1;
      resolve(index >= 0 && index < testFiles.length ? index : 0);
    });
  });
  
  const selectedFile = testFiles[fileIndex];
  const tests = loadTestData(selectedFile);
  
  if (!tests) {
    console.log('No tests found or error loading tests. Exiting.');
    rl.close();
    return;
  }
  
  console.log(`\nLoaded ${tests.length} tests from ${selectedFile}`);
  console.log('\nAvailable tests:');
  tests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.testId} - ${test.testName}`);
  });
  
  // Get user selection for which test to run
  const testIndex = await new Promise(resolve => {
    rl.question('\nSelect a test to run (number), or 0 for all: ', answer => {
      const index = parseInt(answer);
      resolve(index >= 0 && index <= tests.length ? index : 0);
    });
  });
  
  if (testIndex === 0) {
    // Run all tests
    for (const test of tests) {
      if (test.sessions) {
        await runMultiSessionTest(test);
      } else if (test.conversation) {
        await runConversationTest(test);
      } else if (test.testData) {
        await runTechnicalTest(test);
      }
    }
  } else {
    // Run selected test
    const selectedTest = tests[testIndex - 1];
    if (selectedTest.sessions) {
      await runMultiSessionTest(selectedTest);
    } else if (selectedTest.conversation) {
      await runConversationTest(selectedTest);
    } else if (selectedTest.testData) {
      await runTechnicalTest(selectedTest);
    }
  }
  
  console.log('\nAll tests completed!');
  rl.close();
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Error running tests:', error);
    rl.close();
  });
}

// Export functions for direct use
module.exports = {
  runConversationTest,
  runMultiSessionTest,
  runTechnicalTest,
  sendMessage,
  loadTestData
};