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
                sshagent([SSH_CRED_ID]) {
                    // It's still safe to use withCredentials here because the variables are not
                    // being passed into a sh '...' command that interpolates them
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
                        sh """
                            # SSH into the remote host and perform deployment
                            ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} '
                                set -e
                                cd ${REMOTE_PATH} 
                                
                                # Stop and remove old containers before starting new ones
                                docker-compose down
                                
                                # Pull the latest images and restart containers
                                docker-compose pull
                                docker-compose up -d
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
        }
        failure {
            echo "❌ Deployment failed. Check logs."
        }
    }
}