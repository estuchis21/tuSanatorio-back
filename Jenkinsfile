pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Run Tests') {
      steps {
        sh 'npm test'
      }
    }

  }
  post {
    always {
      echo 'Pipeline finalizado.'
    }

    success {
      echo '✅ Todos los tests pasaron correctamente.'
    }

    failure {
      echo '❌ Falló algún test.'
    }

  }
  triggers {
    pollSCM('H/5 * * * *')
    cron('H 0-10 * * *')
  }
}