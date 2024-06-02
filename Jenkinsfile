pipeline {
    agent any
    
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
                        echo 'runin snyk scan'
                        sh 'snyk test $(pwd)'
                    } catch (Exception e) {
                        echo 'Error in build stage'
                        error 'Build failed'
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
