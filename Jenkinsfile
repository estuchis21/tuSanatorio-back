pipeline {
    agent any

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
                sh 'npm install'
            }
        }

        stage('Set Environment for Tests') {
            steps {
                // Creamos .env con valores dummy para simular que todo está bien
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
                sh 'npx jest --runInBand --silent'
            }
        }
    }

    post {
        always {
            // Limpiamos el .env por seguridad
            sh 'rm -f .env'
        }
        success {
            echo "✅ Tests completed successfully! (Simulated DB & Twilio)"
        }
        failure {
            echo "❌ Tests failed."
        }
    }
}
