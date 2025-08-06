pipeline {
  agent any

  environment {
    // Docker image base name
    IMAGE_NAME       = 'basyir/wastewise-30'
    TAG              = "${env.BUILD_NUMBER}"

    // Credentials & deployment
    SSH_CRED_ID      = 'vm-ssh-key'
    DOCKER_CRED_ID   = 'dockerhub-creds'
    REMOTE_HOST      = '192.168.20.215'
    REMOTE_USER      = 'basyir'

    // Container names
    FRONTEND_CONTAINER = 'wastewise-frontend'
    BACKEND_CONTAINER  = 'wastewise-backend'
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
              ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST '
                set -e

                docker pull $IMAGE_NAME-frontend:$TAG
                docker pull $IMAGE_NAME-backend:$TAG

                docker stop $FRONTEND_CONTAINER || true
                docker rm $FRONTEND_CONTAINER || true

                docker stop $BACKEND_CONTAINER || true
                docker rm $BACKEND_CONTAINER || true

                docker run -d --name $FRONTEND_CONTAINER \\
                  -p 127.0.0.1:8899:8899 \\
                  --restart always \\
                  -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \\
                  -e VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \\
                  -e VITE_STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY" \\
                  -e VITE_FRONTEND_URL="https://sheerstechnologies.com/wastewise-30" \\
                  -e VITE_BACKEND_URL="https://sheerstechnologies.com/wastewise-30/api" \\
                  $IMAGE_NAME-frontend:$TAG

                docker run -d --name $BACKEND_CONTAINER \\
                  -p 127.0.0.1:3000:3000 \\
                  --restart always \\
                  -e STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \\
                  -e STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY" \\
                  -e STRIPE_PRICE_BASIC="$STRIPE_PRICE_BASIC" \\
                  -e STRIPE_PRICE_PRO="$STRIPE_PRICE_PRO" \\
                  -e STRIPE_PRICE_ENTERPRISE="$STRIPE_PRICE_ENTERPRISE" \\
                  -e GEMINI_API_KEY="$GEMINI_API_KEY" \\
                  -e OPENAI_API_KEY="$OPENAI_API_KEY" \\
                  -e JWT_SECRET="$JWT_SECRET" \\
                  -e SMTP_USER="$SMTP_USER" \\
                  -e SMTP_PASS="$SMTP_PASS" \\
                  -e TWILIO_ACCOUNT_SID="$TWILIO_ACCOUNT_SID" \\
                  -e TWILIO_AUTH_TOKEN="$TWILIO_AUTH_TOKEN" \\
                  -e TWILIO_PHONE_NUMBER="$TWILIO_PHONE_NUMBER" \\
                  -e DATABASE_URL="$DATABASE_URL" \\
                  -e NODE_ENV="development" \\
                  -e PORT="3000" \\
                  -e FRONTEND_URL="https://sheerstechnologies.com/wastewise-30" \\
                  -e LOG_LEVEL="info" \\
                  -e CORS_ORIGIN="https://sheerstechnologies.com" \\
                  -e RATE_LIMIT_WINDOW_MS="900000" \\
                  -e RATE_LIMIT_MAX_REQUESTS="100" \\
                  -e FPX_BANKS_ENABLED="true" \\
                  -e EWALLET_ENABLED="true" \\
                  -e CARD_PAYMENTS_ENABLED="true" \\
                  -e TRIAL_DURATION_DAYS="30" \\
                  -e TRIAL_EXTENSION_DAYS="7" \\
                  -e AI_RECOMMENDATIONS_ENABLED="true" \\
                  -e PAYMENT_PROCESSING_ENABLED="false" \\
                  -e EMAIL_NOTIFICATIONS_ENABLED="true" \\
                  -e SMS_NOTIFICATIONS_ENABLED="false" \\
                  $IMAGE_NAME-backend:$TAG
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
