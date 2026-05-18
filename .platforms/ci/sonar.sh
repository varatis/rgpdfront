#!/bin/bash

# ./platforms/ci/sonar.sh
source .platforms/bootstrap.sh
source .env

# Récépuration du nom de la branche courante
if [ "$1" = "--git-branch" ]; then
  GIT_BRANCH=''$2''
else
  GIT_BRANCH=$(git branch | grep \* | cut -d ' ' -f2)
fi
BRANCH_NAME=minds-rgpd-front-ng-$(echo "$GIT_BRANCH" | sed 's/[^a-zA-Z0-9\-_.:]/-/g')

# Un variable qui va contenir en plus du nom de la branche git tout les propriétés potentielles qui vont être spécifier lors du l’exécution de ce script
SONAR_PARAMS="-Dsonar.projectKey=${BRANCH_NAME} -Dsonar.projectName=${BRANCH_NAME}"

if [ "$1" = "--sonar-params" ]; then
  SONAR_PARAMS=''$SONAR_PARAMS' '$2''
elif [ "$3" = "--sonar-params" ]; then
  SONAR_PARAMS=''$SONAR_PARAMS' '$4''
fi

# Analyse du code front
FRONT_SONAR_IMAGE_EXTRA_OPTS="-v ${WORKSPACE}:${WORKDIR}"
dockerRun "${PROJECT_NAME}-sonar-scanner" "${WORKDIR}" "${FRONT_SONAR_IMAGE_EXTRA_OPTS}" "srv-nexus.domaine.local:18443/outillage/sonarqube-scanner:7.3" "sonar-scanner -X $SONAR_PARAMS"

