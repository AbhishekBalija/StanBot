/**
 * Production-ready logging utility
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} - Formatted log message
 */
const formatLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
};

/**
 * Log error messages
 * @param {string} message - Error message
 * @param {Object} meta - Additional metadata
 */
export const logError = (message, meta = {}) => {
  if (currentLogLevel >= LOG_LEVELS.ERROR) {
    console.error(formatLog('ERROR', message, meta));
  }
};

/**
 * Log warning messages
 * @param {string} message - Warning message
 * @param {Object} meta - Additional metadata
 */
export const logWarn = (message, meta = {}) => {
  if (currentLogLevel >= LOG_LEVELS.WARN) {
    console.warn(formatLog('WARN', message, meta));
  }
};

/**
 * Log info messages
 * @param {string} message - Info message
 * @param {Object} meta - Additional metadata
 */
export const logInfo = (message, meta = {}) => {
  if (currentLogLevel >= LOG_LEVELS.INFO) {
    console.log(formatLog('INFO', message, meta));
  }
};

/**
 * Log debug messages
 * @param {string} message - Debug message
 * @param {Object} meta - Additional metadata
 */
export const logDebug = (message, meta = {}) => {
  if (currentLogLevel >= LOG_LEVELS.DEBUG) {
    console.log(formatLog('DEBUG', message, meta));
  }
};

/**
 * Log API requests for monitoring
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} responseTime - Response time in milliseconds
 */
export const logApiRequest = (req, res, responseTime) => {
  const meta = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  };
  
  if (res.statusCode >= 400) {
    logWarn(`API Request: ${req.method} ${req.originalUrl}`, meta);
  } else {
    logInfo(`API Request: ${req.method} ${req.originalUrl}`, meta);
  }
}; 