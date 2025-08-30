# Docker Environment Variable Setup Guide

This guide explains how to properly configure environment variables for Docker builds and deployments in the WasteWise application.

## Overview

The application has been updated to follow Docker best practices for environment variable handling:

- **Build-time variables**: Used during Docker image build (frontend)
- **Runtime variables**: Used when containers are running (backend)
- **Secret management**: Proper separation of sensitive data

## File Structure

```
config/environment/
├── env.example              # General environment template
├── frontend.env.example     # Frontend-specific variables
└── docker.env.example       # Docker-specific template

scripts/
├── build-docker.sh         # Linux/macOS build script
└── build-docker.ps1        # Windows PowerShell build script
```

## Quick Setup

### 1. Create Environment File

Copy the Docker template and fill in your values:

```bash
# Linux/macOS
cp config/environment/docker.env.example .env

# Windows PowerShell
Copy-Item config/environment/docker.env.example .env
```

### 2. Edit Environment Variables

Open `.env` and update the following critical variables:

```env
# Required for frontend build
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_BASE_URL=http://wastewise-backend:3000

# Required for backend runtime
SUPABASE_URL=https://your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Build and Deploy

```bash
# Linux/macOS
./scripts/build-docker.sh

# Windows PowerShell
.\scripts\build-docker.ps1

# Start services
docker-compose up -d
```

## Environment Variable Categories

### Frontend Build Variables (Build-time)

These variables are embedded into the frontend application during the Docker build process:

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key (if enabled)
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_TRIAL_PERIOD_DAYS`: Trial period duration

### Backend Runtime Variables

These variables are available to the backend container at runtime:

- `NODE_ENV`: Environment (production/development)
- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: Allowed CORS origins
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `JWT_SECRET`: JWT signing secret
- `GEMINI_API_KEY`: Google Gemini API key
- `OPENAI_API_KEY`: OpenAI API key
- `SMTP_*`: Email configuration
- `DATABASE_URL`: Database connection string

## Security Best Practices

### 1. Never Commit Secrets

- `.env` files are excluded from Git
- Use `.env.example` files as templates
- Store actual secrets in secure locations

### 2. Use Build Arguments for Frontend

Frontend environment variables are passed as build arguments:

```dockerfile
ARG VITE_SUPABASE_URL
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
```

### 3. Use Environment Files for Backend

Backend variables are loaded at runtime:

```yaml
env_file:
  - .env
```

### 4. Production Secret Management

For production deployments:

- Use Docker secrets or Kubernetes secrets
- Use cloud provider secret management (AWS Secrets Manager, GCP Secret Manager)
- Use environment-specific `.env` files (`.env.production`)

## Troubleshooting

### Common Issues

1. **"Environment variable not found"**
   - Check if `.env` file exists
   - Verify variable names match exactly
   - Ensure no extra spaces in `.env` file

2. **"Build failed with undefined variables"**
   - Run the build script which validates variables
   - Check for missing required variables
   - Use default values where appropriate

3. **"Container can't connect to services"**
   - Verify `VITE_API_BASE_URL` points to correct backend
   - Check network configuration in docker-compose.yml
   - Ensure backend is healthy before starting frontend

### Validation Script

The build scripts automatically validate required variables:

```bash
# Linux/macOS
./scripts/build-docker.sh

# Windows PowerShell
.\scripts\build-docker.ps1
```

## Development vs Production

### Development

- Use `.env` file with local values
- Enable debug logging
- Use local database connections

### Production

- Use environment-specific `.env` files
- Disable debug logging
- Use production database connections
- Implement proper secret rotation

## Migration from Old Setup

If you're migrating from the previous setup:

1. **Remove hardcoded values**: The Dockerfiles no longer contain hardcoded placeholders
2. **Update docker-compose.yml**: Now uses build context instead of pre-built images
3. **Use build scripts**: Replace manual docker build commands with the provided scripts

## Next Steps

1. Create your `.env` file from the template
2. Fill in your actual configuration values
3. Run the build script to validate and build images
4. Deploy using `docker-compose up -d`

For additional help, refer to the main deployment guide or contact the development team.
