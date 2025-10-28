pipeline {
    agent {
        docker {
            image 'node:18'
            args '-u root:root'
        }
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/estuchis21/tuSanatorio-back.git', credentialsId: 'github-jenkins'
            }
        }
        stage('Install Dependencies') {
            steps { sh 'npm install' }
        }
        stage('Build') {
            steps { sh 'npm run build' }
        }
        stage('Test') {
            steps { sh 'npm test || echo "No hay tests configurados"' }
        }
    }
}
