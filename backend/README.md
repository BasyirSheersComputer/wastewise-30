# Servora AI Backend API

AI-powered restaurant waste management backend with real-time analytics and recommendations.

## 🚀 Features

- **AI-Powered Recommendations**: Gemini and ChatGPT integration with automatic fallback
- **Real-time Analytics**: Server-Sent Events for live data streaming
- **Database Integration**: Supabase for data persistence and real-time updates
- **Authentication**: JWT-based authentication with Supabase Auth
- **Rate Limiting**: Built-in rate limiting for API protection
- **Comprehensive Logging**: Structured logging for monitoring and debugging
- **Modular Architecture**: Organized routes, services, and utilities

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account and project
- Gemini API key (Google AI Studio)
- OpenAI API key (optional, for ChatGPT fallback)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wastewise-30/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI Services
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**
   Ensure your Supabase project has the following tables:
   - `users` - User profiles and trial information
   - `waste_logs` - Waste tracking data
   - `supplier_orders` - Supplier order history
   - `user_staff_data` - Staff information
   - `supplier_data` - Supplier information

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Health Check
```bash
npm run health
```

## 📚 API Documentation

### Authentication Endpoints

#### `POST /api/auth/register`
Register a new user account.
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "company": "Restaurant Name",
  "size": "medium",
  "pain": "waste_reduction"
}
```

#### `POST /api/auth/login`
Authenticate user and get session.
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### `POST /api/auth/logout`
Logout current user session.

#### `GET /api/auth/me`
Get current user information.

### User Management

#### `GET /api/user/profile`
Get user profile information.

#### `PUT /api/user/profile`
Update user profile.
```json
{
  "name": "Updated Name",
  "company": "Updated Company",
  "size": "large",
  "pain": "cost_optimization"
}
```

#### `GET /api/user/trial-status`
Get trial status and remaining days.

#### `DELETE /api/user/account`
Delete user account.

### Dashboard & Analytics

#### `GET /api/dashboard/overview`
Get comprehensive dashboard overview with analytics and recommendations.

#### `GET /api/dashboard/section/:section`
Get section-specific data and recommendations.
- Available sections: `waste`, `supplier`, `menu`, `training`, `compliance`, `inventory`, `demand`

#### `GET /api/dashboard/sections`
Get multiple sections data.
```bash
GET /api/dashboard/sections?sections=waste,supplier,menu&provider=auto
```

#### `GET /api/dashboard/kpis`
Get key performance indicators.

#### `GET /api/dashboard/activity`
Get recent activity feed.

### AI Recommendations

#### `GET /stream/analytics`
Real-time analytics stream with AI recommendations.
```bash
GET /stream/analytics?section=waste&provider=auto
```

#### `GET /api/recommendations`
Get recommendations for multiple sections.
```bash
GET /api/recommendations?sections=waste,supplier&provider=auto
```

#### `GET /api/recommendations/:section`
Get recommendations for a specific section.
```bash
GET /api/recommendations/waste?provider=gemini
```

#### `POST /api/ai/test`
Test AI service with custom prompt.
```json
{
  "prompt": "Suggest ways to reduce food waste in a restaurant",
  "provider": "auto"
}
```

### Billing & Subscriptions

#### `GET /api/billing/subscription`
Get current subscription status.

#### `POST /api/billing/subscription`
Update subscription plan.
```json
{
  "plan": "pro",
  "paymentMethod": "card_123"
}
```

#### `DELETE /api/billing/subscription`
Cancel subscription.

#### `GET /api/billing/history`
Get billing history.

#### `GET /api/billing/plans`
Get available subscription plans.

### System Endpoints

#### `GET /health`
Health check endpoint.

#### `GET /api/ai/status`
AI service status and configuration.

## 🏗️ Architecture

### Directory Structure
```
backend/
├── index.js              # Main application entry point
├── recommendations.js    # AI recommendations system
├── ai-service.js        # AI service with fallback
├── analytics.js         # Analytics data aggregation
├── db.js               # Database operations
├── gemini.js           # Gemini AI integration
├── chatgpt.js          # ChatGPT integration
├── routes/             # API route handlers
│   ├── auth.js         # Authentication routes
│   ├── user.js         # User management routes
│   ├── dashboard.js    # Dashboard routes
│   └── billing.js      # Billing routes
├── services/           # Business logic services
│   ├── supabaseClient.js # Database client
│   └── llmService.js   # LLM service wrapper
├── utils/              # Utility functions
│   ├── logger.js       # Logging utility
│   └── authMiddleware.js # Authentication middleware
└── package.json        # Dependencies and scripts
```

### Key Components

#### AI Recommendations System
- **Database Integration**: Fetches relevant data for each section
- **AI Providers**: Gemini (primary) with ChatGPT fallback
- **Real-time Updates**: Server-Sent Events for live recommendations
- **Section-Specific**: Tailored prompts for different business areas

#### Authentication & Authorization
- **JWT Tokens**: Supabase Auth integration
- **Middleware**: Route protection and subscription checks
- **Rate Limiting**: API protection against abuse

#### Database Operations
- **Supabase Client**: Centralized database access
- **Enhanced Logging**: Query performance monitoring
- **Error Handling**: Comprehensive error management

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `GEMINI_API_KEY` | Google AI Studio API key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | No (fallback) |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment mode | No (default: development) |

### Rate Limiting
- **Analytics Stream**: 50 requests per minute
- **Recommendations API**: 20 requests per minute
- **AI Test Endpoint**: 5 requests per minute
- **General API**: 100 requests per 15 minutes

## 🧪 Testing

### Run Tests
```bash
# Basic connectivity test
npm test

# AI service test
npm run test:ai
```

### Manual Testing
```bash
# Health check
curl http://localhost:3000/health

# AI status
curl http://localhost:3000/api/ai/status

# Test AI with custom prompt
curl -X POST http://localhost:3000/api/ai/test \
  -H "Content-Type: application/json" \
  -d '{"prompt": "How to reduce restaurant waste?", "provider": "auto"}'
```

## 📊 Monitoring

### Logging
The application uses structured logging with different levels:
- **INFO**: General application events
- **WARN**: Warning conditions
- **ERROR**: Error conditions
- **DEBUG**: Detailed debugging information (development only)

### Metrics
- API response times
- Database query performance
- AI service response times
- Error rates and types

## 🔒 Security

### Authentication
- JWT-based authentication via Supabase Auth
- Automatic token refresh
- Session management

### Authorization
- Route-level protection
- Subscription-based access control
- Permission-based features

### Rate Limiting
- Per-endpoint rate limiting
- User-based rate limiting
- IP-based fallback

## 🚀 Deployment

### Production Checklist
1. Set `NODE_ENV=production`
2. Configure all environment variables
3. Set up proper logging
4. Configure CORS for production domains
5. Set up monitoring and alerting
6. Configure SSL/TLS certificates

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the logs for debugging information 