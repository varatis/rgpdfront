#!/bin/bash

# ./platforms/ci/zap.sh http://env-deploy.oreco.fr:4200/
source .platforms/bootstrap.sh

if [[ $# -lt 1 ]] ; then
    echo "Usage: $0 <site-url>"
    exit 1
fi

DEP_ENV=$1
SITE_URL=""
DO_ZAPPROXY=true
if [ "$DEP_ENV" == "prod" ]; then
  # URL du site à analyser
  SITE_URL="https://minds-rgpd-front-ng.groupe-creative.fr/"
elif [ "$DEP_ENV" == "pre-prod" ]; then
  # URL du site à analyser
  SITE_URL="https://pre-prod.minds-rgpd-front-ng.minds.k8s/"
elif [ "$DEP_ENV" == "develop" ]; then
  # URL du site à analyser
  SITE_URL="https://develop.minds-rgpd-front-ng.minds.k8s/"
elif [ "$DEP_ENV" == "demo" ]; then
  # URL du site à analyser
  SITE_URL="https://demo.minds-rgpd-front-ng.minds.k8s/"
elif [ "$DEP_ENV" == "valid" ]; then
  # URL du site à analyser
  SITE_URL="https://valid.minds-rgpd-front-ng.minds.k8s/"
else
  DO_ZAPPROXY=false
fi

if [ "$DO_ZAPPROXY" ]; then
  # Répertoire où sont générés les rapport
  OUTPUT_DIR=$WORKSPACE/reports
  rm -rf $OUTPUT_DIR
  mkdir $OUTPUT_DIR

  # Paramètre Docker
  DOCKER_NAME="zap_proxy"
  DOCKER_WORKDIR="/zap/wrk"
  DOCKER_IMAGE_EXTRA_OPTS="-v $OUTPUT_DIR:$DOCKER_WORKDIR:rw -t"
  DOCKER_IMAGE_NAME="ghcr.io/zaproxy/zaproxy:stable"
  DOCKER_COMMAND="zap-baseline.py -t $SITE_URL -g gen.conf -r index.html -I"
  dockerRun "$DOCKER_NAME" "$DOCKER_WORKDIR" "$DOCKER_IMAGE_EXTRA_OPTS" "$DOCKER_IMAGE_NAME" "$DOCKER_COMMAND"
fi
# It will exit with codes of:
#	0:	Success
#	1:	At least 1 FAIL
#	2:	At least one WARN and no FAILs
#	3:	Any other failure
