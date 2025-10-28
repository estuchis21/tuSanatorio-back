pipeline {
    agent any

    environment {
        NODE_ENV = 'development'
    }

    stages {
        stage('Checkout') {
            steps {
                git(
                    url: 'https://github.com/estuchis21/tuSanatorio-back.git',
                    branch: 'main',
                    credentialsId: 'edi25'
                )
            }
        }

        stage('Create .env') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'db-creds', usernameVariable: 'DB_USER', passwordVariable: 'DB_PASSWORD'),
                    string(credentialsId: 'twilio-sid', variable: 'TWILIO_ACCOUNT_SID'),
                    string(credentialsId: 'twilio-token', variable: 'TWILIO_AUTH_TOKEN'),
                    string(credentialsId: 'twilio-whatsapp', variable: 'TWILIO_WHATSAPP_FROM')
                ]) {
                    sh '''
                    cat > .env <<EOF
                    DB_SERVER=host.docker.internal
                    DB_DATABASE=tuSanatorio
                    DB_USER=$DB_USER
                    DB_PASSWORD=$DB_PASSWORD
                    DB_PORT=1433
                    DB_ENCRYPT=false
                    DB_TRUST_CERT=true
                    TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID
                    TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN
                    TWILIO_WHATSAPP_FROM=$TWILIO_WHATSAPP_FROM
                    EOF
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Start Server') {
            steps {
                sh 'npm run start'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm run test'
            }
        }
    }

    post {
        always {
            echo "Pipeline finished"
        }
        failure {
            echo "Pipeline failed ❌"
        }
        success {
            echo "Pipeline succeeded ✅"
        }
    }
}
