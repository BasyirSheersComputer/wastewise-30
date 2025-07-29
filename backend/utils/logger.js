// logger.js
import dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  constructor() {
    this.timestamp = () => new Date().toISOString();
  }

  info(message, data = {}) {
    console.log(`[INFO] ${this.timestamp()} - ${message}`, data);
  }

  warn(message, data = {}) {
    console.warn(`[WARN] ${this.timestamp()} - ${message}`, data);
  }

  error(message, error = null) {
    console.error(`[ERROR] ${this.timestamp()} - ${message}`, error);
  }

  debug(message, data = {}) {
    if (isDevelopment) {
      console.log(`[DEBUG] ${this.timestamp()} - ${message}`, data);
    }
  }

  // AI service specific logging
  aiRequest(provider, prompt, startTime) {
    this.info(`AI Request - Provider: ${provider}`, {
      promptLength: prompt.length,
      timestamp: startTime
    });
  }

  aiResponse(provider, response, startTime) {
    const duration = Date.now() - startTime;
    this.info(`AI Response - Provider: ${provider}`, {
      responseLength: response.length,
      duration: `${duration}ms`
    });
  }

  aiError(provider, error) {
    this.error(`AI Error - Provider: ${provider}`, error);
  }

  // Database specific logging
  dbQuery(table, operation, duration) {
    this.debug(`Database ${operation} on ${table}`, { duration: `${duration}ms` });
  }

  dbError(table, operation, error) {
    this.error(`Database Error - ${operation} on ${table}`, error);
  }

  // API specific logging
  apiRequest(method, path, userId = null) {
    this.info(`API Request - ${method} ${path}`, { userId });
  }

  apiResponse(method, path, statusCode, duration) {
    this.info(`API Response - ${method} ${path}`, {
      statusCode,
      duration: `${duration}ms`
    });
  }

  apiError(method, path, error) {
    this.error(`API Error - ${method} ${path}`, error);
  }
}

export const logger = new Logger();
export default logger;
