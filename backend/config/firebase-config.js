const functions = require('firebase-functions');

/**
 * Firebase Configuration Manager
 * Handles environment variables from Firebase Functions config and local environment
 */
const config = {
  // Supabase Configuration
  supabase: {
    url: functions.config().supabase?.url || process.env.SUPABASE_URL,
    anonKey: functions.config().supabase?.anon_key || process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: functions.config().supabase?.service_role_key || process.env.SUPABASE_SERVICE_ROLE_KEY
  },

  // AI Service Configuration
  ai: {
    geminiKey: functions.config().ai?.gemini_key || process.env.GEMINI_API_KEY,
    openaiKey: functions.config().ai?.openai_key || process.env.OPENAI_API_KEY
  },

  // Authentication Configuration
  auth: {
    jwtSecret: functions.config().auth?.jwt_secret || process.env.JWT_SECRET
  },

  // Email Configuration
  email: {
    smtpHost: functions.config().email?.smtp_host || process.env.SMTP_HOST,
    smtpPort: functions.config().email?.smtp_port || process.env.SMTP_PORT,
    smtpUser: functions.config().email?.smtp_user || process.env.SMTP_USER,
    smtpPass: functions.config().email?.smtp_pass || process.env.SMTP_PASS
  },

  // OAuth Configuration
  oauth: {
    googleClientId: functions.config().oauth?.google_client_id || process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: functions.config().oauth?.google_client_secret || process.env.GOOGLE_CLIENT_SECRET
  },

  // Twilio Configuration
  twilio: {
    accountSid: functions.config().twilio?.account_sid || process.env.TWILIO_ACCOUNT_SID,
    authToken: functions.config().twilio?.auth_token || process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: functions.config().twilio?.phone_number || process.env.TWILIO_PHONE_NUMBER
  },

  // Stripe Configuration
  stripe: {
    secretKey: functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY,
    publishableKey: functions.config().stripe?.publishable_key || process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET
  },

  // Security Configuration
  security: {
    corsOrigin: functions.config().security?.cors_origin || process.env.CORS_ORIGIN,
    rateLimitWindow: parseInt(functions.config().security?.rate_limit_window || process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    rateLimitMax: parseInt(functions.config().security?.rate_limit_max || process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  },

  // Application Configuration
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  }
};

/**
 * Validate required configuration
 * @returns {Object} Validation result
 */
function validateConfig() {
  const required = [
    'supabase.url',
    'supabase.anonKey',
    'auth.jwtSecret'
  ];

  const missing = [];

  for (const key of required) {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    if (!value) {
      missing.push(key);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    config: {
      ...config,
      // Hide sensitive values in logs
      supabase: {
        url: config.supabase.url,
        anonKey: config.supabase.anonKey ? '[HIDDEN]' : undefined,
        serviceRoleKey: config.supabase.serviceRoleKey ? '[HIDDEN]' : undefined
      },
      auth: {
        jwtSecret: config.auth.jwtSecret ? '[HIDDEN]' : undefined
      },
      ai: {
        geminiKey: config.ai.geminiKey ? '[HIDDEN]' : undefined,
        openaiKey: config.ai.openaiKey ? '[HIDDEN]' : undefined
      },
      email: {
        smtpHost: config.email.smtpHost,
        smtpPort: config.email.smtpPort,
        smtpUser: config.email.smtpUser,
        smtpPass: config.email.smtpPass ? '[HIDDEN]' : undefined
      },
      oauth: {
        googleClientId: config.oauth.googleClientId ? '[HIDDEN]' : undefined,
        googleClientSecret: config.oauth.googleClientSecret ? '[HIDDEN]' : undefined
      },
      twilio: {
        accountSid: config.twilio.accountSid ? '[HIDDEN]' : undefined,
        authToken: config.twilio.authToken ? '[HIDDEN]' : undefined,
        phoneNumber: config.twilio.phoneNumber
      },
      stripe: {
        secretKey: config.stripe.secretKey ? '[HIDDEN]' : undefined,
        publishableKey: config.stripe.publishableKey ? '[HIDDEN]' : undefined,
        webhookSecret: config.stripe.webhookSecret ? '[HIDDEN]' : undefined
      }
    }
  };
}

/**
 * Get configuration for a specific service
 * @param {string} service - Service name (supabase, ai, auth, etc.)
 * @returns {Object} Service configuration
 */
function getServiceConfig(service) {
  return config[service] || {};
}

/**
 * Check if running in Firebase Functions environment
 * @returns {boolean}
 */
function isFirebaseFunctions() {
  return typeof functions !== 'undefined' && functions.config;
}

/**
 * Check if running in development environment
 * @returns {boolean}
 */
function isDevelopment() {
  return config.app.nodeEnv === 'development';
}

/**
 * Check if running in production environment
 * @returns {boolean}
 */
function isProduction() {
  return config.app.nodeEnv === 'production';
}

module.exports = {
  config,
  validateConfig,
  getServiceConfig,
  isFirebaseFunctions,
  isDevelopment,
  isProduction
};

