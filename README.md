# 🚀 WasteWise-30 - Coffee Chain Operational Intelligence System

## 📋 **Project Overview**

WasteWise-30 is a comprehensive coffee chain operational intelligence platform that helps coffee shops reduce waste, optimize inventory, and increase profitability through AI-powered insights and real-time monitoring.

### **🎯 Key Features:**
- **AI-Powered Recommendations**: Machine learning algorithms for waste prediction and optimization
- **Real-time Inventory Management**: Track ingredients and expiration dates
- **Smart Menu Optimization**: Suggest menu items based on available ingredients
- **Analytics Dashboard**: Comprehensive waste and cost analytics
- **Cloud-Native Architecture**: Scalable Google Cloud Run deployment
- **Simplified CI/CD Pipeline**: Automated testing and deployment via Cloud Build

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Google Cloud  │
│   (React/Vite)  │    │   (Node.js/Exp) │    │   Run Services  │
│   Port 8080     │    │   Port 3000     │    │   (Managed)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Google Cloud  │
                    │   Secret Manager│
                    └─────────────────┘
```

## 🚀 **Quick Start**

### **Option 1: Local Development**
**Prerequisites:**
- Docker and Docker Compose
- Node.js 18+
- Git

**1. Clone the Repository:**
```bash
git clone https://github.com/BasyirSheersComputer/wastewise-30.git
cd wastewise-30
```

**2. Set Up Environment:**
```bash
# Copy environment template
cp config/environment/env.example .env

# Edit environment variables
nano .env
```

**3. Build and Deploy:**
```bash
# Deploy the application
docker-compose up -d

# Check status
docker-compose ps
```

### **Option 2: Cloud Deployment with Google Cloud Build**
**Prerequisites:**
- Google Cloud project with billing enabled
- Google Cloud CLI (gcloud) installed and authenticated
- GitHub repository access

**1. Set Up Cloud Build:**
```bash
# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Set up secrets in Google Secret Manager
./scripts/setup-secrets.sh
```

**2. Deploy with Cloud Build:**
```bash
# Trigger deployment
gcloud builds submit --config cloudbuild.yaml

# Or push to trigger automatic deployment
git push origin main
```

**📖 For detailed setup instructions, see:**
- [Cloud Build Setup Guide](./docs/deployment/CLOUD_BUILD_SETUP.md)
- [Secret Manager Setup Guide](./docs/deployment/SECRET_MANAGER_SETUP.md)

### **4. Access the Application:**
- **Frontend**: http://localhost:8080/
- **Backend API**: http://localhost:3000/
- **Health Check**: http://localhost:3000/health

**🌏 Production URLs (Asia Southeast Region):**
- **Frontend**: `https://wastewise-frontend-{PROJECT_ID}-as.a.run.app`
- **Backend API**: `https://wastewise-backend-{PROJECT_ID}-as.a.run.app`
- **Health Check**: `https://wastewise-backend-{PROJECT_ID}-as.a.run.app/health`

## 📁 **Project Structure**

This project has been organized for better maintainability and developer experience. See [PROJECT_ORGANIZATION.md](./docs/PROJECT_ORGANIZATION.md) for detailed structure information.

### Quick Navigation
- 📚 **Documentation**: `docs/` - Architecture, user guides, development docs
- ⚙️ **Configuration**: `config/` - Docker, Nginx, environment configs
- 🔧 **Scripts**: `scripts/` - Database, deployment, testing, maintenance scripts
- 🖥️ **Backend**: `backend/` - Node.js API and services
- 🎨 **Frontend**: `frontend/` - React application

```
wastewise-30/
├── 📁 docs/                    # Documentation
│   ├── 📁 architecture/        # Architecture documentation
│   ├── 📁 user-guides/         # User guides and manuals
│   ├── 📁 development/         # Development documentation
│   ├── 📁 deployment/          # Deployment guides
│   ├── 📁 maintenance/         # Maintenance guides
│   ├── 📁 testing/             # Testing documentation
│   └── 📁 security/            # Security documentation
├── 📁 scripts/                 # Scripts and utilities
│   ├── 📁 database/            # Database scripts
│   ├── 📁 deployment/          # Deployment scripts
│   ├── 📁 testing/             # Testing scripts
│   └── 📁 maintenance/         # Maintenance scripts
├── 📁 config/                  # Configuration files
│   ├── 📁 docker/              # Docker configurations
│   ├── 📁 nginx/               # Nginx configurations
│   └── 📁 environment/         # Environment configurations
├── 📁 frontend/                # React frontend application
├── 📁 backend/                 # Node.js backend application
└── 📁 templates/               # Template files
```

## 🔧 **Development**

### **Frontend Development:**
```bash
cd frontend
npm install
npm run dev
```

### **Backend Development:**
```bash
cd backend
npm install
npm run dev
```

### **Running Tests:**
```bash
# Run comprehensive tests
node test-coffee-chain-features.js

# Run AI integration tests
node test-llm-integration.js

# Run frontend-backend integration tests
node test-frontend-backend-ai-integration.js
```

## 🚀 **Deployment**

### **Local Development:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Production Deployment:**
```bash
# Deploy with Cloud Build (simplified approach)
gcloud builds submit --config cloudbuild.yaml

# Or use the deployment script
./scripts/deploy-cloud-run.sh
```

## 📚 **Documentation**

Comprehensive documentation is available in the `docs/` directory:

- **[📖 Documentation Index](docs/README.md)** - Complete documentation overview
- **[🚀 Quick Start](docs/QUICK_START.md)** - Get up and running quickly
- **[🏗️ Architecture](docs/architecture/)** - System architecture and design
- **[🔧 Deployment](docs/deployment/)** - Deployment guides and procedures
- **[🔐 Security](docs/security/)** - Security and secrets management
- **[🤖 AI Features](docs/ai/)** - AI and machine learning features
- **[🐛 Troubleshooting](docs/troubleshooting/)** - Common issues and solutions

## 🔐 **Environment Variables**

Required environment variables (see `env.example`):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Service Configuration
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Application Configuration
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-domain.com
```

## 🧪 **Testing**

The project includes comprehensive testing:

- **Unit Tests**: Individual component testing
- **Integration Tests**: Service integration testing
- **End-to-End Tests**: Complete workflow testing
- **AI Integration Tests**: LLM service testing

Run tests with:
```bash
node test-coffee-chain-features.js
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 **License**

This project is proprietary software. All rights reserved.

## 🆘 **Support**

For support and troubleshooting:

1. Check the [troubleshooting guides](docs/troubleshooting/)
2. Review [deployment documentation](docs/deployment/)
3. Check [security documentation](docs/security/) for configuration issues
4. Run the verification script: `node scripts/verify-secrets.js`

---

**Last Updated**: $(date)
**Version**: 2.0
**Status**: ✅ Production Ready 