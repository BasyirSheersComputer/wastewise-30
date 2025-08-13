# 🚀 Firebase Deployment Guide - WasteWise

## **📋 Table of Contents**
1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Environment Configuration](#environment-configuration)
4. [Secrets Management](#secrets-management)
5. [Backend Configuration](#backend-configuration)
6. [Frontend Configuration](#frontend-configuration)
7. [Deployment Process](#deployment-process)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## **✅ Prerequisites**

### **Required Tools**
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Install Node.js 18+ and npm
node --version  # Should be 18+
npm --version   # Should be 8+

# Install project dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

### **Required Accounts**
- ✅ Firebase account with billing enabled
- ✅ Supabase account with project created
- ✅ Google Cloud account (for additional services)

---

## **🔥 Firebase Project Setup**

### **Step 1: Initialize Firebase Project**
```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select the following:
✅ Hosting: Configure files for Firebase Hosting
✅ Functions: Configure a Cloud Functions directory and its files
✅ Firestore: Configure security rules and indexes
✅ Storage: Configure security rules
✅ Emulators: Set up local emulators for Firebase products
```

### **Step 2: Configure Project Settings**
```bash
# Set your Firebase project
firebase use wastewise-30

# Verify project configuration
firebase projects:list
```

---

## **🔐 Environment Configuration**

### **Step 1: Create Environment Files**

#### **Development Environment** (`.env.development`)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Frontend Configuration
VITE_API_URL=http://localhost:5001/wastewise-30/us-central1/api
VITE_FRONTEND_URL=http://localhost:5173

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

#### **Production Environment** (`.env.production`)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Frontend Configuration
VITE_API_URL=https://us-central1-wastewise-30.cloudfunctions.net/api
VITE_FRONTEND_URL=https://wastewise-30.web.app

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### **Step 2: Backend Environment Variables**

#### **Local Development** (`.env`)
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# AI Service Configuration
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Application Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe Configuration (if enabled)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Security Configuration
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## **🔒 Secrets Management**

### **Method 1: Firebase Functions Config (Recommended)**

#### **Set Environment Variables**
```bash
# Set Supabase configuration
firebase functions:config:set supabase.url="https://your-project-id.supabase.co"
firebase functions:config:set supabase.anon_key="your-anon-key-here"
firebase functions:config:set supabase.service_role_key="your-service-role-key-here"

# Set AI service keys
firebase functions:config:set ai.gemini_key="your-gemini-api-key"
firebase functions:config:set ai.openai_key="your-openai-api-key"

# Set JWT secret
firebase functions:config:set auth.jwt_secret="your-super-secure-jwt-secret-key-here"

# Set email configuration
firebase functions:config:set email.smtp_host="smtp.gmail.com"
firebase functions:config:set email.smtp_port="587"
firebase functions:config:set email.smtp_user="your-email@gmail.com"
firebase functions:config:set email.smtp_pass="your-app-password"

# Set Google OAuth
firebase functions:config:set oauth.google_client_id="your-google-client-id"
firebase functions:config:set oauth.google_client_secret="your-google-client-secret"

# Set Twilio configuration
firebase functions:config:set twilio.account_sid="your-twilio-account-sid"
firebase functions:config:set twilio.auth_token="your-twilio-auth-token"
firebase functions:config:set twilio.phone_number="+1234567890"

# Set Stripe configuration (if enabled)
firebase functions:config:set stripe.secret_key="sk_test_your_stripe_secret_key"
firebase functions:config:set stripe.publishable_key="pk_test_your_stripe_publishable_key"
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"

# Set security configuration
firebase functions:config:set security.cors_origin="https://wastewise-30.web.app"
firebase functions:config:set security.rate_limit_window="900000"
firebase functions:config:set security.rate_limit_max="100"
```

#### **View Current Configuration**
```bash
# View all configuration
firebase functions:config:get

# View specific configuration
firebase functions:config:get supabase
firebase functions:config:get ai
```

#### **Update Backend to Use Firebase Config**
Create `backend/config/firebase-config.js`:
```javascript
const functions = require('firebase-functions');

const config = {
  supabase: {
    url: functions.config().supabase?.url || process.env.SUPABASE_URL,
    anonKey: functions.config().supabase?.anon_key || process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: functions.config().supabase?.service_role_key || process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  ai: {
    geminiKey: functions.config().ai?.gemini_key || process.env.GEMINI_API_KEY,
    openaiKey: functions.config().ai?.openai_key || process.env.OPENAI_API_KEY
  },
  auth: {
    jwtSecret: functions.config().auth?.jwt_secret || process.env.JWT_SECRET
  },
  email: {
    smtpHost: functions.config().email?.smtp_host || process.env.SMTP_HOST,
    smtpPort: functions.config().email?.smtp_port || process.env.SMTP_PORT,
    smtpUser: functions.config().email?.smtp_user || process.env.SMTP_USER,
    smtpPass: functions.config().email?.smtp_pass || process.env.SMTP_PASS
  },
  oauth: {
    googleClientId: functions.config().oauth?.google_client_id || process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: functions.config().oauth?.google_client_secret || process.env.GOOGLE_CLIENT_SECRET
  },
  twilio: {
    accountSid: functions.config().twilio?.account_sid || process.env.TWILIO_ACCOUNT_SID,
    authToken: functions.config().twilio?.auth_token || process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: functions.config().twilio?.phone_number || process.env.TWILIO_PHONE_NUMBER
  },
  stripe: {
    secretKey: functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY,
    publishableKey: functions.config().stripe?.publishable_key || process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET
  },
  security: {
    corsOrigin: functions.config().security?.cors_origin || process.env.CORS_ORIGIN,
    rateLimitWindow: functions.config().security?.rate_limit_window || process.env.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: functions.config().security?.rate_limit_max || process.env.RATE_LIMIT_MAX_REQUESTS
  }
};

module.exports = config;
```

### **Method 2: Google Secret Manager (Enterprise)**

#### **Install Secret Manager**
```bash
# Install Google Cloud SDK
gcloud auth login
gcloud config set project wastewise-30

# Create secrets
gcloud secrets create supabase-url --data-file=- <<< "https://your-project-id.supabase.co"
gcloud secrets create supabase-anon-key --data-file=- <<< "your-anon-key-here"
gcloud secrets create jwt-secret --data-file=- <<< "your-super-secure-jwt-secret-key-here"
```

#### **Access Secrets in Functions**
```javascript
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const name = `projects/wastewise-30/secrets/${secretName}/versions/latest`;
  const [version] = await client.accessSecretVersion({name});
  return version.payload.data.toString();
}
```

---

## **⚙️ Backend Configuration**

### **Step 1: Update Supabase Client**
Update `backend/services/supabaseClient.js`:
```javascript
const { createClient } = require('@supabase/supabase-js');
const config = require('../config/firebase-config');

const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

module.exports = supabase;
```

### **Step 2: Update Environment Loading**
Update `backend/index.js`:
```javascript
// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Import Firebase config
const config = require('./config/firebase-config');

// Use config throughout your application
console.log('Environment:', process.env.NODE_ENV);
console.log('Supabase URL:', config.supabase.url);
```

### **Step 3: Update CORS Configuration**
Update CORS in your routes:
```javascript
const cors = require('cors');
const config = require('../config/firebase-config');

const corsOptions = {
  origin: [
    'https://wastewise-30.web.app',
    'https://wastewise-30.firebaseapp.com',
    'http://localhost:5000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
```

---

## **🎨 Frontend Configuration**

### **Step 1: Update Environment Variables**
Update `frontend/.env.production`:
```bash
# Production API URL
VITE_API_URL=https://us-central1-wastewise-30.cloudfunctions.net/api

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### **Step 2: Update API Service**
Update `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // ... rest of the service
}
```

### **Step 3: Update Vite Configuration**
Update `frontend/vite.config.ts`:
```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/',
    plugins: [react()],
    server: {
      port: 5173,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['lucide-react', 'framer-motion'],
            charts: ['recharts'],
            forms: ['react-hook-form', 'zod', '@hookform/resolvers']
          }
        }
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      __APP_VERSION__: JSON.stringify(env.npm_package_version || '1.0.0')
    }
  };
});
```

---

## **🚀 Deployment Process**

### **Step 1: Build Frontend**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Verify build output
ls -la dist/
```

### **Step 2: Deploy Backend Functions**
```bash
# Navigate to project root
cd ..

# Deploy functions only
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:api
```

### **Step 3: Deploy Frontend**
```bash
# Deploy hosting
firebase deploy --only hosting

# Or deploy everything
firebase deploy
```

### **Step 4: Verify Deployment**
```bash
# Check deployment status
firebase hosting:channel:list

# Test API endpoints
curl https://us-central1-wastewise-30.cloudfunctions.net/api/health

# Test frontend
open https://wastewise-30.web.app
```

---

## **📊 Monitoring & Maintenance**

### **Step 1: Set Up Monitoring**
```bash
# Enable Firebase Analytics
firebase analytics:enable

# Set up error reporting
firebase functions:config:set monitoring.error_reporting="true"
```

### **Step 2: Set Up Logging**
```bash
# View function logs
firebase functions:log

# View hosting logs
firebase hosting:channel:list

# Set up log retention
firebase functions:config:set logging.retention_days="30"
```

### **Step 3: Performance Monitoring**
```bash
# Enable performance monitoring
firebase perf:enable

# Set up custom metrics
firebase functions:config:set monitoring.custom_metrics="true"
```

---

## **🔧 Troubleshooting**

### **Common Issues**

#### **1. Functions Deployment Fails**
```bash
# Check function logs
firebase functions:log --only api

# Verify environment variables
firebase functions:config:get

# Test locally
firebase emulators:start --only functions
```

#### **2. CORS Issues**
```bash
# Update CORS configuration
firebase functions:config:set security.cors_origin="https://wastewise-30.web.app"

# Redeploy functions
firebase deploy --only functions
```

#### **3. Environment Variables Not Loading**
```bash
# Verify config is set
firebase functions:config:get

# Check function code
firebase functions:config:get > .runtimeconfig.json
firebase emulators:start --only functions
```

#### **4. Frontend Build Issues**
```bash
# Clear cache
rm -rf frontend/node_modules/.vite
rm -rf frontend/dist

# Reinstall dependencies
cd frontend && npm install

# Rebuild
npm run build
```

### **Debug Commands**
```bash
# Check Firebase project
firebase projects:list

# Check current project
firebase use

# View all configurations
firebase functions:config:get

# Test functions locally
firebase emulators:start

# View deployment history
firebase hosting:channel:list
```

---

## **📈 Performance Optimization**

### **1. Function Optimization**
```javascript
// Use connection pooling
const pool = new Pool({
  connectionString: config.supabase.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Implement caching
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

### **2. Frontend Optimization**
```typescript
// Implement lazy loading
const Dashboard = lazy(() => import('./components/Dashboard'));
const Analytics = lazy(() => import('./components/Analytics'));

// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});
```

### **3. CDN Configuration**
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

---

## **🔐 Security Best Practices**

### **1. Environment Variables**
- ✅ Never commit secrets to version control
- ✅ Use Firebase Functions Config for production
- ✅ Rotate secrets regularly
- ✅ Use least privilege principle

### **2. API Security**
- ✅ Implement rate limiting
- ✅ Use HTTPS only
- ✅ Validate all inputs
- ✅ Implement proper CORS

### **3. Authentication**
- ✅ Use Supabase Auth
- ✅ Implement proper session management
- ✅ Use secure JWT tokens
- ✅ Enable MFA where possible

---

## **📞 Support & Resources**

### **Useful Commands**
```bash
# Quick deployment
npm run deploy:all

# Development setup
npm run dev:all

# Production deployment
npm run deploy:prod

# Rollback deployment
firebase hosting:clone wastewise-30:live wastewise-30:rollback
```

### **Documentation Links**
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

### **Monitoring Tools**
- Firebase Console
- Google Cloud Console
- Supabase Dashboard
- Custom monitoring scripts

---

This guide provides a comprehensive setup for deploying WasteWise to Firebase with proper secrets management, environment configuration, and security best practices. Follow each section carefully to ensure a successful deployment.

