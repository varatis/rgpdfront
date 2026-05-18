#!/bin/bash

source .platforms/bootstrap.sh

BACK_IMAGE_EXTRA_OPTS="-v ${WORKSPACE}:/opt/source"
dockerRun "${PROJECT_NAME}-command" "/opt/source" "${BACK_IMAGE_EXTRA_OPTS}" "srv-nexus.domaine.local:18444/outillage/node:22" "$*"