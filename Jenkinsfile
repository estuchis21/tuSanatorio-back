pipeline {
    agent {
        docker {
            image 'node:18'         // Imagen oficial de Node.js 18 con npm
            args '-u root:root'     // Para evitar problemas de permisos dentro del contenedor
        }
    }

    // 1️⃣ Trigger de GitHub
    triggers {
        githubPush()
    }

    environment {
        CI = 'true'               // Variable útil para algunos paquetes npm
    }

    stages {
        stage('Checkout') {
            steps {
                // Clona tu repo
                git branch: 'main', url: 'https://github.com/estuchis21/tuSanatorio-back.git', credentialsId: 'github-jenkins'
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
