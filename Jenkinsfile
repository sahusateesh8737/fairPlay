pipeline {
    agent {
        docker {
            image 'node:20-slim' // Uses an official Node.js Docker image for the build environment
            args '-u root:root'  // Ensures the build has permissions to write to the Jenkins workspace
        }
    }

    environment {
        // Shared configurations
        CI = 'true'
        VITE_API_BASE_URL = 'http://localhost:5001' // Placeholder for frontend build
    }

    stages {
        stage('Checkout') {
            steps {
                // The agent is already inside the container, so we pull code here
                checkout scm
            }
        }

        stage('Backend: Install & Validate') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npx prisma validate'
                }
            }
        }

        stage('Backend: Test') {
            steps {
                dir('backend') {
                    // Provide a temporary DB URL for tests
                    withEnv(['DATABASE_URL=postgresql://user:pass@localhost:5432/test?schema=public']) {
                        sh 'npm test'
                    }
                }
            }
        }

        stage('Frontend: Build') {
            steps {
                dir('fairPlay-frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker: Connectivity Check') {
            steps {
                // This stage runs on the Host (outside the Node container)
                // Note: The Docker Pipeline plugin handles this by running inside 'agent any' if needed
                // For this specific stage, we might need a workaround or just run 'docker' commands via the host
                script {
                    sh 'docker build -t fairplay-backend:latest ./backend'
                }
            }
        }
    }

    post {
        always {
            // Clean up workspace after build
            cleanWs()
        }
        success {
            echo "Successfully built and tested fairPlay using Docker Agent!"
        }
        failure {
            echo "Build failed for fairPlay. Check the Docker logs or Node.js output."
        }
    }
}
