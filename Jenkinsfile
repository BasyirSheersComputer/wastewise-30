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
    VITE_SUPABASE_URL = credentials('wastewise-supabase-url')
    VITE_SUPABASE_ANON_KEY = credentials('wastewise-supabase-anon-key')
  }

  stages {

    stage('Checkout Source') {
      steps {
        git url: 'https://github.com/BasyirSheersComputer/wastewise-30.git', branch: 'main'
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          sh """
          set -e
          docker build \
            --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
            --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
            -t $IMAGE_NAME:$TAG .
          docker tag $IMAGE_NAME:$TAG $IMAGE_NAME:latest
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
          docker push $IMAGE_NAME:$TAG
          docker push $IMAGE_NAME:latest
          """
        }
      }
    }

    stage('Deploy to Production') {
      steps {
        sshagent([SSH_CRED_ID]) {
          sh """
          ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST '
            set -e
            docker pull $IMAGE_NAME:$TAG &&
            docker stop $CONTAINER_NAME || true &&
            docker rm $CONTAINER_NAME || true &&
            docker run -d --name $CONTAINER_NAME \
              -p 8899:80 \
              -p 8843:443 \
              --restart always \
              $IMAGE_NAME:$TAG
          '
          """
        }
      }
    }
  }

  post {
    success {
      echo "✅ Deployment successful!"
    }
    failure {
      echo "❌ Deployment failed!"
    }
  }
}
