#!/bin/bash

source .platforms/bootstrap.sh
source .env

# Namespace Kubernetes Cible
NAMESPACE="minds"

# Environnement cible (valid, prod, etc)
DEP_ENV=$1
echo "env = $DEP_ENV"

if [ "$DEP_ENV" = "demo" ]; then
    echo "Déploiement sur l'environnement de Demo"
elif [ "$DEP_ENV" = "valid" ]; then
    echo "Déploiement sur l'environnement de Valid"
elif [ "$DEP_ENV" = "int" ]; then
    echo "Déploiement sur l'environnement de Develop"
else
  echo "Paramètre 1 invalide - Environnement cible possible: int/ valid / demo"
  exit 1
fi


# Default namespace & kubeconfig
TOOLS_NAME="${PROJECT_NAME}-${DEP_ENV}"

# Helm parameters
HELM_IMAGE_EXTRA_OPTS="-v $WORKSPACE:$WORKDIR -e KUBECONFIG=$KUBECONFIG"

# Deploy Application
HELM_LIST="helm list -n $NAMESPACE -a"
dockerRun "$TOOLS_NAME-runner" "$WORKDIR" "$HELM_IMAGE_EXTRA_OPTS" "srv-nexus.domaine.local:18444/outillage/helm:3.12.2" "$HELM_LIST"

HELM_COMMAND="helm upgrade --install --debug --wait --force --namespace $NAMESPACE $TOOLS_NAME -f $WORKDIR/.platforms/k8s/values-$DEP_ENV.yaml --set app.image.tag=$PROJECT_VERSION ./.platforms/k8s/helm --debug"
dockerRun "$TOOLS_NAME-runner" "$WORKDIR" "$HELM_IMAGE_EXTRA_OPTS" "srv-nexus.domaine.local:18444/outillage/helm:3.12.2" "$HELM_COMMAND"
