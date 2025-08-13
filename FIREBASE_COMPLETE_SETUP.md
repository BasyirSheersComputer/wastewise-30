# 🚀 Complete Firebase Setup Guide - WasteWise

## **📋 Overview**

This guide provides a complete setup for deploying the WasteWise application to Firebase, including:
- ✅ Firebase Hosting for the React frontend
- ✅ Firebase Functions for the Node.js backend
- ✅ Secure secrets management
- ✅ Environment configuration
- ✅ Automated deployment scripts
- ✅ Monitoring and maintenance

---

## **🔧 Quick Start**

### **1. Prerequisites**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

### **2. Initial Setup**
```bash
# Clone and setup project
git clone <your-repo>
cd wastewise-30

# Run environment setup script
chmod +x scripts/setup-firebase-env.sh
./scripts/setup-firebase-env.sh
```

### **3. Deploy**
```bash
# Deploy everything
chmod +x scripts/deploy-firebase.sh
./scripts/deploy-firebase.sh

# Or use PowerShell (Windows)
.\scripts\deploy-firebase.ps1
```

---

## **🔐 Secrets Management**

### **Method 1: Firebase Functions Config (Recommended)**

#### **Set Environment Variables**
```bash
# Supabase Configuration
firebase functions:config:set supabase.url="https://your-project-id.supabase.co"
firebase functions:config:set supabase.anon_key="your-anon-key-here"
firebase functions:config:set supabase.service_role_key="your-service-role-key-here"

# AI Service Keys
firebase functions:config:set ai.gemini_key="your-gemini-api-key"
firebase functions:config:set ai.openai_key="your-openai-api-key"

# JWT Secret
firebase functions:config:set auth.jwt_secret="your-super-secure-jwt-secret-key-here"

# Email Configuration
firebase functions:config:set email.smtp_host="smtp.gmail.com"
firebase functions:config:set email.smtp_port="587"
firebase functions:config:set email.smtp_user="your-email@gmail.com"
firebase functions:config:set email.smtp_pass="your-app-password"

# Google OAuth
firebase functions:config:set oauth.google_client_id="your-google-client-id"
firebase functions:config:set oauth.google_client_secret="your-google-client-secret"

# Twilio Configuration
firebase functions:config:set twilio.account_sid="your-twilio-account-sid"
firebase functions:config:set twilio.auth_token="your-twilio-auth-token"
firebase functions:config:set twilio.phone_number="+1234567890"

# Stripe Configuration
firebase functions:config:set stripe.secret_key="sk_test_your_stripe_secret_key"
firebase functions:config:set stripe.publishable_key="pk_test_your_stripe_publishable_key"
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"

# Security Configuration
firebase functions:config:set security.cors_origin="https://wastewise-30.web.app"
firebase functions:config:set security.rate_limit_window="900000"
firebase functions:config:set security.rate_limit_max="100"
```

#### **View Configuration**
```bash
# View all configuration
firebase functions:config:get

# View specific configuration
firebase functions:config:get supabase
firebase functions:config:get ai
```

### **Method 2: Google Secret Manager (Enterprise)**

#### **Install and Setup**
```bash
# Install Google Cloud SDK
gcloud auth login
gcloud config set project wastewise-30

# Create secrets
gcloud secrets create supabase-url --data-file=- <<< "https://your-project-id.supabase.co"
gcloud secrets create supabase-anon-key --data-file=- <<< "your-anon-key-here"
gcloud secrets create jwt-secret --data-file=- <<< "your-super-secure-jwt-secret-key-here"
```

#### **Access in Functions**
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

### **1. Firebase Functions Entry Point**
The backend is configured to run as Firebase Functions with:
- ✅ Security middleware (Helmet, CORS, Rate limiting)
- ✅ Environment variable management
- ✅ Error handling and logging
- ✅ Health check endpoints
- ✅ Scheduled functions for cleanup

### **2. Configuration Management**
```javascript
// backend/config/firebase-config.js
const { config, validateConfig, isFirebaseFunctions } = require('./config/firebase-config');

// Use configuration throughout your app
const supabaseUrl = config.supabase.url;
const jwtSecret = config.auth.jwtSecret;
```

### **3. Supabase Client Setup**
```javascript
// backend/services/supabaseClient.js
const { supabase, createServiceRoleClient, testConnection } = require('./services/supabaseClient');

// Test connection
await testConnection();
```

---

## **🎨 Frontend Configuration**

### **1. Environment Variables**
```bash
# frontend/.env.production
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=https://us-central1-wastewise-30.cloudfunctions.net/api
VITE_FRONTEND_URL=https://wastewise-30.web.app
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### **2. API Service**
```typescript
// frontend/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // API methods...
}
```

### **3. Vite Configuration**
```typescript
// frontend/vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/',
    plugins: [react()],
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

### **1. Automated Deployment Scripts**

#### **Bash Script (Linux/macOS)**
```bash
# Make executable
chmod +x scripts/deploy-firebase.sh

# Deploy with tests
./scripts/deploy-firebase.sh

# Deploy without tests
./scripts/deploy-firebase.sh --skip-tests
```

#### **PowerShell Script (Windows)**
```powershell
# Deploy with tests
.\scripts\deploy-firebase.ps1

# Deploy without tests
.\scripts\deploy-firebase.ps1 -SkipTests
```

### **2. Manual Deployment**
```bash
# Build frontend
cd frontend
npm run build
cd ..

# Deploy functions
firebase deploy --only functions

# Deploy hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy
```

### **3. Environment Setup Script**
```bash
# Interactive setup
chmod +x scripts/setup-firebase-env.sh
./scripts/setup-firebase-env.sh
```

---

## **📊 Monitoring & Maintenance**

### **1. Function Logs**
```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only api

# Follow logs in real-time
firebase functions:log --follow
```

### **2. Performance Monitoring**
```bash
# Enable performance monitoring
firebase perf:enable

# View performance data
firebase perf:data:get
```

### **3. Analytics**
```bash
# Enable analytics
firebase analytics:enable

# View analytics data
firebase analytics:data:get
```

### **4. Health Checks**
```bash
# Test API health
curl https://us-central1-wastewise-30.cloudfunctions.net/api/health

# Test frontend
curl https://wastewise-30.web.app
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

### **4. Database Security**
- ✅ Use Row Level Security (RLS)
- ✅ Implement proper access controls
- ✅ Regular security audits
- ✅ Backup and recovery procedures

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

## **🎯 Next Steps**

### **Immediate Actions**
1. ✅ Set up Firebase project
2. ✅ Configure environment variables
3. ✅ Deploy to Firebase
4. ✅ Test all functionality
5. ✅ Set up monitoring

### **Future Enhancements**
1. 🔄 Custom domain setup
2. 🔄 CDN optimization
3. 🔄 Advanced monitoring
4. 🔄 Automated testing
5. 🔄 CI/CD pipeline

---

This guide provides a comprehensive setup for deploying WasteWise to Firebase with proper secrets management, environment configuration, and security best practices. Follow each section carefully to ensure a successful deployment.

