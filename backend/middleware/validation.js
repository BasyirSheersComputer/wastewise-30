/**
 * Comprehensive Validation Middleware for Servora AI
 * Provides input validation, sanitization, and security checks
 */

import { body, param, query, validationResult } from 'express-validator';
import logger from '../utils/logger.js';

/**
 * Middleware to handle validation errors
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.apiError(req.method, req.path, new Error(`Validation failed: ${JSON.stringify(errors.array())}`));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Common validation rules
 */
export const commonValidations = {
  // UUID validation
  uuid: (field) => param(field).isUUID().withMessage(`Valid ${field} ID required`),
  
  // Email validation
  email: (field = 'email') => body(field)
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address required'),
  
  // Password validation
  password: (field = 'password') => body(field)
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  // Name validation
  name: (field = 'name') => body(field)
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  
  // Phone validation
  phone: (field = 'phone') => body(field)
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number required'),
  
  // URL validation
  url: (field = 'url') => body(field)
    .optional()
    .isURL()
    .withMessage('Valid URL required'),
  
  // Date validation
  date: (field = 'date') => body(field)
    .optional()
    .isISO8601()
    .withMessage('Valid date required (ISO 8601 format)'),
  
  // Positive number validation
  positiveNumber: (field, min = 0) => body(field)
    .isFloat({ min })
    .withMessage(`${field} must be a positive number`),
  
  // Integer validation
  integer: (field, min = 0) => body(field)
    .isInt({ min })
    .withMessage(`${field} must be a positive integer`),
  
  // String length validation
  stringLength: (field, min = 1, max = 255) => body(field)
    .trim()
    .isLength({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} characters`),
  
  // Optional string validation
  optionalString: (field, max = 255) => body(field)
    .optional()
    .trim()
    .isLength({ max })
    .withMessage(`${field} must be less than ${max} characters`),
  
  // Boolean validation
  boolean: (field) => body(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} must be a boolean value`),
  
  // Array validation
  array: (field, minItems = 0) => body(field)
    .optional()
    .isArray({ min: minItems })
    .withMessage(`${field} must be an array with at least ${minItems} items`),
  
  // Query parameter validation
  queryString: (field, max = 255) => query(field)
    .optional()
    .trim()
    .isLength({ max })
    .withMessage(`${field} must be less than ${max} characters`),
  
  queryInt: (field, min = 0) => query(field)
    .optional()
    .isInt({ min })
    .withMessage(`${field} must be a positive integer`),
  
  queryUuid: (field) => query(field)
    .optional()
    .isUUID()
    .withMessage(`Valid ${field} ID required`),
  
  queryDate: (field) => query(field)
    .optional()
    .isISO8601()
    .withMessage(`Valid ${field} date required (ISO 8601 format)`)
};

/**
 * Inventory validation rules
 */
export const inventoryValidations = {
  create: [
    commonValidations.stringLength('name', 1, 100),
    commonValidations.stringLength('category', 1, 50),
    commonValidations.stringLength('description', 0, 500),
    commonValidations.positiveNumber('cost_per_unit'),
    commonValidations.positiveNumber('selling_price'),
    commonValidations.integer('current_stock'),
    commonValidations.integer('min_stock', 0),
    commonValidations.integer('max_stock', 1),
    commonValidations.stringLength('unit', 1, 20),
    commonValidations.optionalString('supplier'),
    commonValidations.queryUuid('outlet_id'),
    body('expiry_date').optional().isISO8601().withMessage('Valid expiry date required'),
    body('batch_number').optional().trim().isLength({ max: 50 }).withMessage('Batch number must be less than 50 characters'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
  ],
  
  update: [
    commonValidations.uuid('id'),
    commonValidations.optionalString('name', 100),
    commonValidations.optionalString('category', 50),
    commonValidations.optionalString('description', 500),
    body('cost_per_unit').optional().isFloat({ min: 0 }).withMessage('Cost per unit must be a positive number'),
    body('selling_price').optional().isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
    body('current_stock').optional().isInt({ min: 0 }).withMessage('Current stock must be a positive integer'),
    body('min_stock').optional().isInt({ min: 0 }).withMessage('Min stock must be a positive integer'),
    body('max_stock').optional().isInt({ min: 1 }).withMessage('Max stock must be a positive integer'),
    commonValidations.optionalString('unit', 20),
    commonValidations.optionalString('supplier'),
    body('expiry_date').optional().isISO8601().withMessage('Valid expiry date required'),
    body('batch_number').optional().trim().isLength({ max: 50 }).withMessage('Batch number must be less than 50 characters'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
  ],
  
  get: [
    commonValidations.queryUuid('outlet_id'),
    commonValidations.queryString('category'),
    commonValidations.queryString('search'),
    commonValidations.queryInt('page', 1),
    commonValidations.queryInt('limit', 1),
    query('sort_by').optional().isIn(['name', 'category', 'current_stock', 'cost_per_unit', 'created_at']).withMessage('Invalid sort field'),
    query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
  ]
};

/**
 * Waste tracking validation rules
 */
export const wasteValidations = {
  create: [
    commonValidations.stringLength('category', 1, 50),
    commonValidations.stringLength('reason', 1, 200),
    commonValidations.positiveNumber('quantity'),
    commonValidations.stringLength('unit', 1, 20),
    commonValidations.positiveNumber('cost'),
    commonValidations.queryUuid('outlet_id'),
    commonValidations.queryUuid('item_id'),
    body('waste_date').optional().isISO8601().withMessage('Valid waste date required'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
    body('is_tracked').optional().isBoolean().withMessage('is_tracked must be a boolean')
  ],
  
  update: [
    commonValidations.uuid('id'),
    commonValidations.optionalString('category', 50),
    commonValidations.optionalString('reason', 200),
    body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
    commonValidations.optionalString('unit', 20),
    body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
    body('waste_date').optional().isISO8601().withMessage('Valid waste date required'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
    body('is_tracked').optional().isBoolean().withMessage('is_tracked must be a boolean')
  ],
  
  get: [
    commonValidations.queryUuid('outlet_id'),
    commonValidations.queryString('category'),
    commonValidations.queryDate('start_date'),
    commonValidations.queryDate('end_date'),
    commonValidations.queryInt('page', 1),
    commonValidations.queryInt('limit', 1),
    query('sort_by').optional().isIn(['waste_date', 'category', 'quantity', 'cost', 'created_at']).withMessage('Invalid sort field'),
    query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
  ]
};

/**
 * Suppliers validation rules
 */
export const suppliersValidations = {
  create: [
    commonValidations.stringLength('name', 1, 100),
    commonValidations.stringLength('contact_person', 1, 100),
    commonValidations.email('email'),
    commonValidations.phone('phone'),
    commonValidations.url('website'),
    commonValidations.stringLength('address', 1, 500),
    commonValidations.stringLength('city', 1, 100),
    commonValidations.stringLength('state', 1, 100),
    commonValidations.stringLength('country', 1, 100),
    commonValidations.stringLength('postal_code', 1, 20),
    body('payment_terms').optional().trim().isLength({ max: 200 }).withMessage('Payment terms must be less than 200 characters'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
  ],
  
  update: [
    commonValidations.uuid('id'),
    commonValidations.optionalString('name', 100),
    commonValidations.optionalString('contact_person', 100),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email address required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    body('website').optional().isURL().withMessage('Valid URL required'),
    commonValidations.optionalString('address', 500),
    commonValidations.optionalString('city', 100),
    commonValidations.optionalString('state', 100),
    commonValidations.optionalString('country', 100),
    commonValidations.optionalString('postal_code', 20),
    body('payment_terms').optional().trim().isLength({ max: 200 }).withMessage('Payment terms must be less than 200 characters'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
  ],
  
  get: [
    commonValidations.queryString('search'),
    commonValidations.queryString('city'),
    commonValidations.queryString('state'),
    commonValidations.queryInt('page', 1),
    commonValidations.queryInt('limit', 1),
    query('sort_by').optional().isIn(['name', 'city', 'created_at']).withMessage('Invalid sort field'),
    query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
  ]
};

/**
 * Outlets validation rules
 */
export const outletsValidations = {
  create: [
    commonValidations.stringLength('name', 1, 100),
    commonValidations.stringLength('address', 1, 500),
    commonValidations.stringLength('city', 1, 100),
    commonValidations.stringLength('state', 1, 100),
    commonValidations.stringLength('country', 1, 100),
    commonValidations.stringLength('postal_code', 1, 20),
    commonValidations.phone('phone'),
    commonValidations.email('email'),
    body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    body('timezone').optional().trim().isLength({ max: 50 }).withMessage('Timezone must be less than 50 characters'),
    body('opening_hours').optional().isObject().withMessage('Opening hours must be an object'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
  ],
  
  update: [
    commonValidations.uuid('id'),
    commonValidations.optionalString('name', 100),
    commonValidations.optionalString('address', 500),
    commonValidations.optionalString('city', 100),
    commonValidations.optionalString('state', 100),
    commonValidations.optionalString('country', 100),
    commonValidations.optionalString('postal_code', 20),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email address required'),
    body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    body('timezone').optional().trim().isLength({ max: 50 }).withMessage('Timezone must be less than 50 characters'),
    body('opening_hours').optional().isObject().withMessage('Opening hours must be an object'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
  ],
  
  get: [
    commonValidations.queryString('search'),
    commonValidations.queryString('city'),
    commonValidations.queryString('state'),
    commonValidations.queryInt('page', 1),
    commonValidations.queryInt('limit', 1),
    query('sort_by').optional().isIn(['name', 'city', 'created_at']).withMessage('Invalid sort field'),
    query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
  ]
};

/**
 * Analytics validation rules
 */
export const analyticsValidations = {
  demandForecast: [
    commonValidations.queryUuid('outlet_id'),
    commonValidations.queryUuid('item_id'),
    commonValidations.queryInt('days', 1)
  ],
  
  wastePrediction: [
    commonValidations.queryUuid('outlet_id'),
    commonValidations.queryString('category'),
    commonValidations.queryInt('days', 1)
  ],
  
  inventoryOptimization: [
    commonValidations.queryUuid('outlet_id')
  ],
  
  trendAnalysis: [
    query('metric').isIn(['waste', 'sales', 'inventory', 'cost']).withMessage('Valid metric required'),
    commonValidations.queryString('period'),
    commonValidations.queryUuid('outlet_id')
  ],
  
  comparativeAnalysis: [
    query('type').isIn(['outlets', 'periods']).withMessage('Valid comparison type required'),
    query('metric').isIn(['waste', 'sales', 'efficiency', 'cost']).withMessage('Valid metric required')
  ],
  
  customReport: [
    commonValidations.stringLength('name', 1, 100),
    commonValidations.array('metrics', 1),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    query('format').optional().isIn(['json', 'csv', 'pdf']).withMessage('Valid format required')
  ]
};

/**
 * User validation rules
 */
export const userValidations = {
  register: [
    commonValidations.email(),
    commonValidations.password(),
    commonValidations.stringLength('first_name', 1, 50),
    commonValidations.stringLength('last_name', 1, 50),
    commonValidations.stringLength('company_name', 1, 100),
    commonValidations.stringLength('industry', 1, 50),
    commonValidations.phone('phone'),
    body('accept_terms').isBoolean().withMessage('Terms acceptance required')
  ],
  
  login: [
    commonValidations.email(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  
  updateProfile: [
    commonValidations.optionalString('first_name', 50),
    commonValidations.optionalString('last_name', 50),
    commonValidations.optionalString('company_name', 100),
    commonValidations.optionalString('industry', 50),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    body('timezone').optional().trim().isLength({ max: 50 }).withMessage('Timezone must be less than 50 characters'),
    body('language').optional().trim().isLength({ max: 10 }).withMessage('Language must be less than 10 characters')
  ],
  
  changePassword: [
    body('current_password').notEmpty().withMessage('Current password is required'),
    commonValidations.password('new_password'),
    body('confirm_password').custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
  ]
};

/**
 * CSV Upload validation rules
 */
export const csvUploadValidations = {
  upload: [
    param('type').isIn(['inventory', 'waste', 'suppliers', 'outlets', 'sales']).withMessage('Valid CSV type required'),
    body('outlet_id').optional().isUUID().withMessage('Valid outlet ID required'),
    body('overwrite_existing').optional().isBoolean().withMessage('overwrite_existing must be a boolean'),
    body('validate_only').optional().isBoolean().withMessage('validate_only must be a boolean')
  ]
};

/**
 * Billing validation rules
 */
export const billingValidations = {
  createSubscription: [
    body('plan_id').isUUID().withMessage('Valid plan ID required'),
    body('payment_method_id').optional().isString().withMessage('Payment method ID required'),
    body('coupon_code').optional().trim().isLength({ max: 50 }).withMessage('Coupon code must be less than 50 characters')
  ],
  
  updateSubscription: [
    body('subscription_id').isUUID().withMessage('Valid subscription ID required'),
    body('plan_id').isUUID().withMessage('Valid plan ID required'),
    body('payment_method_id').optional().isString().withMessage('Payment method ID required')
  ]
};

/**
 * Sanitization middleware
 */
export const sanitizeInput = (req, res, next) => {
  // Recursively sanitize string inputs
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * File upload validation middleware
 */
export const validateFileUpload = (options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['text/csv', 'application/csv'],
    required = true
  } = options;

  return (req, res, next) => {
    if (!req.file && required) {
      return res.status(400).json({
        success: false,
        message: 'File upload required'
      });
    }

    if (req.file) {
      // Check file size
      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`
        });
      }

      // Check file type
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
        });
      }

      // Check file extension for CSV
      if (allowedTypes.includes('text/csv') && !req.file.originalname.toLowerCase().endsWith('.csv')) {
        return res.status(400).json({
          success: false,
          message: 'File must have .csv extension'
        });
      }
    }

    next();
  };
};

/**
 * Rate limiting by user ID
 */
export const createUserRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // requests per window
    message = 'Too many requests from this user'
  } = options;

  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user || !req.user.id) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (userRequests.has(userId)) {
      const requests = userRequests.get(userId).filter(time => time > windowStart);
      userRequests.set(userId, requests);
    } else {
      userRequests.set(userId, []);
    }

    const userRequestTimes = userRequests.get(userId);

    if (userRequestTimes.length >= max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    userRequestTimes.push(now);
    next();
  };
};

/**
 * IP whitelist middleware
 */
export const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (!allowedIPs.includes(clientIP)) {
      logger.apiError(req.method, req.path, new Error(`IP ${clientIP} not whitelisted`));
      return res.status(403).json({
        success: false,
        message: 'Access denied from this IP address'
      });
    }

    next();
  };
};

/**
 * Request size limit middleware
 */
export const requestSizeLimit = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxBytes = parseSize(maxSize);

    if (contentLength > maxBytes) {
      return res.status(413).json({
        success: false,
        message: `Request size exceeds maximum allowed size of ${maxSize}`
      });
    }

    next();
  };
};

/**
 * Helper function to parse size strings like "10mb", "5kb"
 */
const parseSize = (size) => {
  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';

  return value * (units[unit] || 1);
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

export default {
  validateRequest,
  commonValidations,
  inventoryValidations,
  wasteValidations,
  suppliersValidations,
  outletsValidations,
  analyticsValidations,
  userValidations,
  csvUploadValidations,
  billingValidations,
  sanitizeInput,
  validateFileUpload,
  createUserRateLimit,
  ipWhitelist,
  requestSizeLimit,
  securityHeaders
};
