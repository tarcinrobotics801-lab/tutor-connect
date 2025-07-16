pipeline {
  agent any

  environment {
    COMPOSE_PROJECT_NAME = "tutorconnect"
    REMOTE_USER = "tarcin"
    REMOTE_HOST = "192.168.0.21"
    REMOTE_DIR  = "/opt/tutorconnect"
  }

  triggers {
    githubPush()
  }

  stages {
    stage('Checkout Code') {
      steps {
        git branch: 'prod',
            credentialsId: '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',
            url: 'https://github.com/tarcinrobotics/tutor-connect.git'
      }
    }

    stage('Build Images (Local CI only)') {
      steps {
        sh 'docker-compose build'
      }
    }

    stage('Deploy to Proxmox LXC') {
      steps {
        sshagent(['lxc_ssh_key']) {
          sh '''
            echo "[INFO] Copying files to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}"
            ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_DIR}"
            scp -r docker-compose.yml back-end front-end ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

            echo "[INFO] Deploying via docker-compose on remote"
            ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
              cd ${REMOTE_DIR}
              docker-compose down -v --remove-orphans || true
              docker-compose build
              docker-compose up -d
            EOF
          '''
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
