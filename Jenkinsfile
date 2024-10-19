pipeline {
    agent any

    environment {
        GIT_URL = 'https://github.com/Moxci-Team/Back-End-Team.git'
        GIT_BRANCH = 'dev'
        COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Clone Repository') {
            steps {
                script {
                    // Use GitHub credentials for fetching the repository
                    git credentialsId: 'Gitsun123vet', branch: "${GIT_BRANCH}", url: "${GIT_URL}"
                }
            }
        }
        
        stage('Stop all services') {
            steps {
                script {
                    // Build and start containers without stopping them
                    sh 'docker-compose down'
                }
            }
        }

        stage('Build and Run Docker Compose') {
            steps {
                script {
                    // Build and start containers without stopping them
                    sh 'docker-compose up -d --build'
                }
            }
        }

        stage('Post Actions') {
            steps {
                script {
                    echo "Build and deployment successful"
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline executed successfully"
        }
        failure {
            echo "Pipeline failed"
        }
    }
}