#!/bin/bash

source .platforms/bootstrap.sh

# Build du projet
FRONT_IMAGE_EXTRA_OPTS="-v ${WORKSPACE}:/opt/source"
dockerRun "${PROJECT_NAME}-build" "/opt/source" "${FRONT_IMAGE_EXTRA_OPTS}" "srv-nexus.domaine.local:18444/outillage/node:22" "npm ci --legacy-peer-deps && npm run build:$TARGET_ENV"