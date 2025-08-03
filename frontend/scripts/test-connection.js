#!/usr/bin/env node

/**
 * Test script to verify frontend-backend connection
 * 
 * This script tests the connection to the deployed backend
 * and verifies that the API endpoints are working correctly.
 */

const API_BASE_URL = 'https://stanbot-afxu.onrender.com';

/**
 * Test health endpoint
 */
async function testHealthEndpoint() {
  console.log('🏥 Testing health endpoint...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    
    console.log('✅ Health check passed!');
    console.log('📊 Backend Status:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return null;
  }
}

/**
 * Test chat endpoint
 */
async function testChatEndpoint() {
  console.log('\n💬 Testing chat endpoint...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message',
        sessionId: null
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Chat endpoint test passed!');
    console.log('🤖 Bot response:', data.message);
    console.log('🆔 Session ID:', data.sessionId);
    
    return data;
  } catch (error) {
    console.error('❌ Chat endpoint test failed:', error.message);
    return null;
  }
}

/**
 * Test CORS headers
 */
async function testCORS() {
  console.log('\n🌐 Testing CORS configuration...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    };
    
    console.log('✅ CORS headers found:');
    console.log('📋 CORS Configuration:', corsHeaders);
    
    return corsHeaders;
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
    return null;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting frontend-backend connection tests...\n');
  
  // Test health endpoint
  const healthData = await testHealthEndpoint();
  
  // Test chat endpoint
  const chatData = await testChatEndpoint();
  
  // Test CORS
  const corsData = await testCORS();
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log('🏥 Health Endpoint:', healthData ? '✅ PASS' : '❌ FAIL');
  console.log('💬 Chat Endpoint:', chatData ? '✅ PASS' : '❌ FAIL');
  console.log('🌐 CORS Configuration:', corsData ? '✅ PASS' : '❌ FAIL');
  
  const allTestsPassed = healthData && chatData && corsData;
  
  if (allTestsPassed) {
    console.log('\n🎉 All tests passed! Frontend can successfully connect to backend.');
    console.log('✅ Ready for deployment!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the backend configuration.');
    console.log('🔧 Check the backend logs and CORS settings.');
  }
  
  return allTestsPassed;
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export { runTests }; 