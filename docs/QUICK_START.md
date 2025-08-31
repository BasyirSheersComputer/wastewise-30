# 🚀 WasteWise Quick Start Guide

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example backend/.env

# Edit the .env file with your actual values
# Required variables:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - GEMINI_API_KEY
# - STRIPE_SECRET_KEY
# - STRIPE_PUBLISHABLE_KEY
```

### 3. Start Services

#### Option A: Start Both Services (Recommended)
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Option B: Use the Test Script
```bash
# Run the service test to verify everything is working
node test-services.js
```

## 🌐 Service URLs

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🔧 Development Commands

### Backend Commands
```bash
cd backend

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

### Frontend Commands
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Dashboard
- `GET /api/dashboard/analytics` - Get analytics data
- `GET /stream/analytics` - Real-time analytics stream

### Billing
- `GET /api/billing/subscription` - Get subscription status
- `POST /api/billing/create-checkout` - Create payment session

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Kill the process if needed
taskkill /PID <process_id> /F
```

### Environment Variables
Make sure your `.env` file in the backend directory has the required variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`

### Service Not Starting
1. Check if dependencies are installed: `npm install`
2. Verify environment variables are set
3. Check console for error messages
4. Ensure ports 3000 and 5173 are available

## 🧪 Testing

### Run Service Tests
```bash
node test-services.js
```

### Manual Testing
1. Open http://localhost:5173 in your browser
2. Test the health endpoint: http://localhost:3000/health
3. Check browser console for any errors
4. Verify API calls are working

## 📁 Project Structure

```
wastewise-30/
├── frontend/          # React + Vite frontend
│   ├── src/          # Source code
│   ├── components/   # React components
│   └── package.json  # Frontend dependencies
├── backend/          # Node.js + Express backend
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── utils/        # Utilities
│   └── package.json  # Backend dependencies
├── Dockerfile        # Production container
├── Jenkinsfile       # CI/CD pipeline
└── package.json      # Root dependencies
```

## 🚀 Production Deployment

### Docker Build
```bash
# Build the production image
docker build -t wastewise-30 .

# Run the container
docker run -p 8080:80 wastewise-30
```

### CI/CD Pipeline
The project includes a complete CI/CD pipeline that:
1. Builds Docker image
2. Runs tests
3. Pushes to DockerHub
4. Deploys to production server

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set
3. Ensure ports are not in use
4. Run the test script: `node test-services.js`

## 🎯 Quick Commands Reference

```bash
# Start both services
cd backend && npm run dev & cd ../frontend && npm run dev

# Test services
node test-services.js

# Check service status
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Health check
curl http://localhost:3000/health
```

Your WasteWise application is now ready for development! 🎉 