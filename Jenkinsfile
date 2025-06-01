pipeline {
    agent any

    environment {
        IMAGE_NAME = 'my-app-web'
        CONTAINER_NAME = 'my-app'
        PORT = '3000' // change if your app uses a different port
    }

    stages {
        stage('Clone Repository') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t $IMAGE_NAME ."
                }
            }
        }

        stage('Stop and Remove Old Container') {
            steps {
                script {
                    sh "docker rm -f $CONTAINER_NAME || true"
                }
            }
        }

        stage('Run New Container') {
            steps {
                script {
                    sh "docker run -d -p 80:$PORT --name $CONTAINER_NAME $IMAGE_NAME"
                }
            }
        }
    }
}
