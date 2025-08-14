# Google Cloud Run Deployment Plan for WasteWise

## Overview
This document outlines the complete deployment plan for the WasteWise application on Google Cloud Run with separate containers for frontend and backend, connected to Supabase database.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Supabase     │
│   Container     │◄──►│   Container     │◄──►│    Database     │
│   (React)       │    │   (Node.js)     │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Cloud Run      │    │  Cloud Run      │    │  External       │
│  Frontend       │    │  Backend        │    │  Supabase       │
│  Service        │    │  Service        │    │  Service        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### 1. Google Cloud Project Setup
- [ ] Create Google Cloud project: `wastewise-30`
- [ ] Enable required APIs:
  - [ ] Cloud Run API
  - [ ] Container Registry API
  - [ ] Cloud Build API
  - [ ] Secret Manager API
  - [ ] Cloud Logging API
  - [ ] Cloud Monitoring API

### 2. Development Environment
- [ ] Install Google Cloud CLI: `gcloud init`
- [ ] Install Docker Desktop
- [ ] Configure Docker for Google Cloud: `gcloud auth configure-docker`
- [ ] Set up project: `gcloud config set project wastewise-30`

## Phase 1: Environment Configuration

### 1.1 Environment Variables Setup
Create environment files for different environments:

**Frontend Environment Variables:**
```bash
# .env.production
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://backend-service-url.run.app
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_TRIAL_PERIOD_DAYS=30
```

**Backend Environment Variables:**
```bash
# .env.production
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_key
GOOGLE_GENAI_API_KEY=your_google_genai_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://frontend-service-url.run.app
```

### 1.2 Google Cloud Secret Manager Setup
```bash
# Create secrets for sensitive data
gcloud secrets create supabase-url --data-file=- <<< "your_supabase_url"
gcloud secrets create supabase-anon-key --data-file=- <<< "your_supabase_anon_key"
gcloud secrets create supabase-service-key --data-file=- <<< "your_supabase_service_key"
gcloud secrets create openai-api-key --data-file=- <<< "your_openai_key"
gcloud secrets create google-genai-key --data-file=- <<< "your_google_genai_key"
gcloud secrets create stripe-secret-key --data-file=- <<< "your_stripe_secret_key"
gcloud secrets create stripe-webhook-secret --data-file=- <<< "your_webhook_secret"
gcloud secrets create jwt-secret --data-file=- <<< "your_jwt_secret"
```

## Phase 2: Container Configuration

### 2.1 Frontend Container (Dockerfile.frontend)
```dockerfile
# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

### 2.2 Backend Container (Dockerfile.backend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8080
CMD ["npm", "start"]
```

### 2.3 Nginx Configuration (nginx.conf)
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 8080;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Handle React Router
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## Phase 3: Cloud Run Services Configuration

### 3.1 Backend Service Configuration
```yaml
# backend-service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: wastewise-backend
  annotations:
    run.googleapis.com/ingress: all
    run.googleapis.com/execution-environment: gen2
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/cpu-throttling: "false"
        run.googleapis.com/startup-cpu-boost: "true"
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "10"
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      containers:
      - image: gcr.io/wastewise-30/backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "8080"
        - name: CORS_ORIGIN
          value: "https://wastewise-frontend-xxxxx-uc.a.run.app"
        envFrom:
        - secretRef:
            name: wastewise-secrets
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
          requests:
            cpu: "500m"
            memory: "512Mi"
```

### 3.2 Frontend Service Configuration
```yaml
# frontend-service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: wastewise-frontend
  annotations:
    run.googleapis.com/ingress: all
    run.googleapis.com/execution-environment: gen2
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "5"
    spec:
      containerConcurrency: 100
      timeoutSeconds: 60
      containers:
      - image: gcr.io/wastewise-30/frontend:latest
        ports:
        - containerPort: 8080
        env:
        - name: VITE_API_BASE_URL
          value: "https://wastewise-backend-xxxxx-uc.a.run.app"
        envFrom:
        - secretRef:
            name: wastewise-frontend-secrets
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "250m"
            memory: "256Mi"
```

## Phase 4: Deployment Strategy

### 4.1 Build and Push Images
```bash
# Build and push backend image
cd backend
docker build -t gcr.io/wastewise-30/backend:latest .
docker push gcr.io/wastewise-30/backend:latest

# Build and push frontend image
cd ../frontend
docker build -t gcr.io/wastewise-30/frontend:latest .
docker push gcr.io/wastewise-30/frontend:latest
```

### 4.2 Deploy Services
```bash
# Deploy backend service
gcloud run deploy wastewise-backend \
  --image gcr.io/wastewise-30/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production,PORT=8080 \
  --set-secrets SUPABASE_URL=supabase-url:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-service-key:latest

# Deploy frontend service
gcloud run deploy wastewise-frontend \
  --image gcr.io/wastewise-30/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 500m \
  --min-instances 1 \
  --max-instances 5
```

### 4.3 Update CORS Configuration
After deployment, update the backend CORS configuration with the actual frontend URL:

```bash
# Get the frontend service URL
FRONTEND_URL=$(gcloud run services describe wastewise-frontend --region us-central1 --format="value(status.url)")

# Update backend service with correct CORS origin
gcloud run services update wastewise-backend \
  --region us-central1 \
  --set-env-vars CORS_ORIGIN=$FRONTEND_URL
```

## Phase 5: Networking and Security

### 5.1 VPC Connector (Optional)
For enhanced security, create a VPC connector:

```bash
# Create VPC network
gcloud compute networks create wastewise-vpc --subnet-mode=auto

# Create VPC connector
gcloud compute networks vpc-access connectors create wastewise-connector \
  --network wastewise-vpc \
  --region us-central1 \
  --range 10.8.0.0/28
```

### 5.2 Load Balancer (Optional)
For custom domain and SSL:

```bash
# Create load balancer
gcloud compute url-maps create wastewise-lb \
  --default-service wastewise-frontend

# Create HTTPS proxy
gcloud compute target-https-proxies create wastewise-https-proxy \
  --url-map wastewise-lb \
  --ssl-certificates wastewise-ssl-cert

# Create forwarding rule
gcloud compute forwarding-rules create wastewise-https \
  --target-https-proxy wastewise-https-proxy \
  --global \
  --ports 443
```

## Phase 6: Monitoring and Logging

### 6.1 Cloud Monitoring Setup
```bash
# Create monitoring workspace
gcloud monitoring workspaces create --display-name="WasteWise Monitoring"

# Set up alerting policies
gcloud alpha monitoring policies create --policy-from-file=alerting-policy.yaml
```

### 6.2 Logging Configuration
```bash
# Create log sinks
gcloud logging sinks create wastewise-logs \
  storage.googleapis.com/wastewise-logs-bucket \
  --log-filter="resource.type=cloud_run_revision"

# Create custom metrics
gcloud logging metrics create wastewise-api-errors \
  --description="API Error Rate" \
  --log-filter="resource.type=cloud_run_revision AND severity>=ERROR"
```

## Phase 7: CI/CD Pipeline

### 7.1 Cloud Build Configuration
```yaml
# cloudbuild.yaml
steps:
  # Build backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA', '-f', 'Dockerfile.backend', './backend']
  
  # Build frontend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/frontend:$COMMIT_SHA', '-f', 'Dockerfile.frontend', './frontend']
  
  # Push images
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/frontend:$COMMIT_SHA']
  
  # Deploy backend
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'wastewise-backend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
  
  # Deploy frontend
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'wastewise-frontend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/frontend:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA'
  - 'gcr.io/$PROJECT_ID/frontend:$COMMIT_SHA'
```

## Phase 8: Testing Strategy

### 8.1 Local Testing
```bash
# Test backend locally
cd backend
docker build -t wastewise-backend:local .
docker run -p 8080:8080 --env-file .env.local wastewise-backend:local

# Test frontend locally
cd frontend
docker build -t wastewise-frontend:local .
docker run -p 3000:8080 --env-file .env.local wastewise-frontend:local
```

### 8.2 Integration Testing
```bash
# Test service communication
curl -X GET https://backend-service-url/health
curl -X GET https://frontend-service-url/health

# Test API endpoints
curl -X POST https://backend-service-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Phase 9: Performance Optimization

### 9.1 Container Optimization
- [ ] Multi-stage builds for smaller images
- [ ] Alpine Linux base images
- [ ] Layer caching optimization
- [ ] Security scanning

### 9.2 Cloud Run Optimization
- [ ] CPU and memory allocation tuning
- [ ] Concurrency settings
- [ ] Cold start optimization
- [ ] Auto-scaling configuration

## Phase 10: Cost Management

### 10.1 Cost Estimation
- **Cloud Run**: $0.00002400 per 100ms of CPU allocation
- **Container Registry**: $0.026 per GB stored
- **Secret Manager**: $0.06 per 10,000 operations
- **Monitoring**: $0.25 per million log entries

### 10.2 Cost Optimization
- [ ] Right-size container resources
- [ ] Implement auto-scaling
- [ ] Use spot instances where possible
- [ ] Monitor and optimize usage

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Secrets stored in Secret Manager
- [ ] Docker images built and tested
- [ ] Database migrations completed
- [ ] Security scanning passed

### Deployment
- [ ] Deploy backend service
- [ ] Deploy frontend service
- [ ] Update CORS configuration
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and alerting
- [ ] Verify all services are running

### Post-Deployment
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify database connectivity
- [ ] Test payment integration
- [ ] Update documentation

## Rollback Plan

### Immediate Rollback
```bash
# Rollback to previous version
gcloud run services update-traffic wastewise-backend \
  --to-revisions=wastewise-backend-00001-abc=100

gcloud run services update-traffic wastewise-frontend \
  --to-revisions=wastewise-frontend-00001-def=100
```

### Emergency Procedures
1. Identify the issue
2. Assess impact
3. Execute rollback
4. Communicate to stakeholders
5. Investigate root cause
6. Implement fix
7. Re-deploy

## Success Metrics

### Technical Metrics
- [ ] 99.9% uptime
- [ ] < 200ms API response time
- [ ] < 2s page load time
- [ ] Zero security vulnerabilities
- [ ] < 1% error rate

### Business Metrics
- [ ] User adoption rate
- [ ] Feature usage statistics
- [ ] Customer satisfaction scores
- [ ] Cost per user
- [ ] Revenue impact

## Timeline

### Week 1: Setup and Configuration
- Google Cloud project setup
- Environment configuration
- Secret Manager setup
- Basic deployment testing

### Week 2: Container Development
- Dockerfile creation
- Local testing
- Image optimization
- Security scanning

### Week 3: Deployment and Testing
- Cloud Run deployment
- Integration testing
- Performance optimization
- Monitoring setup

### Week 4: Production Readiness
- Production deployment
- Load testing
- Security audit
- Documentation completion

## Conclusion

This Google Cloud Run deployment plan provides a comprehensive approach to deploying the WasteWise application with separate containers for frontend and backend. The plan ensures high availability, security, and performance while maintaining cost efficiency.

The containerized approach allows for independent scaling and deployment of frontend and backend services, while the connection to Supabase provides a robust and scalable database solution.
