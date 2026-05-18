#!/bin/bash

source .platforms/bootstrap.sh

curl -O "http://srv-nexus.domaine.local:8081/repository/raw-creative/check-licenses.sh/node-license-checker/contaminating-licenses.txt" \
 || (echo "impossible de télécharger la liste des licences contaminantes" && exit 1)

# check run
COMMAND="license-checker --failOn \"$(cat contaminating-licenses.txt)\""
FRONT_IMAGE_EXTRA_OPTS="-v ${WORKSPACE}:/opt/source"
dockerRun "${PROJECT_NAME}-copyleft" "/opt/source" "${FRONT_IMAGE_EXTRA_OPTS}" "srv-nexus.domaine.local:18444/outillage/node:22" "${COMMAND}"

