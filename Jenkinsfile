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

    // Container names
    FRONTEND_CONTAINER = 'wastewise-frontend'
    BACKEND_CONTAINER = 'wastewise-backend'
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
          sh """
            set -e
            docker build -f Dockerfile.frontend -t $IMAGE_NAME-frontend:$TAG .
            docker tag $IMAGE_NAME-frontend:$TAG $IMAGE_NAME-frontend:latest

            docker build -f Dockerfile.backend -t $IMAGE_NAME-backend:$TAG .
            docker tag $IMAGE_NAME-backend:$TAG $IMAGE_NAME-backend:latest
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
          sh """
            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin

            docker push $IMAGE_NAME-frontend:$TAG
            docker push $IMAGE_NAME-frontend:latest

            docker push $IMAGE_NAME-backend:$TAG
            docker push $IMAGE_NAME-backend:latest
          """
        }
      }
    }

    stage('Deploy Containers on Host') {
      steps {
        sshagent([SSH_CRED_ID]) {
          sh """
            ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST '
              set -e

              docker pull $IMAGE_NAME-frontend:$TAG
              docker pull $IMAGE_NAME-backend:$TAG

              docker stop $FRONTEND_CONTAINER || true
              docker rm $FRONTEND_CONTAINER || true

              docker stop $BACKEND_CONTAINER || true
              docker rm $BACKEND_CONTAINER || true

              docker run -d --name $FRONTEND_CONTAINER \\
                -p 8899:8899 \\
                --restart always \\
                $IMAGE_NAME-frontend:$TAG

              docker run -d --name $BACKEND_CONTAINER \\
                -p 3000:3000 \\
                --restart always \\
                $IMAGE_NAME-backend:$TAG
            '
          """
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
