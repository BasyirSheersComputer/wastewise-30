pipeline {
    agent any

    environment {
        // Docker image base name
        IMAGE_NAME = 'basyir/wastewise-30'
        TAG = "${env.BUILD_NUMBER}"

        // Credentials & deployment
        SSH_CRED_ID = 'vm-ssh-key'
        DOCKER_CRED_ID = 'dockerhub-creds'
        REMOTE_HOST = '192.168.20.215'
        REMOTE_USER = 'basyir'
        REMOTE_PATH = '/home/basyir/wastewise-30-deploy'
    }

    stages {
        stage('Checkout Source') {
            steps {
                git url: 'https://github.com/BasyirSheersComputer/wastewise-30.git', branch: 'main'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh "docker build -f Dockerfile.frontend -t ${IMAGE_NAME}-frontend:${TAG} ."
                    sh "docker tag ${IMAGE_NAME}-frontend:${TAG} ${IMAGE_NAME}-frontend:latest"

                    sh "docker build -f Dockerfile.backend -t ${IMAGE_NAME}-backend:${TAG} ."
                    sh "docker tag ${IMAGE_NAME}-backend:${TAG} ${IMAGE_NAME}-backend:latest"
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                // This block securely handles Docker login and push
                withDockerRegistry(credentialsId: DOCKER_CRED_ID, url: '') {
                    sh "docker push ${IMAGE_NAME}-frontend:${TAG}"
                    sh "docker push ${IMAGE_NAME}-frontend:latest"
                    sh "docker push ${IMAGE_NAME}-backend:${TAG}"
                    sh "docker push ${IMAGE_NAME}-backend:latest"
                }
            }
        }

        stage('Copy Docker Compose File to Host') {
            steps {
                sshagent([SSH_CRED_ID]) {
                    sh "scp -o StrictHostKeyChecking=no ./docker-compose.yml ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/docker-compose.yml"
                }
            }
        }

        stage('Deploy Containers on Host') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'wastewise-supabase-url', variable: 'VITE_SUPABASE_URL'),
                        string(credentialsId: 'wastewise-supabase-anon-key', variable: 'VITE_SUPABASE_ANON_KEY'),
                        string(credentialsId: 'stripe-secret-key', variable: 'STRIPE_SECRET_KEY'),
                        string(credentialsId: 'stripe-publishable-key', variable: 'STRIPE_PUBLISHABLE_KEY'),
                        string(credentialsId: 'stripe-price-basic', variable: 'STRIPE_PRICE_BASIC'),
                        string(credentialsId: 'stripe-price-pro', variable: 'STRIPE_PRICE_PRO'),
                        string(credentialsId: 'stripe-price-enterprise', variable: 'STRIPE_PRICE_ENTERPRISE'),
                        string(credentialsId: 'gemini-api-key', variable: 'GEMINI_API_KEY'),
                        string(credentialsId: 'openai-api-key', variable: 'OPENAI_API_KEY'),
                        string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                        string(credentialsId: 'smtp-user', variable: 'SMTP_USER'),
                        string(credentialsId: 'smtp-pass', variable: 'SMTP_PASS'),
                        string(credentialsId: 'twilio-sid', variable: 'TWILIO_ACCOUNT_SID'),
                        string(credentialsId: 'twilio-token', variable: 'TWILIO_AUTH_TOKEN'),
                        string(credentialsId: 'twilio-phone', variable: 'TWILIO_PHONE_NUMBER'),
                        string(credentialsId: 'database-url', variable: 'DATABASE_URL')
                    ]) {
                        sshagent([SSH_CRED_ID]) {
                            sh """
                                set -e
                                ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} '
                                    set -e
                                    cd ${REMOTE_PATH}
                                    
                                    # Create logs directory if it doesn\'t exist
                                    mkdir -p logs
                                    
                                    # Create or update the .env file with secrets
                                    cat > .env <<EOL
                                    # Supabase Configuration
                                    VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
                                    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
                                    
                                    # AI Service Configuration
                                    GEMINI_API_KEY=${GEMINI_API_KEY}
                                    OPENAI_API_KEY=${OPENAI_API_KEY}
                                    
                                    # JWT Configuration
                                    JWT_SECRET=${JWT_SECRET}
                                    
                                    # Stripe Configuration
                                    STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
                                    STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
                                    STRIPE_PRICE_BASIC=${STRIPE_PRICE_BASIC}
                                    STRIPE_PRICE_PRO=${STRIPE_PRICE_PRO}
                                    STRIPE_PRICE_ENTERPRISE=${STRIPE_PRICE_ENTERPRISE}
                                    
                                    # Email Configuration
                                    SMTP_USER=${SMTP_USER}
                                    SMTP_PASS=${SMTP_PASS}
                                    
                                    # SMS Configuration
                                    TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
                                    TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
                                    TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
                                    
                                    # Database Configuration
                                    DATABASE_URL=${DATABASE_URL}
                                    
                                    # Application Configuration
                                    NODE_ENV=production
                                    PORT=3000
                                    CORS_ORIGIN=https://sheerstechnologies.com
                                    
                                    # Feature Flags
                                    AI_RECOMMENDATIONS_ENABLED=true
                                    PAYMENT_PROCESSING_ENABLED=false
                                    EMAIL_NOTIFICATIONS_ENABLED=true
                                    SMS_NOTIFICATIONS_ENABLED=false
                                    EOL
                                    
                                    # Set proper permissions for .env file
                                    chmod 600 .env
                                    
                                    # Stop and remove old containers
                                    docker-compose down --remove-orphans || true
                                    
                                    # Pull latest images
                                    docker-compose pull
                                    
                                    # Start containers with new configuration
                                    docker-compose up -d --build --force-recreate
                                    
                                    # Wait for services to be healthy
                                    echo "Waiting for services to be healthy..."
                                    timeout 120 bash -c "until docker-compose ps | grep -q healthy; do sleep 5; done" || echo "Warning: Some services may not be healthy yet"
                                    
                                    # Verify secrets are properly loaded
                                    echo "Verifying secrets are loaded..."
                                    docker-compose exec -T wastewise-backend env | grep -E "(GEMINI_API_KEY|OPENAI_API_KEY|VITE_SUPABASE_URL)" | wc -l || echo "Warning: Could not verify secrets in backend"
                                    
                                    # Show container status
                                    docker-compose ps
                                '
                            """
                        }
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    sshagent([SSH_CRED_ID]) {
                        sh """
                            # Wait a bit for services to fully start
                            sleep 30
                            
                            # Test backend health
                            curl -f http://${REMOTE_HOST}:3000/health || echo "Backend health check failed"
                            
                            # Test frontend accessibility
                            curl -f http://${REMOTE_HOST}:8899 || echo "Frontend accessibility check failed"
                            
                            # Check container logs for any errors
                            ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} '
                                cd ${REMOTE_PATH}
                                echo "=== Backend Logs ==="
                                docker-compose logs --tail=20 wastewise-backend
                                echo "=== Frontend Logs ==="
                                docker-compose logs --tail=20 wastewise-frontend
                            '
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ WasteWise-30 frontend & backend deployed successfully!"
            echo "🌐 Frontend: http://${REMOTE_HOST}:8899"
            echo "🔧 Backend: http://${REMOTE_HOST}:3000"
            echo "🏥 Health Check: http://${REMOTE_HOST}:3000/health"
        }
        failure {
            echo "❌ Deployment failed. Check logs."
            script {
                sshagent([SSH_CRED_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} '
                            cd ${REMOTE_PATH}
                            echo "=== Container Status ==="
                            docker-compose ps
                            echo "=== Recent Logs ==="
                            docker-compose logs --tail=50
                        '
                    """
                }
            }
        }
    }
}
