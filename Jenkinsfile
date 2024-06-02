pipeline {
    agent any

  environment {
        SNYK_TOKEN = credentials('SNYK_TOKEN')  // Assuming 'your-snyk-token-id' is the ID of the stored Snyk token credential in Jenkins
    }
    
    
    stages {
        stage('Build') {
            steps {
                script {
                    try {
                        sh 'npm i'
                        sh 'echo hello'
                    } catch (Exception e) {
                        echo 'Error in build stage'
                        error 'Build failed'
                    }
                }
            }
        }

        stage('SECURITY CHECKS') {
     
            
            when {
                expression {
                    currentBuild.result == null || currentBuild.result == 'SUCCESS'
                }
            }
            steps {
                echo 'Running snyk scan'
                 script {
                    try {
                        echo 'running snyk scan'
                        sh 'snyk auth $SNYK_TOKEN' // Authenticate Snyk CLI using the token
                        sh 'snyk test' // Run Snyk test
                        
                    } catch (Exception e) {
                        echo e
                        error 'e'
                        
                    }
                }

            }
        }

        stage('Deploy') {
            when {
                expression {
                    currentBuild.result == null || currentBuild.result == 'SUCCESS'
                }
            }
            steps {
                echo 'Deploying application...'
                // Add deployment steps here
            }
        }
    }

    post {
        failure {
            echo 'Pipeline failed'
        }
        success {
            echo 'Pipeline succeeded'
        }
    }
}
