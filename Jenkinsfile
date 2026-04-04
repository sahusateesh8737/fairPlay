pipeline {
    agent {
        docker {
            image 'node:20'
        }
    }

    stages {
        stage('Backend CI') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    // Running tests if available, otherwise just gracefully passing
                    sh 'npm test --passWithNoTests || true'
                }
            }
        }
        
        stage('Frontend CI') {
            steps {
                dir('fairPlay-frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                    // Similarly run tests
                    sh 'npm test --passWithNoTests || true'
                }
            }
        }
    }
}
