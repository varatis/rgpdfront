#!/bin/bash

source .platforms/bootstrap.sh

BACK_IMAGE_EXTRA_OPTS="-v ${WORKSPACE}:/opt/source -p 9876:9876"
dockerRun "${PROJECT_NAME}" "/opt/source" "${BACK_IMAGE_EXTRA_OPTS}" "srv-nexus.domaine.local:18444/outillage/node:22" "npm run test:headless"