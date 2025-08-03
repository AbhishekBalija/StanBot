/**
 * API Configuration
 * 
 * This file contains the API configuration for the STAN AI Chatbot frontend.
 * Update the API_BASE_URL to point to your deployed backend.
 */

// Get API base URL from environment variables or use defaults
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://stanbot-afxu.onrender.com';

// Environment detection
export const IS_PRODUCTION = import.meta.env.VITE_APP_ENV === 'production' || import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.VITE_APP_ENV === 'development' || import.meta.env.DEV;

// API endpoints
export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  HEALTH: '/',
};

/**
 * Get the full URL for an API endpoint
 * @param {string} endpoint - The API endpoint path
 * @returns {string} - The full URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Get the chat API URL
 * @returns {string} - The chat API URL
 */
export const getChatApiUrl = () => {
  return getApiUrl(API_ENDPOINTS.CHAT);
};

/**
 * Get the health check API URL
 * @returns {string} - The health check API URL
 */
export const getHealthApiUrl = () => {
  return getApiUrl(API_ENDPOINTS.HEALTH);
};

/**
 * Make an API request with error handling
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - The response data
 */
export const makeApiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * Make a chat API request
 * @param {Object} data - The chat data
 * @returns {Promise<Object>} - The chat response
 */
export const makeChatRequest = async (data) => {
  return makeApiRequest(API_ENDPOINTS.CHAT, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Check backend health
 * @returns {Promise<Object>} - The health check response
 */
export const checkBackendHealth = async () => {
  return makeApiRequest(API_ENDPOINTS.HEALTH);
}; 