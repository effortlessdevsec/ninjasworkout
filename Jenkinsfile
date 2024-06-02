pipeline {
    agent any

    environment {
        SNYK_TOKEN = credentials('SNYK_TOKEN')  // Assuming 'SNYK_TOKEN' is the ID of the stored Snyk token credential in Jenkins
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

            parallel {
                stage('SCA Scan') {
                    steps {
                        script {
                            try {
                                echo 'Running Snyk scan'
                                sh('snyk auth $SNYK_TOKEN') // Authenticate Snyk CLI using the token
                                sh 'snyk test || { echo "Snyk found vulnerabilities"; exit 1; }'
                            } catch (Exception e) {
                                echo "Error during Snyk scan: ${e}"
                                error 'Snyk scan failed'
                            }
                        }
                    }
                }

                stage('SAST SCANNER : NODEJSSCANNER'){

                    steps {

                        script{

                            try{
                                sh 'echo hello cool'

                                
                            }

                            catch (Exception e ){

                                
                            }
                            
                            
                        }

                        
                        
                    }


                    
                }

                

                // Add other security checks here as needed
                // stage('Another Security Check') {
                //     steps {
                //         echo 'Running another security check...'
                //     }
                // }
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
