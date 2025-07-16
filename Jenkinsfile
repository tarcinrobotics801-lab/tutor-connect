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
            echo "[INFO] Creating remote directory on ${REMOTE_HOST}..."
            ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_DIR}"

            echo "[INFO] Copying files to ${REMOTE_HOST}..."
            scp -r docker-compose.yml back-end front-end ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

            echo "[INFO] Running remote docker-compose commands..."
            ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
              set -e
              cd ${REMOTE_DIR}
              echo "[INFO] Current directory: \$(pwd)"
              echo "[INFO] Docker version: \$(docker --version)"
              echo "[INFO] Docker Compose version: \$(docker-compose --version || docker compose version)"
              if command -v docker-compose &> /dev/null; then
                docker-compose down -v --remove-orphans || true
                docker-compose build
                docker-compose up -d
              else
                docker compose down -v --remove-orphans || true
                docker compose build
                docker compose up -d
              fi
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
