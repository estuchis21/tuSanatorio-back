pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        BACKEND_SERVICE = 'backend'
    }

    triggers {
        // Ejecutar el pipeline entre las 00:00 y las 10:00 todos los días
        cron('H 0-10 * * *')
        // También revisar cambios en GitHub cada 5 minutos
        pollSCM('H/5 * * * *')
    }

    options {
        ansiColor('xterm')
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Clonando repositorio...'
                git branch: 'main', url: 'https://github.com/estuchis21/tuSanatorio-back.git'
            }
        }

        stage('Build') {
            steps {
                echo 'Construyendo imágenes con Docker Compose...'
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} build'
            }
        }

        stage('Levantar Servicios') {
            steps {
                echo 'Levantando contenedores...'
                sh 'docker compose -f ${DOCKER_COMPOSE_FILE} up -d'
                echo 'Esperando que SQL Server inicialice...'
                // Esperamos unos segundos porque SQL Server tarda en iniciar
                sh 'sleep 40'
            }
        }

        stage('Instalar dependencias') {
            steps {
                echo 'Instalando dependencias del backend...'
                sh 'docker compose exec -T ${BACKEND_SERVICE} npm install'
            }
        }

        stage('Tests - Jest') {
            steps {
                echo 'Ejecutando tests del backend...'
                // Ejecuta Jest dentro del contenedor del backend
                sh 'docker compose exec -T ${BACKEND_SERVICE} npm test -- --ci --color'
            }
        }

        stage('Logs (para debugging)') {
            steps {
                echo 'Mostrando logs del backend...'
                sh 'docker compose logs ${BACKEND_SERVICE} || true'
            }
        }
    }

    post {
        always {
            echo 'Limpiando entorno...'
            sh 'docker compose down -v'
        }
        success {
            echo '✅ Pipeline completado con éxito.'
        }
        failure {
            echo '❌ Pipeline fallido. Revisar logs en Blue Ocean.'
        }
    }
}
