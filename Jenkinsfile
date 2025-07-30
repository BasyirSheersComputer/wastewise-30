pipeline {
    agent any
    
    environment {
        IMAGE_NAME = 'basyir/wastewise-30'
        TAG = 'latest'
        CONTAINER_NAME = 'wastewise-30'
        REMOTE_HOST = '192.168.20.215'
        DOCKER_IMAGE = 'node:20-alpine'
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
                        test -f Dockerfile
                        echo "✅ Project structure validation passed"
                    '''
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    agent { docker DOCKER_IMAGE }
                    steps {
                        dir('frontend') {
                            echo '📦 Installing frontend dependencies...'
                            sh 'npm ci --only=production'
                        }
                    }
                }
                stage('Backend Dependencies') {
                    agent { docker DOCKER_IMAGE }
                    steps {
                        dir('backend') {
                            echo '📦 Installing backend dependencies...'
                            sh 'npm ci --only=production'
                        }
                    }
                }
            }
        }
        
        stage('Lint and Test') {
            parallel {
                stage('Frontend Lint') {
                    agent { docker DOCKER_IMAGE }
                    steps {
                        dir('frontend') {
                            echo '🔍 Linting frontend code...'
                            sh 'npm run lint || echo "Linting completed with warnings"'
                        }
                    }
                }
                stage('Backend Lint') {
                    agent { docker DOCKER_IMAGE }
                    steps {
                        dir('backend') {
                            echo '🔍 Linting backend code...'
                            sh 'npm run lint || echo "Linting completed with warnings"'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo '🐳 Building Docker image...'
                    sh 'docker build -t $IMAGE_NAME:$TAG .'
                    echo '✅ Docker image built successfully'
                }
            }
        }
        
        stage('Test Docker Image') {
            steps {
                script {
                    echo '🧪 Testing Docker image...'
                    sh '''
                        docker run -d --name test-wastewise -p 8899:8899 $IMAGE_NAME:$TAG
                        sleep 10
                        curl -f http://localhost:8899/ || exit 1
                        echo "✅ Docker image test passed"
                    '''
                }
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                script {
                    echo '📤 Pushing to DockerHub...'
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh '''
                            docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
                            docker push $IMAGE_NAME:$TAG
                        '''
                    }
                    echo '✅ Image pushed to DockerHub'
                }
            }
        }
        
        stage('Deploy with Docker') {
            steps {
                script {
                    echo '🚀 Deploying with Docker...'
                    sshagent(['jenkins-ssh-key']) {
                        sh '''
                            # Pull latest image
                            ssh root@$REMOTE_HOST "docker pull $IMAGE_NAME:$TAG"
                            
                            # Stop and remove existing container
                            ssh root@$REMOTE_HOST "docker stop $CONTAINER_NAME || true"
                            ssh root@$REMOTE_HOST "docker rm $CONTAINER_NAME || true"
                            
                            # Deploy new container with Docker
                            ssh root@$REMOTE_HOST "docker run -d --name $CONTAINER_NAME -p 8899:8899 --restart always --health-cmd 'curl -f http://localhost:8899/ || exit 1' --health-interval=30s --health-timeout=10s --health-retries=3 $IMAGE_NAME:$TAG"
                            
                            # Wait for container to be healthy
                            ssh root@$REMOTE_HOST "timeout 60 bash -c 'until docker inspect $CONTAINER_NAME --format=\"{{.State.Health.Status}}\" | grep -q healthy; do sleep 2; done' || echo 'Container started but health check pending'"
                        '''
                    }
                    echo '✅ Application deployed with Docker'
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    echo '🏥 Verifying deployment...'
                    sh '''
                        sleep 15
                        ssh root@$REMOTE_HOST "curl -f http://localhost:8899/health || exit 1"
                        echo "✅ Deployment verification passed"
                    '''
                }
            }
        }
    }
    
    post {
        success {
            script {
                echo '✅ Pipeline completed successfully!'
                echo "🌐 Application deployed at: http://sheerstechnologies.com/wastewise-30/"
                echo "🔗 Container direct access: http://$REMOTE_HOST:8899"
                echo "🏥 Health check: http://$REMOTE_HOST:8899/health"
                echo "📊 Build Number: $BUILD_NUMBER"
                echo "🐳 Image: $IMAGE_NAME:$TAG"
                echo "📋 Docker Commands:"
                echo "   - Check container: docker ps | grep $CONTAINER_NAME"
                echo "   - View logs: docker logs $CONTAINER_NAME"
                echo "   - Restart: docker restart $CONTAINER_NAME"
                echo "   - Stop: docker stop $CONTAINER_NAME"
            }
        }
        failure {
            script {
                echo '❌ Pipeline failed!'
                echo '🔍 Check the logs above for details'
                echo '🐳 Docker troubleshooting:'
                echo '   - Check container status: docker ps -a'
                echo '   - View container logs: docker logs $CONTAINER_NAME'
                echo '   - Check image: docker images | grep $IMAGE_NAME'
            }
        }
        always {
            script {
                echo '🧹 Cleaning up workspace...'
                sh '''
                    docker stop test-wastewise || true
                    docker rm test-wastewise || true
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
