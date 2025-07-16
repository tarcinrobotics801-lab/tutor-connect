pipeline {
  agent any
  environment {
    COMPOSE_PROJECT_NAME = "tutorconnect"
  }
  triggers {
    githubPush()
  }
  stages {
    stage('Checkout Code') {
      steps {
        git branch: 'prod',
            credentialsId: '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',
            url: 'git@github.com:tarcinrobotics/tutor-connect.git'
      }
    }
    stage('Build & Deploy') {
      steps {
        script {
          sh 'docker-compose down'
          sh 'docker-compose build'
          sh 'docker-compose up -d'
        }
      }
    }
  }
  post {
    failure {
      mail to: 'devops@tarcinacademy.in',
           subject: ":siren: Build Failed: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
           body: "Check Jenkins for details: ${env.BUILD_URL}"
    }
  }
}
