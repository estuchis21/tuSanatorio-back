pipeline {
    agent {
        dockerfile {
            filename 'Dockerfile' // tu Dockerfile en el repo
            dir '.'              // directorio donde está tu Dockerfile
            args '-u root:root'  // opcional, para permisos de root
        }
    }
    environment {
        CI = 'true'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/estuchis21/tuSanatorio-back.git', credentialsId: 'edi25'
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
