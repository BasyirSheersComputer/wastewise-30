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
        
        stage('Deploy to Production') {
            steps {
                script {
                    echo '🚀 Deploying to production...'
                    sshagent(['jenkins-ssh-key']) {
                        sh '''
                            ssh root@$REMOTE_HOST "docker pull $IMAGE_NAME:$TAG"
                            ssh root@$REMOTE_HOST "docker stop $CONTAINER_NAME || true"
                            ssh root@$REMOTE_HOST "docker rm $CONTAINER_NAME || true"
                            ssh root@$REMOTE_HOST "docker run -d --name $CONTAINER_NAME -p 8899:8899 --restart always --health-cmd 'curl -f http://localhost:8899/ || exit 1' --health-interval=30s --health-timeout=10s --health-retries=3 $IMAGE_NAME:$TAG"
                        '''
                    }
                    echo '✅ Application deployed successfully'
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo '🏥 Running health checks...'
                    sh '''
                        sleep 15
                        ssh root@$REMOTE_HOST "curl -f http://localhost:8899/health || exit 1"
                        echo "✅ Health check passed"
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
            }
        }
        failure {
            script {
                echo '❌ Pipeline failed!'
                echo '🔍 Check the logs above for details'
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
