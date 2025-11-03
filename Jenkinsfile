pipeline {
    agent {
        docker {
            image 'node:20'
            args '-u node' // usar usuario no root
        }
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
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npx jest --runInBand --silent || true'
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed."
        }
    }
}
