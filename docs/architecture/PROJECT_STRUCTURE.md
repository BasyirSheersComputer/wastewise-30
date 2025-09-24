# 📁 WasteWise-30 Project Structure

## 🎯 **Organized Project Layout**

```
wastewise-30/
├── 📁 docs/                          # Documentation
│   ├── 📁 deployment/                # Deployment guides
│   │   ├── DEPLOYMENT.md
│   │   ├── QUICK_DEPLOYMENT.md
│   │   ├── DEPLOYMENT_WITH_NGINX.md
│   │   ├── MULTI_CONTAINER_DEPLOYMENT.md
│   │   ├── DEPLOYMENT_TROUBLESHOOTING.md
│   │   ├── NGINX_INTEGRATION_SUMMARY.md
│   │   └── NGINX_WASTEWISE_30_FIX.md
│   ├── 📁 cicd/                     # CI/CD documentation
│   │   ├── CICD_INITIALIZATION_SUMMARY.md
│   │   ├── WEBHOOK_ISSUE_SUMMARY.md
│   │   └── WEBHOOK_QUICK_FIX.md
│   ├── 📁 troubleshooting/          # Troubleshooting guides
│   │   ├── JENKINS_WEBHOOK_TROUBLESHOOTING.md
│   │   ├── JENKINS_NODEJS_FIX_SUMMARY.md
│   │   ├── JENKINS_NPM_CACHE_FIX.md
│   │   └── WEBHOOK_ISSUE_SUMMARY.md
│   ├── 📁 architecture/             # Architecture documentation
│   │   ├── COMPREHENSIVE_DATAFLOW_DIAGRAM.md
│   │   ├── WASTEWISE_DATAFLOW_VISUAL.md
│   │   ├── DOCKER_DEPLOYMENT_GUIDE.md
│   │   ├── DOCKER_FOCUSED_ARCHITECTURE_SUMMARY.md
│   │   ├── DOCKERFILE_IMPROVEMENTS.md
│   │   └── MULTI_CONTAINER_DEPLOYMENT.md
│   ├── 📁 security/                 # Security and secrets management
│   │   ├── DEPLOYMENT_SECRETS_GUIDE.md
│   │   └── SECRET_PASSING_FIX_SUMMARY.md
│   ├── 📁 ai/                       # AI and machine learning
│   │   ├── AI_RECOMMENDATION_OPTIMIZATION.md
│   │   ├── LLM_INTEGRATION_SUMMARY.md
│   │   └── FNB_CHAIN_EXPANSION_FEATURES.md
│   ├── 📁 testing/                  # Testing documentation
│   │   ├── DEVELOPMENT_VS_PRODUCTION_TESTING.md
│   │   └── COFFEE_CHAIN_TEST_RESULTS.md
│   ├── 📁 maintenance/              # Maintenance guides
│   │   ├── HOUSEKEEPING_SUMMARY.md
│   │   ├── CLEANUP_SUMMARY.md
│   │   ├── IDLE_LOGOUT_AND_LLM_OPTIMIZATION.md
│   │   └── LOGOUT_REDIRECT_SUMMARY.md
│   ├── README.md                    # Documentation index
│   └── QUICK_START.md               # Quick start guide
├── 📁 scripts/                      # Scripts and utilities
│   ├── 📁 deployment/               # Deployment scripts
│   │   ├── deploy-all.sh
│   │   ├── deploy-multi-container.sh
│   │   └── deploy-integrated.sh
│   ├── 📁 monitoring/               # Monitoring scripts
│   │   ├── monitor-cicd.js
│   │   └── trigger-cicd.js
│   ├── 📁 troubleshooting/          # Troubleshooting scripts
│   │   ├── diagnose-webhook.js
│   │   └── fix-jenkins-nodejs.js
│   ├── build-and-push-images.sh     # Docker build and push
│   ├── build-and-push-images.ps1    # PowerShell build script
│   ├── verify-secrets.js            # Secret verification
│   ├── comprehensive-test.js        # Comprehensive testing
│   ├── test-entire-system.js       # System testing
│   ├── check-system-status.js      # Status checking
│   ├── test-services.js            # Service testing
│   ├── test-cicd-automation.js     # CI/CD testing
│   ├── test-saas-features.js      # SaaS testing
│   ├── setup-test-data.js          # Test data setup
│   ├── run-system-with-test-data.js # System with test data
│   ├── integrate-platform.js       # Platform integration
│   ├── populateDatabase.js         # Database population
│   └── supabaseTest.js             # Supabase testing
├── 📁 config/                       # Configuration files
│   ├── 📁 docker/                   # Docker configurations
│   │   ├── Dockerfile               # Original Dockerfile
│   │   ├── Dockerfile.frontend      # Frontend container
│   │   ├── Dockerfile.backend       # Backend container
│   │   ├── docker-compose.yml       # Multi-container setup
│   │   └── docker-compose.integrated.yml
│   ├── 📁 nginx/                    # Nginx configurations
│   │   ├── nginx.conf               # Main reverse proxy
│   │   ├── nginx-frontend.conf      # Frontend server
│   │   └── nginx.integrated.conf    # Integrated setup
│   └── 📁 jenkins/                  # Jenkins configurations
│       └── Jenkinsfile              # CI/CD pipeline
├── 📁 frontend/                     # Frontend application
│   ├── src/                         # Source code
│   │   ├── components/              # React components
│   │   │   ├── Auth/               # Authentication components
│   │   │   ├── Marketing/          # Marketing components
│   │   │   └── UI/                 # UI components
│   │   ├── modules/                 # Feature modules
│   │   │   ├── auth/               # Authentication module
│   │   │   ├── dashboard/          # Dashboard module
│   │   │   └── landing/            # Landing page module
│   │   ├── routes/                  # Routing
│   │   ├── services/                # API services
│   │   ├── utils/                   # Utilities
│   │   ├── hooks/                   # React hooks
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── package.json                 # Dependencies
│   ├── vite.config.ts              # Build configuration
│   ├── tailwind.config.js          # Tailwind CSS config
│   └── tsconfig.app.json           # TypeScript config
├── 📁 backend/                      # Backend application
│   ├── routes/                      # API routes
│   │   ├── auth.js                  # Authentication routes
│   │   ├── billing.js               # Billing routes
│   │   ├── coffeeChain.js           # Coffee chain routes
│   │   ├── dashboard.js             # Dashboard routes
│   │   └── user.js                  # User routes
│   ├── services/                    # Business logic
│   │   ├── aiRecommendationService.js
│   │   ├── authService.js
│   │   ├── coffeeChainService.js
│   │   ├── dataPlatformBridge.js
│   │   ├── enhancedAIService.js
│   │   ├── enhancedBIService.js
│   │   ├── llmService.js
│   │   ├── stripeService.js
│   │   └── supabaseClient.js
│   ├── utils/                       # Utilities
│   │   ├── authMiddleware.js
│   │   └── logger.js
│   ├── ai-service.js                # AI service entry point
│   ├── analytics.js                 # Analytics service
│   ├── chatgpt.js                   # ChatGPT integration
│   ├── gemini.js                    # Gemini integration
│   ├── recommendations.js           # Recommendation engine
│   ├── package.json                 # Dependencies
│   └── index.js                     # Entry point
├── 📁 data-platform/                # Data platform
│   ├── src/                         # Platform source
│   ├── services/                    # Platform services
│   ├── package.json                 # Dependencies
│   └── ARCHITECTURE.md              # Platform architecture
├── 📁 database/                     # Database files
├── 📁 test-data/                    # Test data files
├── 📁 dist/                         # Build output
├── 📁 node_modules/                 # Dependencies
├── 📁 .bolt/                        # Bolt configuration
├── package.json                     # Root dependencies
├── package-lock.json               # Lock file
├── tsconfig.json                   # TypeScript config
├── tsconfig.app.json               # App TypeScript config
├── tsconfig.node.json              # Node TypeScript config
├── docker-compose.yml              # Main Docker Compose
├── Dockerfile.frontend             # Frontend Dockerfile
├── Dockerfile.backend              # Backend Dockerfile
├── Jenkinsfile                     # CI/CD pipeline
├── env.example                     # Environment template
├── setup-env.sh                    # Environment setup
├── manual-deploy.sh                # Manual deployment
├── troubleshoot-deployment.sh      # Deployment troubleshooting
├── restart-containers.sh           # Container restart
├── test-coffee-chain-features.js   # Coffee chain tests
├── test-llm-integration.js         # LLM integration tests
├── test-llm-with-mock.js           # Mock LLM tests
├── test-frontend-backend-ai-integration.js # Integration tests
├── gemini-test.js                  # Gemini tests
├── Coffee Chain Operational Intelligence System.md # System overview
├── README.md                       # Main project README
└── PROJECT_STRUCTURE.md            # This file
```

## 📋 **Key Directories Explained**

### **📁 docs/** - Documentation Hub
- **deployment/**: Complete deployment guides and procedures
- **cicd/**: Continuous Integration/Deployment documentation
- **troubleshooting/**: Common issues and solutions
- **architecture/**: System design and architecture patterns
- **security/**: Security and secrets management
- **ai/**: AI and machine learning features
- **testing/**: Testing strategies and results
- **maintenance/**: System maintenance and optimization

### **📁 scripts/** - Automation & Utilities
- **deployment/**: Automated deployment scripts
- **monitoring/**: System monitoring and health checks
- **troubleshooting/**: Diagnostic and fix scripts
- **build-and-push-images.sh/.ps1**: Docker image management
- **verify-secrets.js**: Secret verification tool

### **📁 config/** - Configuration Management
- **docker/**: Container configurations
- **nginx/**: Web server configurations
- **jenkins/**: CI/CD pipeline configurations

### **📁 frontend/** - React Application
- **src/components/**: Reusable UI components
- **src/modules/**: Feature-based modules
- **src/services/**: API integration services
- **src/utils/**: Utility functions and helpers

### **📁 backend/** - Node.js API
- **routes/**: API endpoint definitions
- **services/**: Business logic and external integrations
- **utils/**: Backend utilities and middleware
- **ai-service.js**: AI service orchestration
- **recommendations.js**: Recommendation engine

## 🔧 **Configuration Files**

### **Root Level:**
- `docker-compose.yml`: Main container orchestration
- `Jenkinsfile`: CI/CD pipeline definition
- `env.example`: Environment variables template
- `package.json`: Root dependencies and scripts

### **Frontend:**
- `vite.config.ts`: Build tool configuration
- `tailwind.config.js`: CSS framework configuration
- `tsconfig.app.json`: TypeScript configuration

### **Backend:**
- `index.js`: Application entry point
- `ai-service.js`: AI service integration
- `recommendations.js`: Recommendation system

## 🚀 **Quick Navigation**

### **Start Development:**
```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && npm run dev

# Full stack with Docker
docker-compose up -d
```

### **Run Tests:**
```bash
# Comprehensive tests
node test-coffee-chain-features.js

# AI integration tests
node test-llm-integration.js

# Integration tests
node test-frontend-backend-ai-integration.js
```

### **Deploy:**
```bash
# Build and push images
./scripts/build-and-push-images.ps1

# Deploy with Docker Compose
docker-compose up -d --build
```

---

**Last Updated**: $(date)
**Version**: 2.0
**Status**: ✅ Organized and Maintained 