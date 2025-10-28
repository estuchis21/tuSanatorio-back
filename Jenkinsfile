pipeline {
    agent any

    environment {
        NODEJS_HOME = '/usr/local/bin/node' // opcional si NodeJS es global
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout([$class: 'GitSCM', 
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/estuchis21/tuSanatorio-back.git',
                        credentialsId: 'edi25'
                    ]]
                ])
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
        steps {
            withCredentials([...]) {
                sh '''
                    echo "DB_SERVER=host.docker.internal" > .env
                    echo "DB_DATABASE=tuSanatorio" >> .env
                    echo "DB_USER=$DB_USER" >> .env
                    echo "DB_PASSWORD=$DB_PASSWORD" >> .env
                    echo "DB_PORT=1433" >> .env
                    echo "DB_ENCRYPT=false" >> .env
                    echo "DB_TRUST_CERT=true" >> .env
                    echo "TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID" >> .env
                    echo "TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN" >> .env
                    echo "TWILIO_WHATSAPP_FROM=$TWILIO_WHATSAPP_FROM" >> .env

                    chmod +x ./node_modules/.bin/jest
                    ./node_modules/.bin/jest --runInBand
                '''
            }
        }
    }

    }

    post {
        failure {
            echo "❌ Pipeline failed"
        }
        success {
            echo "✅ Pipeline completed successfully"
        }
    }
}
