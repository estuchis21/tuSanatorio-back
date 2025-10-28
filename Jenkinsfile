pipeline {
    agent any

    // 1️⃣ Trigger de GitHub
    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                // Clona tu repo
                git branch: 'main', url: 'https://github.com/estuchis21/tuSanatorio-back.git'
            }
        }

        stage('Build') {
            steps {
                // Ejemplo: si usás Node.js
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                // Opcional: correr tests si los tenés
                sh 'npm test || echo "No hay tests"'
            }
        }
    }

    post {
        success {
            echo 'Build completado con éxito ✅'
        }
        failure {
            echo 'Build fallido ❌'
        }
    }
}
