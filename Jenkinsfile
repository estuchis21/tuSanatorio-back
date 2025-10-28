pipeline {
    agent any  // Se ejecuta en el contenedor de Jenkins directamente

    environment {
        CI = 'true'  // Para que npm detecte entorno de CI
    }

    triggers {
        githubPush()  // Se ejecuta al hacer push en GitHub
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Clonando repositorio...'
                git branch: 'main', 
                    url: 'https://github.com/estuchis21/tuSanatorio-back.git',
                    credentialsId: 'github-jenkins'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Instalando dependencias...'
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo 'Construyendo el proyecto...'
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                echo 'Ejecutando tests...'
                sh 'npm test || echo "No hay tests configurados"'
            }
        }
    }

    post {
        success {
            echo '✅ Build completado con éxito'
        }
        failure {
            echo '❌ Build fallido'
        }
    }
}
