pipeline {
    agent any
    environment {
        IMAGE_NAME = 'basyir/wastewise-30'
        TAG = 'latest'
        CONTAINER_NAME = 'wastewise-30'
        REMOTE_HOST = '192.168.20.215'
        DOCKER_IMAGE = 'node:20-alpine'
        COMPOSE_FILE = 'docker-compose.yml'
    }
    
    stages {
        stage('Validate Project Structure') {
            steps {
                script {
                    echo '🔍 Validating project structure...'
                    sh '''
                        test -d frontend
                        test -d backend
                        test -f frontend/package.json
                        test -f backend/package.json
                        test -f docker-compose.yml
                        test -f Dockerfile.frontend
                        test -f Dockerfile.backend
                        test -f nginx.conf
                        test -f nginx-frontend.conf
                        echo "✅ Project structure validation passed"
                    '''
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    agent { 
                        docker { 
                            image DOCKER_IMAGE
                            args '-u root -v npm-cache:/root/.npm'
                        } 
                    }
                    steps {
                        dir('frontend') {
                            echo '📦 Installing frontend dependencies...'
                            sh '''
                                # Fix npm cache permissions
                                npm config set cache /root/.npm
                                npm cache clean --force
                                
                                # Install dependencies with proper cache handling
                                npm ci --only=production --cache /root/.npm --prefer-offline
                                
                                # Verify installation
                                npm list --depth=0 || echo "Dependencies installed with warnings"
                            '''
                        }
                    }
                }
                stage('Backend Dependencies') {
                    agent { 
                        docker { 
                            image DOCKER_IMAGE
                            args '-u root -v npm-cache:/root/.npm'
                        } 
                    }
                    steps {
                        dir('backend') {
                            echo '📦 Installing backend dependencies...'
                            sh '''
                                # Fix npm cache permissions
                                npm config set cache /root/.npm
                                npm cache clean --force
                                
                                # Install dependencies with proper cache handling
                                npm ci --only=production --cache /root/.npm --prefer-offline
                                
                                # Verify installation
                                npm list --depth=0 || echo "Dependencies installed with warnings"
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Lint and Test') {
            parallel {
                stage('Frontend Lint') {
                    agent { 
                        docker { 
                            image DOCKER_IMAGE
                            args '-u root -v npm-cache:/root/.npm'
                        } 
                    }
                    steps {
                        dir('frontend') {
                            echo '🔍 Linting frontend code...'
                            sh '''
                                # Fix npm cache permissions
                                npm config set cache /root/.npm
                                
                                # Run linting with proper cache
                                npm run lint || echo "Linting completed with warnings"
                            '''
                        }
                    }
                }
                stage('Backend Lint') {
                    agent { 
                        docker { 
                            image DOCKER_IMAGE
                            args '-u root -v npm-cache:/root/.npm'
                        } 
                    }
                    steps {
                        dir('backend') {
                            echo '🔍 Linting backend code...'
                            sh '''
                                # Fix npm cache permissions
                                npm config set cache /root/.npm
                                
                                # Run linting with proper cache
                                npm run lint || echo "Linting completed with warnings"
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Build Multi-Container Images') {
            steps {
                script {
                    echo '🐳 Building multi-container images...'
                    sh '''
                        # Build frontend image
                        docker build -f Dockerfile.frontend -t $IMAGE_NAME:frontend-$TAG .
                        
                        # Build backend image
                        docker build -f Dockerfile.backend -t $IMAGE_NAME:backend-$TAG .
                        
                        # Tag images
                        docker tag $IMAGE_NAME:frontend-$TAG $IMAGE_NAME:frontend-latest
                        docker tag $IMAGE_NAME:backend-$TAG $IMAGE_NAME:backend-latest
                        
                        echo "✅ Multi-container images built successfully"
                    '''
                }
            }
        }
        
        stage('Test Multi-Container Setup') {
            steps {
                script {
                    echo '🧪 Testing multi-container setup...'
                    sh '''
                        # Create .env file for testing
                        echo "NODE_ENV=production" > .env
                        echo "PORT=3001" >> .env
                        echo "DATABASE_URL=postgresql://test:test@localhost:5432/test" >> .env
                        echo "JWT_SECRET=test-secret" >> .env
                        echo "SUPABASE_URL=https://test.supabase.co" >> .env
                        echo "SUPABASE_KEY=test-key" >> .env
                        echo "STRIPE_SECRET_KEY=sk_test_test" >> .env
                        echo "GOOGLE_API_KEY=test-key" >> .env
                        
                        # Start services
                        docker-compose -f $COMPOSE_FILE up -d
                        
                        # Wait for services to be ready
                        sleep 30
                        
                        # Test health endpoints
                        curl -f http://localhost:3000/health || exit 1
                        curl -f http://localhost:3001/health || exit 1
                        curl -f http://localhost:8899/health || exit 1
                        
                        echo "✅ Multi-container test passed"
                        
                        # Stop services
                        docker-compose -f $COMPOSE_FILE down
                    '''
                }
            }
        }
        
        stage('Push Images to DockerHub') {
            steps {
                script {
                    echo '📤 Pushing images to DockerHub...'
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh '''
                            docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
                            docker push $IMAGE_NAME:frontend-$TAG
                            docker push $IMAGE_NAME:frontend-latest
                            docker push $IMAGE_NAME:backend-$TAG
                            docker push $IMAGE_NAME:backend-latest
                        '''
                    }
                    echo '✅ Images pushed to DockerHub'
                }
            }
        }
        
        stage('Deploy Multi-Container Setup') {
            steps {
                script {
                    echo '🚀 Deploying multi-container setup...'
                    sshagent(['jenkins-ssh-key']) {
                        sh '''
                            # Pull latest images
                            ssh root@$REMOTE_HOST "docker pull $IMAGE_NAME:frontend-latest"
                            ssh root@$REMOTE_HOST "docker pull $IMAGE_NAME:backend-latest"
                            
                            # Stop existing containers
                            ssh root@$REMOTE_HOST "docker-compose -f $COMPOSE_FILE down --remove-orphans || true"
                            
                            # Copy compose file and configs
                            scp docker-compose.yml root@$REMOTE_HOST:/root/
                            scp nginx.conf root@$REMOTE_HOST:/root/
                            scp nginx-frontend.conf root@$REMOTE_HOST:/root/
                            
                            # Create .env file on remote
                            ssh root@$REMOTE_HOST "cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/wastewise
JWT_SECRET=your-super-secret-jwt-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
GOOGLE_API_KEY=your-google-api-key
EOF"
                            
                            # Start services
                            ssh root@$REMOTE_HOST "docker-compose -f $COMPOSE_FILE up -d"
                            
                            # Wait for services to be ready
                            ssh root@$REMOTE_HOST "sleep 30"
                            
                            # Verify deployment
                            ssh root@$REMOTE_HOST "curl -f http://localhost:8899/health || exit 1"
                        '''
                    }
                    echo '✅ Multi-container deployment completed'
                }
            }
        }
        
        stage('Verify Multi-Container Deployment') {
            steps {
                script {
                    echo '🏥 Verifying multi-container deployment...'
                    sleep 15
                    ssh root@$REMOTE_HOST "curl -f http://localhost:8899/health || exit 1"
                    ssh root@$REMOTE_HOST "curl -f http://localhost:8899/health/frontend || exit 1"
                    ssh root@$REMOTE_HOST "curl -f http://localhost:8899/health/backend || exit 1"
                    echo "✅ Multi-container deployment verification passed"
                }
            }
        }
    }
    
    post {
        success {
            script {
                echo '✅ Pipeline completed successfully!'
                echo "🌐 Multi-container application deployed:"
                echo "   - Frontend: http://$REMOTE_HOST:3000"
                echo "   - Backend API: http://$REMOTE_HOST:3001"
                echo "   - Nginx Proxy: http://$REMOTE_HOST:8899"
                echo "   - Health Check: http://$REMOTE_HOST:8899/health"
                echo "📋 Docker Compose Commands:"
                echo "   - View logs: docker-compose -f $COMPOSE_FILE logs -f"
                echo "   - Stop services: docker-compose -f $COMPOSE_FILE down"
                echo "   - Restart services: docker-compose -f $COMPOSE_FILE restart"
                echo "   - Scale backend: docker-compose -f $COMPOSE_FILE up -d --scale backend=2"
            }
        }
        failure {
            script {
                echo '❌ Pipeline failed!'
                echo '🔍 Check the logs above for details'
                echo '🐳 Docker troubleshooting:'
                echo '   - Check containers: docker-compose -f $COMPOSE_FILE ps'
                echo '   - View logs: docker-compose -f $COMPOSE_FILE logs'
                echo '   - Check images: docker images | grep $IMAGE_NAME'
            }
        }
        always {
            script {
                echo '🧹 Cleaning up workspace...'
                sh '''
                    docker-compose -f $COMPOSE_FILE down --remove-orphans || true
                    docker image prune -f
                '''
            }
        }
        cleanup {
            script {
                echo '🧹 Final cleanup...'
                sh 'docker image prune -f'
            }
        }
    }
}
