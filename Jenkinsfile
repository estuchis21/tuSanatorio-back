pipeline {
    agent any

    tools {
        nodejs 'Node20' // El nombre que le pusiste en "Global Tool Configuration" de Jenkins
    }

    stages {
        stage('Checkout Repository') {
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
                sh 'npm ci'
            }
        }

        stage('Set Environment for Tests') {
            steps {
                sh '''
                    echo "DB_SERVER=localhost" > .env
                    echo "DB_DATABASE=tuSanatorio" >> .env
                    echo "DB_USER=dummyUser" >> .env
                    echo "DB_PASSWORD=dummyPass" >> .env
                    echo "DB_PORT=1433" >> .env
                    echo "DB_ENCRYPT=false" >> .env
                    echo "DB_TRUST_CERT=true" >> .env
                    echo "TWILIO_ACCOUNT_SID=dummySID" >> .env
                    echo "TWILIO_AUTH_TOKEN=dummyToken" >> .env
                    echo "TWILIO_WHATSAPP_FROM=whatsapp:+10000000000" >> .env
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    rm -rf node_modules/.cache/babel-loader
                    npx jest --runInBand
                '''
            }
        }
    }

    post {
        always {
            sh 'rm -f .env'
        }
        success {
            echo "✅ Tests completed successfully!"
        }
        failure {
            echo "❌ Tests failed."
        }
    }
}
