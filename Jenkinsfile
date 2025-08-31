pipeline {
    agent any

    environment {
        // Docker image base name
        IMAGE_NAME = 'basyir/wastewise-30'
        TAG = "${env.BUILD_NUMBER}"

        // Credentials for Docker Hub
        DOCKER_CRED_ID = 'dockerhub-creds'
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
                    // Build frontend with build args (aligned with cloudbuild.yaml)
                    sh """
                        docker build -f Dockerfile.frontend \
                            --build-arg VITE_SUPABASE_URL=\${VITE_SUPABASE_URL} \
                            --build-arg VITE_SUPABASE_ANON_KEY=\${VITE_SUPABASE_ANON_KEY} \
                            --build-arg VITE_STRIPE_PUBLISHABLE_KEY=\${VITE_STRIPE_PUBLISHABLE_KEY} \
                            --build-arg VITE_API_BASE_URL=\${VITE_API_BASE_URL:-http://localhost:3000} \
                            --build-arg VITE_TRIAL_PERIOD_DAYS=\${VITE_TRIAL_PERIOD_DAYS:-30} \
                            -t ${IMAGE_NAME}-frontend:${TAG} .
                    """
                    sh "docker tag ${IMAGE_NAME}-frontend:${TAG} ${IMAGE_NAME}-frontend:latest"

                    // Build backend
                    sh "docker build -f Dockerfile.backend -t ${IMAGE_NAME}-backend:${TAG} ."
                    sh "docker tag ${IMAGE_NAME}-backend:${TAG} ${IMAGE_NAME}-backend:latest"
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    // Run backend tests
                    sh "docker run --rm ${IMAGE_NAME}-backend:${TAG} npm test"
                    
                    // Run frontend build test
                    sh "docker run --rm ${IMAGE_NAME}-frontend:${TAG} nginx -t"
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

        stage('Trigger Cloud Build') {
            steps {
                script {
                    // Trigger Google Cloud Build for deployment
                    // This aligns with the simplified cloudbuild.yaml approach
                    sh """
                        gcloud builds submit --config cloudbuild.yaml \
                            --substitutions=_BUILD_ID=${TAG} \
                            --project=\${GCP_PROJECT_ID}
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ WasteWise-30 CI/CD pipeline completed successfully!"
            echo "🐳 Images pushed to DockerHub: ${IMAGE_NAME}-frontend:${TAG}, ${IMAGE_NAME}-backend:${TAG}"
            echo "☁️ Cloud Build deployment triggered"
        }
        failure {
            echo "❌ CI/CD pipeline failed. Check logs."
        }
        always {
            // Cleanup local images
            sh "docker rmi ${IMAGE_NAME}-frontend:${TAG} || true"
            sh "docker rmi ${IMAGE_NAME}-backend:${TAG} || true"
            sh "docker rmi ${IMAGE_NAME}-frontend:latest || true"
            sh "docker rmi ${IMAGE_NAME}-backend:latest || true"
        }
    }
}
