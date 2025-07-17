pipeline {
  agent { label 'ci-only' }
  environment {
    COMPOSE_PROJECT_NAME = "tutorconnect"
    REMOTE_USER = "${env.REMOTE_USER}"
    REMOTE_HOST = "${env.REMOTE_HOST}"
    REMOTE_DIR  = "${env.REMOTE_DIR}"
  }

  triggers {
    githubPush()
  }

  stages {
    stage('Checkout Code') {
      steps {
        git branch: 'prod',
            credentialsId: 'github-pat',
            url: 'https://github.com/tarcinrobotics/tutor-connect.git'
      }
    }

    stage('Build Images (Local CI only)') {
      steps {
        sh 'docker compose build'
      }
    }

    stage('Deploy to Proxmox LXC') {
      steps {
        sshagent(['jenkins-ssh']) {
          sh '''
            echo "[INFO] Creating remote directory on ${REMOTE_HOST}..."
            ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_DIR}"

            echo "[INFO] Copying files to ${REMOTE_HOST}..."
            scp -r docker compose.yml back-end front-end ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

            echo "[INFO] Running remote docker compose commands..."
            ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "
              set -e
              cd ${REMOTE_DIR}
              echo '[INFO] Current directory: $(pwd)'
              echo '[INFO] Docker version: $(docker --version)'
              if command -v docker compose &> /dev/null; then
                docker compose down -v --remove-orphans || true
                docker compose build
                docker compose up -d
              else
                docker compose down -v --remove-orphans || true
                docker compose build
                docker compose up -d
              fi
            "
          '''
        }
      }
    }
  }

  // ✅ Post actions must be **outside** the stages block
  post {
    failure {
      mail to: 'devops@tarcinacademy.in',
           subject: ":siren: Build Failed: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
           body: "Check Jenkins for details: ${env.BUILD_URL}"
    }
  }
}
