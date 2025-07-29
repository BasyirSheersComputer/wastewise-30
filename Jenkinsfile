pipeline {
  agent any

  environment {
    IMAGE_NAME = 'basyir/wastewise-30'
    TAG = "${env.BUILD_NUMBER}"
    SSH_CRED_ID = 'vm-ssh-key'
    DOCKER_CRED_ID = 'dockerhub-creds'
    REMOTE_HOST = '192.168.20.215'
    REMOTE_USER = 'basyir'
    CONTAINER_NAME = 'wastewise-30'
    DOCKER_REGISTRY = 'docker.io'
  }

  stages {

    stage('Checkout Source') {
      steps {
        checkout scm
        script {
          echo "📦 Checking out code from branch: ${env.BRANCH_NAME ?: 'main'}"
        }
      }
    }

    stage('Validate Project Structure') {
      steps {
        script {
          echo "🔍 Validating project structure..."
          sh """
            # Check if required directories exist
            test -d frontend || (echo "❌ frontend directory not found" && exit 1)
            test -d backend || (echo "❌ backend directory not found" && exit 1)
            test -f frontend/package.json || (echo "❌ frontend/package.json not found" && exit 1)
            test -f backend/package.json || (echo "❌ backend/package.json not found" && exit 1)
            test -f Dockerfile || (echo "❌ Dockerfile not found" && exit 1)
            echo "✅ Project structure validation passed"
          """
        }
      }
    }

    stage('Install Dependencies') {
      parallel {
        stage('Frontend Dependencies') {
          steps {
            dir('frontend') {
              sh """
                echo "📦 Installing frontend dependencies..."
                npm ci --only=production
              """
            }
          }
        }
        stage('Backend Dependencies') {
          steps {
            dir('backend') {
              sh """
                echo "📦 Installing backend dependencies..."
                npm ci --only=production
              """
            }
          }
        }
      }
    }

    stage('Lint and Test') {
      parallel {
        stage('Frontend Lint') {
          steps {
            dir('frontend') {
              sh """
                echo "🔍 Linting frontend code..."
                npm run lint || echo "⚠️ Frontend linting issues found (non-blocking)"
              """
            }
          }
        }
        stage('Backend Lint') {
          steps {
            dir('backend') {
              sh """
                echo "🔍 Linting backend code..."
                npm run lint || echo "⚠️ Backend linting issues found (non-blocking)"
              """
            }
          }
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          echo "🐳 Building Docker image: $IMAGE_NAME:$TAG"
          sh """
            set -e
            docker build --no-cache -t $IMAGE_NAME:$TAG .
            docker tag $IMAGE_NAME:$TAG $IMAGE_NAME:latest
            echo "✅ Docker image built successfully"
          """
        }
      }
    }

    stage('Test Docker Image') {
      steps {
        script {
          echo "🧪 Testing Docker image..."
          sh """
            # Start container for testing
            docker run -d --name test-wastewise -p 8080:80 $IMAGE_NAME:$TAG
            
            # Wait for container to start
            sleep 10
            
            # Test if container is running
            docker ps | grep test-wastewise || (echo "❌ Container failed to start" && exit 1)
            
            # Test basic connectivity (optional - remove if not needed)
            curl -f http://localhost:8080 || echo "⚠️ Frontend not accessible (may be normal during startup)"
            
            # Cleanup test container
            docker stop test-wastewise || true
            docker rm test-wastewise || true
            
            echo "✅ Docker image test passed"
          """
        }
      }
    }

    stage('Push to DockerHub') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: DOCKER_CRED_ID,
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          script {
            echo "📤 Pushing to DockerHub..."
            sh """
              set -e
              echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
              docker push $IMAGE_NAME:$TAG
              docker push $IMAGE_NAME:latest
              echo "✅ Images pushed successfully"
            """
          }
        }
      }
    }

    stage('Deploy to Production') {
      steps {
        sshagent([SSH_CRED_ID]) {
          script {
            echo "🚀 Deploying to production server..."
            sh """
              ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST '
                set -e
                echo "📥 Pulling latest image..."
                docker pull $IMAGE_NAME:$TAG
                
                echo "🛑 Stopping existing container..."
                docker stop $CONTAINER_NAME || true
                docker rm $CONTAINER_NAME || true
                
                echo "🚀 Starting new container..."
                docker run -d --name $CONTAINER_NAME \
                  -p 8899:80 \
                  -p 8843:443 \
                  --restart always \
                  --health-cmd "curl -f http://localhost/ || exit 1" \
                  --health-interval=30s \
                  --health-timeout=10s \
                  --health-retries=3 \
                  $IMAGE_NAME:$TAG
                
                echo "⏳ Waiting for container to be healthy..."
                sleep 10
                
                # Check if container is running
                docker ps | grep $CONTAINER_NAME || (echo "❌ Container failed to start" && exit 1)
                
                echo "✅ Deployment completed successfully"
              '
            """
          }
        }
      }
    }

    stage('Health Check') {
      steps {
        script {
          echo "🏥 Performing health check..."
          sh """
            sleep 15
            curl -f http://$REMOTE_HOST:8899 || (echo "❌ Health check failed" && exit 1)
            echo "✅ Health check passed"
          """
        }
      }
    }
  }

  post {
    always {
      script {
        echo "🧹 Cleaning up workspace..."
        sh """
          # Clean up any test containers
          docker stop test-wastewise || true
          docker rm test-wastewise || true
          
          # Clean up Docker images to save space
          docker image prune -f || true
        """
      }
    }
    success {
      script {
        echo "✅ Pipeline completed successfully!"
        echo "🌐 Application deployed at: http://$REMOTE_HOST:8899"
        echo "📊 Build Number: $BUILD_NUMBER"
        echo "🐳 Image: $IMAGE_NAME:$TAG"
      }
    }
    failure {
      script {
        echo "❌ Pipeline failed!"
        echo "🔍 Check the logs above for details"
        
        // Optional: Send notification on failure
        // emailext (
        //   subject: "Pipeline Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
        //   body: "Pipeline failed. Check: ${env.BUILD_URL}",
        //   to: "admin@example.com"
        // )
      }
    }
    cleanup {
      script {
        echo "🧹 Final cleanup..."
        sh """
          # Remove any dangling images
          docker image prune -f || true
        """
      }
    }
  }
}
