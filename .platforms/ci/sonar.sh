#!/bin/bash

# ./.platforms/ci/sonar.sh
source .env

source <(curl -s http://srv-nexus.domaine.local:8081/repository/raw-creative/fr/creative/ci/bootstrap-commons.sh)

WORKDIR=$(clean_path "/code")

IS_CRITICAL=$3

echo "Is sonarqube analysis critical: [$IS_CRITICAL]"

# Lancer une conteneur qui va analyser le code du projet localement et ensuite envoyer les résultats au serveur SonarQube
# Analyse du code back
BACK_SONAR_IMAGE_EXTRA_OPTS="-v ${WORKSPACE}:${WORKDIR} -e sonar.branch.name=${BRANCH_NAME}"
if [ "$IS_CRITICAL" == "true" ]; then
    BACK_SONAR_IMAGE_EXTRA_OPTS="$BACK_SONAR_IMAGE_EXTRA_OPTS -e sonar.qualitygate.wait=true"
fi


dockerRun "sonar-scanner" "${WORKDIR}" "${BACK_SONAR_IMAGE_EXTRA_OPTS}" "srv-nexus.domaine.local:18443/outillage/sonarqube-scanner:7.2" "sonar-scanner"
