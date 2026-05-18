#!/bin/bash

# ./platforms/ci/test.sh
source .platforms/bootstrap.sh
source .env

# Lancement des tests (ng test)
FRONT_IMAGE_EXTRA_OPTS="-v ${WORKSPACE}:${WORKDIR}"
dockerRun "${PROJECT_NAME}-node-test" "${WORKDIR}" "${FRONT_IMAGE_EXTRA_OPTS}" "srv-nexus.domaine.local:18444/outillage/node:22" "npm run test:ci"
