#!/usr/bin/env groovy
library 'status-jenkins-lib@v1.8.6'

pipeline {
  agent { label 'linux' }

  parameters {
    string(
      name: 'IMAGE_TAG',
      defaultValue: params.IMAGE_TAG ?: '',
      description: 'Optional Docker image tag to push.'
    )
    string(
      name: 'STRAPI_API_URL',
      description: 'URL of Strapi API',
      defaultValue: params.STRAPI_API_URL ?: 'https://cms-press.logos.co/api',
    )
    string(
      name: 'STRAPI_GRAPHQL_URL',
      description: 'URL of Strapi GraphQL API',
      defaultValue: params.STRAPI_GRAPHQL_URL ?: 'https://cms-press.logos.co/graphql',
    )
    string(
      name: 'NEXT_PUBLIC_ASSETS_BASE_URL',
      description: 'URL for public assets',
      defaultValue: params.NEXT_PUBLIC_ASSETS_BASE_URL ?: 'https://cms-press.logos.co',
    )
    string(
      name: 'DOCKER_REGISTRY',
      description: 'Docker registry ',
      defaultValue: params.DOCKER_REGISTRY ?: 'harbor.status.im',
    )
  }

  options {
    disableConcurrentBuilds()
    /* manage how many builds we keep */
    buildDiscarder(logRotator(
      numToKeepStr: '20',
      daysToKeepStr: '30',
    ))
  }

  environment {
    IMAGE_NAME = 'acid-info-private/logos-press-engine'
  }

  stages {
    stage('Build') {
      steps {
        script {
          withCredentials([
            usernamePassword(
              credentialsId: 'logos-press-engine-unbody-api-token',
              usernameVariable: 'UNBODY_PROJECT_ID',
              passwordVariable: 'UNBODY_API_KEY'
            ),
            string(
              credentialsId: 'logos-press-engine-simplecast-token',
              variable: 'SIMPLECAST_ACCESS_TOKEN'
            ),
            string(
              credentialsId: 'logos-press-engine-webhook-token',
              variable: 'REVALIDATE_WEBHOOK_TOKEN'
            ),
            string(
              credentialsId: 'logos-press-engine-strapi-api-key',
              variable: 'STRAPI_API_KEY'
            ),
          ]) {
            image = docker.build(
              "${DOCKER_REGISTRY}/${IMAGE_NAME}:${GIT_COMMIT.take(8)}",
              ["--build-arg='STRAPI_API_KEY=${env.UNBODY_PROJECT_ID}'",
               "--build-arg='UNBODY_API_KEY=${env.UNBODY_API_KEY}'",
               "--build-arg='SIMPLECAST_ACCESS_TOKEN=${SIMPLECAST_ACCESS_TOKEN}'",
               "--build-arg='REVALIDATE_WEBHOOK_TOKEN=${REVALIDATE_WEBHOOK_TOKEN}'",
               "--build-arg='STRAPI_API_URL=${params.STRAPI_API_URL}'",
               "--build-arg='STRAPI_GRAPHQL_URL=${params.STRAPI_GRAPHQL_URL}'",
               "--build-arg='NEXT_PUBLIC_ASSETS_BASE_URL=${params.NEXT_PUBLIC_ASSETS_BASE_URL}'",
               "--build-arg='STRAPI_API_KEY=${STRAPI_API_KEY}'",
               "."].join(' ')
            )
          }
        }
      }
    }

    stage('Deploy') {
      when { expression { params.IMAGE_TAG != '' } }
      steps { script {
        withDockerRegistry([
          credentialsId: 'harbor-acid-info-private-robot', url: "https://${DOCKER_REGISTRY}"
        ]) {
          image.push(params.IMAGE_TAG)
        }
      } }
    }
  }

  post {
    cleanup { cleanWs() }
    always { script {
      def result  = currentBuild.result.toLowerCase() ?: 'unknown'
      discord.send(
        header: "Logos Press Engine Docker image build ${result}!",
        descPrefix: "Image: [`${env.IMAGE_NAME}:${params.IMAGE_TAG}`](https://harbor.status.im/${params.IMAGE_NAME}/tags?name=${params.IMAGE_TAG})",
        cred: 'logos-press-engine-discord-webhook-url',
      )
    } }
  }
}
