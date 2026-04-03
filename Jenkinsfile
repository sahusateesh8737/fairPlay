pipeline {
    agent none // We specify agents for each stage individually

    environment {
        // Shared configurations
        CI = 'true'
        VITE_API_BASE_URL = 'http://localhost:5001'
    }

    stages {
        stage('Checkout') {
            agent any // Run on the Jenkins host
            steps {
                checkout scm
            }
        }

        stage('Backend: Install & Validate') {
            agent {
                docker {
                    image 'node:20-slim'
                    args '-u root:root --rm'
                }
            }
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npx prisma validate'
                }
            }
        }

        stage('Backend: Test') {
            agent {
                docker {
                    image 'node:20-slim'
                    args '-u root:root --rm'
                }
            }
            steps {
                dir('backend') {
                    withEnv(['DATABASE_URL=postgresql://user:pass@localhost:5432/test?schema=public']) {
                        sh 'npm test'
                    }
                }
            }
        }

        stage('Frontend: Build') {
            agent {
                docker {
                    image 'node:20-slim'
                    args '-u root:root --rm'
                }
            }
            steps {
                dir('fairPlay-frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker: Connectivity Check') {
            agent any // RUN ON THE HOST where Docker CLI is installed
            steps {
                sh 'docker build -t fairplay-backend:latest ./backend'
            }
        }
    }

    post {
        always {
            node('built-in' || 'master') { // Ensure cleanup runs on a node with workspace access
                cleanWs()
            }
        }
        success {
            echo "Successfully built and tested fairPlay with Multi-Agent Support!"
        }
        failure {
            echo "Build failed for fairPlay. Check the individual stage logs."
        }
    }
}
