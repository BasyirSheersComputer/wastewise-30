# WasteWise Project Organization

This document outlines the organized structure of the WasteWise project after deliberate housekeeping and reorganization.

## 📁 Root Directory Structure

```
wastewise-30/
├── backend/                 # Backend Node.js application
├── frontend/               # Frontend React application
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── config/                 # Configuration files
├── templates/              # Template files
└── README.md              # Main project README
```

## 🗂️ Documentation Organization (`docs/`)

### Architecture Documentation (`docs/architecture/`)
- `WASTEWISE_PRODUCT_REQUIREMENTS_DOCUMENT.md` - Product requirements and specifications
- `WASTEWISE_TECHNICAL_SPECIFICATION.md` - Technical architecture overview
- `WASTEWISE_TECHNICAL_SPECIFICATION_DOCUMENT.md` - Detailed technical specifications
- `WASTEWISE_FEATURE_MATRIX.md` - Feature breakdown and capabilities
- `WASTEWISE_30_PRD.md` - Product requirements document
- `MALAYSIA_SAAS_PRICING_ANALYSIS.md` - Pricing strategy and market analysis
- `PROJECT_STRUCTURE.md` - Project structure documentation

### User Guides (`docs/user-guides/`)
- `WASTEWISE_UX_USER_FLOW_DOCUMENT.md` - User experience and flow documentation
- `ISSUE_REPORTING_SYSTEM_GUIDE.md` - Guide for issue reporting system
- `CHECKOUT_SYSTEM_GUIDE.md` - Guide for checkout system

### Development Documentation (`docs/development/`)
- `CSV_UPLOAD_IMPLEMENTATION_SUMMARY.md` - CSV upload feature implementation
- `RICH_TEXT_PARSING_IMPLEMENTATION.md` - Rich text parsing implementation

### Deployment Documentation (`docs/deployment/`)
- `CLOUD_RUN_DEPLOYMENT_README.md` - Google Cloud Run deployment guide
- `GOOGLE_CLOUD_RUN_DEPLOYMENT_PLAN.md` - Detailed deployment plan

### Maintenance Documentation (`docs/maintenance/`)
- `BACKEND_USER_CREATION_FIXES.md` - User creation fixes and patches
- `PATCH_APPLICATION_SUMMARY.md` - Patch application documentation
- `USER_PROFILE_TROUBLESHOOTING.md` - User profile troubleshooting guide

### Testing Documentation (`docs/testing/`)
- Testing guides and documentation

### Security Documentation (`docs/security/`)
- Security policies and guidelines

## 🔧 Configuration Organization (`config/`)

### Docker Configuration (`config/docker/`)
- `Dockerfile.backend` - Backend Docker configuration
- `docker-compose.yml` - Docker Compose configuration
- `backend-service.yaml` - Backend service configuration
- `frontend-service.yaml` - Frontend service configuration

### Nginx Configuration (`config/nginx/`)
- `nginx.conf` - Nginx server configuration

### Jenkins Configuration (`config/jenkins/`)
- `Jenkinsfile` - CI/CD pipeline configuration
- `cloudbuild.yaml` - Google Cloud Build configuration

### Environment Configuration (`config/environment/`)
- `env.example` - Environment variables template

## 📜 Scripts Organization (`scripts/`)

### Database Scripts (`scripts/database/`)
- Database setup and maintenance scripts

### Deployment Scripts (`scripts/deployment/`)
- `restart-containers.sh` - Container restart script
- `setup-env.sh` - Environment setup script
- `manual-deploy.sh` - Manual deployment script

### Testing Scripts (`scripts/testing/`)
- `test-api-endpoint.js` - API endpoint testing
- `test-force-llm-call.js` - LLM call testing
- `test-llm-with-mock.js` - LLM mock testing
- `test-llm-integration.js` - LLM integration testing
- `test-frontend-backend-ai-integration.js` - Full integration testing
- `test-coffee-chain-features.js` - Coffee chain feature testing
- `gemini-test.js` - Gemini AI testing

### Maintenance Scripts (`scripts/maintenance/`)
- `troubleshoot-deployment.sh` - Deployment troubleshooting script

## 🖥️ Backend Organization (`backend/`)

### Core Application
- `index.js` - Main application entry point
- `package.json` - Backend dependencies and scripts

### Routes (`backend/routes/`)
- API route handlers and endpoints

### Services (`backend/services/`)
- Business logic and service layer

### Utils (`backend/utils/`)
- Utility functions and helpers

### Database (`backend/database/`)
- `db.js` - Database connection and utilities
- `setup-*.sql` - Database setup scripts
- `populate-*.js` - Database population scripts
- `test-*.js` - Database testing scripts
- `fix-*.js` - Database fix scripts
- `*DATABASE*.md` - Database documentation
- `*RLS*.md` - Row Level Security documentation
- `*INTEGRATED*.md` - Integrated database documentation

### AI Services (`backend/ai/`)
- `ai-service.js` - AI service integration
- `gemini.js` - Google Gemini AI integration
- `chatgpt.js` - OpenAI ChatGPT integration
- `analytics.js` - Analytics service
- `recommendations.js` - AI recommendations service
- `run-gemini-test.js` - Gemini testing script

### Tests (`backend/tests/`)
- `test-coffee-chain.js` - Coffee chain feature tests
- `test.js` - General testing utilities

### Configuration (`backend/config/`)
- `*STRIPE*.md` - Stripe payment configuration documentation

### Functions (`backend/functions/`)
- Firebase Cloud Functions

## 🎨 Frontend Organization (`frontend/`)

### Core Application
- `index.html` - Main HTML entry point
- `package.json` - Frontend dependencies and scripts

### Source Code (`frontend/src/`)
- React components and application logic

### Configuration (`frontend/config/`)
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `tsconfig.app.json` - TypeScript configuration
- `vite-env.d.ts` - Vite environment types

### Assets (`frontend/assets/`)
- Static assets and resources

### Tests (`frontend/tests/`)
- Frontend testing files

### Routes (`frontend/routes/`)
- Frontend routing configuration

### Modules (`frontend/modules/`)
- Feature modules and components

### Components (`frontend/components/`)
- Reusable UI components

### Distribution (`frontend/dist/`)
- Built application files

## 🗃️ Templates (`templates/`)
- Template files for various purposes

## 📋 Key Benefits of This Organization

### 1. **Clear Separation of Concerns**
- Documentation is categorized by purpose (architecture, user guides, development, etc.)
- Configuration files are separated by technology (Docker, Nginx, Jenkins, etc.)
- Scripts are organized by function (database, deployment, testing, maintenance)

### 2. **Improved Maintainability**
- Related files are grouped together
- Easy to locate specific types of files
- Clear hierarchy and structure

### 3. **Better Developer Experience**
- New developers can quickly understand the project structure
- Documentation is easily accessible and well-organized
- Configuration files are centralized and easy to manage

### 4. **Enhanced Deployment Management**
- Deployment scripts and configurations are clearly separated
- Environment-specific configurations are organized
- CI/CD configurations are centralized

### 5. **Streamlined Testing**
- Test files are organized by type and purpose
- Database testing is separated from application testing
- AI service testing has its own dedicated area

## 🚀 Getting Started

1. **Read the Architecture Documentation**: Start with `docs/architecture/` for project overview
2. **Check Configuration**: Review `config/` for environment setup
3. **Explore Scripts**: Use `scripts/` for common development tasks
4. **Follow User Guides**: Reference `docs/user-guides/` for feature usage

## 📝 Maintenance Notes

- Keep documentation up to date when adding new features
- Organize new files according to this structure
- Update this document when adding new organizational categories
- Maintain consistency in file naming and organization

## 🔄 Future Improvements

- Consider adding automated documentation generation
- Implement automated testing organization
- Add version control for configuration files
- Create automated deployment scripts for different environments

