# 🚀 WasteWise-30 - Coffee Chain Operational Intelligence System

## 📋 **Project Overview**

WasteWise-30 is a comprehensive coffee chain operational intelligence platform that helps coffee shops reduce waste, optimize inventory, and increase profitability through AI-powered insights and real-time monitoring.

### **🎯 Key Features:**
- **AI-Powered Recommendations**: Machine learning algorithms for waste prediction and optimization
- **Real-time Inventory Management**: Track ingredients and expiration dates
- **Smart Menu Optimization**: Suggest menu items based on available ingredients
- **Analytics Dashboard**: Comprehensive waste and cost analytics
- **Multi-container Architecture**: Scalable microservices deployment
- **CI/CD Pipeline**: Automated testing and deployment

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Nginx Proxy   │
│   (React/Vite)  │    │   (Node.js/Exp) │    │   (Load Balancer)│
│   Port 8899     │    │   Port 3000     │    │   Port 80/443   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Docker Network │
                    │ wastewise-network│
                    └─────────────────┘
```

## 🚀 **Quick Start**

### **Prerequisites:**
- Docker and Docker Compose
- Node.js 20+
- Git

### **1. Clone the Repository:**
```bash
git clone https://github.com/BasyirSheersComputer/wastewise-30.git
cd wastewise-30
```

### **2. Set Up Environment:**
```bash
# Copy environment template
cp env.example .env

# Edit environment variables (see env.example for required keys)
nano .env
```

### **3. Deploy with Docker Compose:**
```bash
# Deploy the application
docker-compose up -d --build

# Check status
docker-compose ps
```

### **4. Access the Application:**
- **Frontend**: http://localhost:8899/
- **Backend API**: http://localhost:3000/
- **Health Check**: http://localhost:3000/health

## 📁 **Project Structure**

```
wastewise-30/
├── 📁 docs/                    # Documentation
│   ├── 📁 deployment/          # Deployment guides
│   ├── 📁 cicd/               # CI/CD documentation
│   ├── 📁 troubleshooting/    # Troubleshooting guides
│   ├── 📁 architecture/       # Architecture documentation
│   ├── 📁 security/           # Security and secrets management
│   ├── 📁 ai/                 # AI and ML documentation
│   ├── 📁 testing/            # Testing documentation
│   └── 📁 maintenance/        # Maintenance guides
├── 📁 scripts/                 # Scripts and utilities
│   ├── 📁 deployment/         # Deployment scripts
│   ├── 📁 monitoring/         # Monitoring scripts
│   └── 📁 troubleshooting/    # Troubleshooting scripts
├── 📁 config/                  # Configuration files
│   ├── 📁 docker/             # Docker configurations
│   ├── 📁 nginx/              # Nginx configurations
│   └── 📁 jenkins/            # Jenkins configurations
├── 📁 frontend/                # React frontend application
├── 📁 backend/                 # Node.js backend application
└── 📁 data-platform/           # Data platform services
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
# Build and push images
./scripts/build-and-push-images.ps1

# Deploy with Jenkins
# (See docs/cicd/ for CI/CD setup)
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