pipeline {
    agent any

    environment {
        // Ensure Jenkins can find Docker on macOS (Intel and Apple Silicon)
        PATH = "/usr/local/bin:/opt/homebrew/bin:${env.PATH}"
        
        // Shared backend environment variables for tests
        DATABASE_URL = "postgresql://test_user:test_password@localhost:5432/test_db?schema=public"
        REDIS_URL = "redis://localhost:6379"
        PORT = "5001"
        JWT_SECRET = "cicd_super_secret_token"
        CLIENT_URL = "http://localhost:5173"
        
        // Dummy variable for frontend build
        VITE_API_BASE_URL = "https://fairplay-api-mock.com"
    }

    tools {
        // Ensure you have configured a NodeJS installation named 'node20' in Jenkins Global Tool Configuration
        nodejs 'node20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend CI: Build') {
            steps {
                dir('fairPlay-frontend') {
                    echo 'Installing frontend dependencies...'
                    sh 'npm ci'
                    
                    echo 'Building Vite frontend...'
                    sh 'npm run build'
                }
            }
        }

        stage('Backend CI: Setup') {
            steps {
                dir('backend') {
                    echo 'Installing backend dependencies...'
                    sh 'npm ci'
                    
                    echo 'Generating Prisma Client...'
                    sh 'npx prisma generate'
                    
                    echo 'Validating Prisma Schema...'
                    sh 'npx prisma validate'
                }
            }
        }

        stage('Backend CI: Test & Build') {
            steps {
                // Spin up temporary PostgreSQL and Redis containers for isolated testing
                echo 'Starting test databases...'
                sh '''
                    docker run --name fairplay-pg-test -e POSTGRES_USER=test_user -e POSTGRES_PASSWORD=test_password -e POSTGRES_DB=test_db -p 5432:5432 -d postgres:15-alpine
                    docker run --name fairplay-redis-test -p 6379:6379 -d redis:7-alpine
                    
                    # Wait for databases to initialize
                    sleep 10
                '''

                dir('backend') {
                    echo 'Pushing schema to test database...'
                    sh 'npx prisma db push --accept-data-loss'
                    
                    echo 'Running Vitest Test Suite...'
                    sh 'npm run test'
                    
                    echo 'Verifying Docker Build Sanity...'
                    sh 'docker build -t fairplay-backend:test .'
                }
            }
        }
    }

    post {
        always {
            // Ensure test databases are cleanly destroyed regardless of pipeline success or failure
            echo 'Cleaning up test databases...'
            sh '''
                docker rm -f fairplay-pg-test || true
                docker rm -f fairplay-redis-test || true
            '''
        }
    }
}
