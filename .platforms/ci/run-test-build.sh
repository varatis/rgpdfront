#!/bin/bash

# ./platforms/ci/run.sh
source .platforms/bootstrap.sh
source .env

# Lancement du projet
USER_HOME=${USER_HOME} WORKSPACE=${WORKSPACE} docker compose -f .platforms/ci/docker-compose/docker-compose-test-build.yml up
