#!/bin/bash

source .platforms/bootstrap.sh
source .env

echo "PROJECT VERSION = ${PROJECT_VERSION}"
if [ -z $PROJECT_VERSION ]; then
  PROJECT_VERSION=$(cat $WORKSPACE/git-version.json | /usr/bin/jq -r '.imageversion')
  echo "PROJECT VERSION = ${PROJECT_VERSION}"
fi

# Package Front Office Docker Image

docker build --build-arg="TARGET_ENV=${TARGET_ENV}" -t ${PROJECT_NAME} -f ".platforms/ci/dockerfiles/Dockerfile" .
docker tag ${PROJECT_NAME} "srv-nexus.domaine.local:18444/projets/minds-rgpd/${PROJECT_NAME}:${PROJECT_VERSION}"

# Push Docker Image
if [ "$1" = "--with-push" ]; then
  docker push "srv-nexus.domaine.local:18444/projets/minds-rgpd/${PROJECT_NAME}:${PROJECT_VERSION}"
fi
