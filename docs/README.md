# Servora AI Documentation

Welcome to the Servora AI documentation. This directory contains comprehensive documentation for the Coffee Chain Operational Intelligence System.

## 📚 Documentation Structure

### 🚀 Getting Started
- **[Quick Start Guide](QUICK_START.md)** - Get up and running quickly
- **[Project Structure](PROJECT_STRUCTURE.md)** - Understanding the codebase organization

### 🏗️ Architecture & Design
- **[Architecture Overview](../architecture/)** - System architecture and design patterns
- **[Comprehensive Dataflow Diagram](../architecture/COMPREHENSIVE_DATAFLOW_DIAGRAM.md)** - Complete system dataflow from Kaggle data to statistical models
- **[Visual Dataflow Diagrams](../architecture/WASTEWISE_DATAFLOW_VISUAL.md)** - Interactive Mermaid diagrams and flow sequences
- **[Docker Architecture](../architecture/DOCKER_FOCUSED_ARCHITECTURE_SUMMARY.md)** - Container-based deployment architecture
- **[Dockerfile Improvements](../architecture/DOCKERFILE_IMPROVEMENTS.md)** - Container optimization strategies

### 🚀 Deployment & Operations
- **[Deployment Guide](../deployment/)** - Complete deployment instructions
- **[Docker Deployment](../deployment/DOCKER_DEPLOYMENT_GUIDE.md)** - Container deployment guide
- **[Multi-Container Deployment](../deployment/MULTI_CONTAINER_DEPLOYMENT.md)** - Complex deployment scenarios
- **[Nginx Integration](../deployment/DEPLOYMENT_WITH_NGINX.md)** - Web server configuration
- **[Quick Deployment](../deployment/QUICK_DEPLOYMENT.md)** - Fast deployment options

### 🔧 CI/CD & Automation
- **[CI/CD Overview](../cicd/)** - Continuous Integration/Deployment
- **[Jenkins Setup](../cicd/CICD_INITIALIZATION_SUMMARY.md)** - Jenkins pipeline configuration
- **[Webhook Troubleshooting](../cicd/WEBHOOK_ISSUE_SUMMARY.md)** - Common webhook issues

### 🐛 Troubleshooting & Support
- **[Troubleshooting Guide](../troubleshooting/)** - Common issues and solutions
- **[Jenkins Node.js Fix](../troubleshooting/JENKINS_NODEJS_FIX_SUMMARY.md)** - Jenkins environment issues
- **[NPM Cache Fix](../troubleshooting/JENKINS_NPM_CACHE_FIX.md)** - Package management issues
- **[Webhook Quick Fix](../troubleshooting/WEBHOOK_QUICK_FIX.md)** - Rapid webhook resolution

### 🔐 Security & Configuration
- **[Secret Management](../DEPLOYMENT_SECRETS_GUIDE.md)** - Environment variables and secrets
- **[Secret Passing Fix](../SECRET_PASSING_FIX_SUMMARY.md)** - Container secret injection
- **[Environment Setup](../setup-env.sh)** - Environment configuration script

### 🤖 AI & Machine Learning
- **[AI Recommendation Engine](../AI_RECOMMENDATION_OPTIMIZATION.md)** - AI-powered recommendations
- **[LLM Integration](../LLM_INTEGRATION_SUMMARY.md)** - Large Language Model integration
- **[Coffee Chain Features](../FNB_CHAIN_EXPANSION_FEATURES.md)** - Business intelligence features

### 📊 Testing & Quality Assurance
- **[Testing Guide](../DEVELOPMENT_VS_PRODUCTION_TESTING.md)** - Testing strategies
- **[Coffee Chain Test Results](../COFFEE_CHAIN_TEST_RESULTS.md)** - Test execution results
- **[Test Scripts](../scripts/)** - Automated testing tools

### 🔄 Maintenance & Updates
- **[Housekeeping Summary](../HOUSEKEEPING_SUMMARY.md)** - System maintenance procedures
- **[Cleanup Summary](../CLEANUP_SUMMARY.md)** - Code cleanup and optimization
- **[Idle Logout Optimization](../IDLE_LOGOUT_AND_LLM_OPTIMIZATION.md)** - Session management
- **[Logout Redirect Summary](../LOGOUT_REDIRECT_SUMMARY.md)** - User session handling

## 📋 Quick Reference

### Essential Commands
```bash
# Start the application
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Update images
docker-compose pull && docker-compose up -d

# Run tests
node test-coffee-chain-features.js
```

### Key Files
- `docker-compose.yml` - Container orchestration
- `Jenkinsfile` - CI/CD pipeline
- `env.example` - Environment template
- `scripts/` - Utility scripts

### Important URLs
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🆘 Getting Help

1. **Check the troubleshooting guides** in the troubleshooting directory
2. **Review deployment logs** using `docker-compose logs`
3. **Verify environment variables** using the secret verification script
4. **Run health checks** to identify issues

## 📝 Contributing

When adding new documentation:
1. Place files in the appropriate subdirectory
2. Update this README with new links
3. Follow the existing naming conventions
4. Include clear examples and troubleshooting steps

---

**Last Updated**: $(date)
**Version**: 2.0
**Status**: ✅ Organized and Maintained
