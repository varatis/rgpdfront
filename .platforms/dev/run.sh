#!/bin/bash

source .platforms/bootstrap.sh

# Lancement du projet
UserID=${UserID} GroupID=${GroupID} PROJECT_NAME=${PROJECT_NAME} USER_HOME=${USER_HOME} WORKSPACE=${WORKSPACE} docker-compose -f docker-compose.yml -p ${PROJECT_NAME} up


