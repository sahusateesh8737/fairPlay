pipeline {
    agent any

    tools {
        nodejs 'node-20' // Assuming you have a NodeJS installation named 'node-20' in Jenkins → Manage Jenkins → Global Tool Configuration
    }

    environment {
        // Shared configurations
        CI = 'true'
        VITE_API_BASE_URL = 'http://localhost:5001' // Placeholder for frontend build
    }

    stages {
        stage('Checkout') {
            steps {
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
                    // Provide a temporary DB URL for tests if needed, or mock it
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
                // Verifies that both apps can be containerized
                sh 'docker build -t fairplay-backend:latest ./backend'
                // sh 'docker build -t fairplay-frontend:latest ./fairPlay-frontend' // Uncomment if you have a frontend Dockerfile
            }
        }
    }

    post {
        always {
            // Clean up workspace after build
            cleanWs()
        }
        success {
            echo "Successfully built and tested fairPlay!"
        }
        failure {
            echo "Build failed for fairPlay. Please check logs above."
        }
    }
}
