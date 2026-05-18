#!/bin/bash

############################################################
############################################################
#___________________________________________________________
#                      ATTENTION
#___________________________________________________________
#
# Si vous souhaitez mettre à jour ce fichier ou apporter des évolutions,
# il faut passer par le projet gitlab dédié.
#
# > http://srv-gitlab/Outillage/bootstrap-commons
#
# Vous référer au README.md de ce projet Git pour plus d'informations
#
############################################################
############################################################

# Permet de récupérer un TOKEN JWT depuis Keycloak
getAccessToken() {
  SSO_URL="$1"
  SSO_REALM="$2"
  SSO_CLIENT_ID="$3"
  SSO_CLIENT_SECRET="$4"
  if [ -z "$LOGIN" ]
  then
        read -p "Saisir votre login Keycloak : " LOGIN
  fi
  if [ -z "$PASSWORD" ]
  then
        read -s -p "Saisir votre mot de passe Keycloak : " PASSWORD
  fi
  # Getting tokken for test
  TOKEN=$(curl -H "Content-Type: application/x-www-form-urlencoded" "$SSO_URL/auth/realms/$SSO_REALM/protocol/openid-connect/token" \
  -d "client_id=$SSO_CLIENT_ID" \
  -d "client_secret=$SSO_CLIENT_SECRET" \
  -d "username=$LOGIN" \
  --data-urlencode "password=$PASSWORD" \
  -d 'grant_type=password' | jq -r '.access_token')

  echo $TOKEN
}

# Permet de vérifier qu'une commande n'est pas en erreur
check_rc() {
    RC=$?
    if [ $RC != 0 ]; then
        echo "ERROR command failure, exiting with return code $RC"
        exit $RC;
    fi
}

# Permet de savoir si on travaille dans un environnement WSL
isWSL() {
    OS_KERNEL_RELEASE=$(uname -r)
    OS_KERNEL_TYPE=${OS_KERNEL_RELEASE##*-}

    if [ "$OS_KERNEL_TYPE" == "Microsoft" ]; then
        echo true
    else
        echo false
    fi
}

# Permet de savoir si on travaille dans un environnement WSL 2
isWSL2() {
    if [ -d "/run/WSL" ]; then
        echo true
    else
        echo false
    fi
}

# Permet de savoir si on travaille dans un environnement Linux
isLinux() {
    OS_KERNEL_NAME=$(echo $(uname -s))
    if [ "$OS_KERNEL_NAME" = "Linux" ] && [ $(isWSL) = false ]; then
        echo true
    else
        echo false
    fi
}

# Permet de savoir si on travaille dans un environnement MacOs
isMac() {
    OS_KERNEL_NAME=$(echo $(uname -s))
    if [ "$OS_KERNEL_NAME" = "Darwin" ]; then
        echo true
    else
        echo false
    fi
}

# Permet de savoir si on travaille dans un environnement Windows
isWindows() {
    if [ $(isLinux) = false ] && [ $(isWSL) = false ] && [ $(isGitBash) = false ] && [ $(isMac) = false ]; then
        echo true
    else
        echo false
    fi
}

# Permet de savoir si on travaille dans un environnement Git Bash
isGitBash() {
    OS_KERNEL_NAME=$(echo $(uname -s))
    if [[ "$OS_KERNEL_NAME" = *"MINGW"* ]]; then
        echo true
    else
        echo false
    fi
}

# Permet de savoir si on travaille dans un environnement "jenkins-sandbox"
isJenkinsSandbox() {
    if [ ! -z "$JENKINS_SANDBOX_HOME" ]; then
        echo true
    else
        echo false
    fi
}

# Permet de savoir si un container exist
isContainerExist() {
    NAME="$1"
    if docker ps -a --format '{{.Names}}' | grep -Eq "^${NAME}\$"; then
      echo true
    else
      echo false
    fi
}

# Permet de supprimer un container s'il existe
removeContainerIfExist() {
    NAME="$1"
    if [  $(isContainerExist $NAME) = true ]; then
      docker rm -f $NAME;
    fi
}

# Permet de ccréer un répertoire s'il n'existe pas
createFolderIfNotExist() {
    FOLDER_PATH="$1"
    if [ ! -d "$FOLDER_PATH" ]; then
      echo "Création du répertoire $FOLDER_PATH"
      mkdir "$FOLDER_PATH"
    fi
}

# Permet d'adapter un PATH en fonction du context d'exécution (Windows/Linux/WSL)
clean_path() {
    # Path linux/windows/wsl/gitbash
    VAR_PATH="$1"

    if [  $(isWSL) = true ] || [ $(isJenkinsSandbox) = true ]; then
        # Fix docker volume path Sub System Windows OS
        VAR_PATH=$(echo $VAR_PATH | sed 's/\/mnt//g')
    elif [  $(isGitBash) = true ]; then
        # Fix docker volume path pour Git Bash
        VAR_PATH=$(echo /$VAR_PATH)
    elif [ $(isWindows) = true ]; then
        # Transforme le path pour compatibilité Windows
        VAR_PATH=$(echo "$VAR_PATH" | sed -e 's/^\///' -e 's/\//\\/g' -e 's/^./\0:/')
    fi

    echo $VAR_PATH
}

# Permet de lancer une commande de type "docker run ... /bin/bash -c $CMD"
# $1 > <container-name> --name > Nom Temporaire du container
# $2 > <workdir> -w            > Workdir, Emplacement dans le container qui sera utilisé comme emplacement par défaut au lancement de la commande
# $3 > <docker-run-opts>       > Liste d'option à ajouter à la commande "docker run" (ex: -v blabla)
# $4 > <image-name>            > Nom de l'image à utiliser pour lancer la commande
# $5 > CMD                     > La commande à lancer dans le "Workdir" via "image-name"
# $6 > SKIP_CHECK_RC           > Optionnel... Si "true" permet de continuer le traitement même si la commande est en erreur
dockerRun() {
    DOCKER_CONTAINER_NAME=$1
    WORKDIR=$2
    DOCKER_IMAGE_EXTRA_OPTS=$3
    DOCKER_IMAGE_NAME=$4
    CMD=$5

    # Gestion des options docker par défaut
    DOCKER_IMAGE_EXTRA_OPTS="$DOCKER_IMAGE_EXTRA_OPTS -v $USER_HOME:$HOME"
    if [ $(isJenkinsSandbox) = false ]; then
        if [[ "$DOCKER_IMAGE_EXTRA_OPTS" != *"--user"* ]] && ([  $(isWSL) = true ] || [  $(isLinux) = true ]); then
            DOCKER_IMAGE_EXTRA_OPTS="$DOCKER_IMAGE_EXTRA_OPTS -v $USER_HOME/passwd:/etc/passwd:ro -v $USER_HOME/group:/etc/group:ro --user $(id -u):$(id -g)"
        fi
    fi

    # Début Chronomètre
    START=$(date +%s)

    # On lance la commande via un container
    docker run --rm --name $DOCKER_CONTAINER_NAME -w $WORKDIR $DOCKER_IMAGE_EXTRA_OPTS $DOCKER_IMAGE_NAME /bin/bash -c "$CMD"
    #docker run --dns="192.168.10.101" --dns-search="domaine.local" --rm --name $DOCKER_CONTAINER_NAME -w $WORKDIR $DOCKER_IMAGE_EXTRA_OPTS $DOCKER_IMAGE_NAME //bin/bash -c "$CMD"
    check_rc

    # Fin Chronomètre
    END=$(date +%s)
    DIFF=$(( $END - $START ))
    echo "Execution Time: $DIFF seconds"
}

dockerRunWithoutCheckRc() {
    DOCKER_CONTAINER_NAME=$1
    WORKDIR=$2
    DOCKER_IMAGE_EXTRA_OPTS=$3
    DOCKER_IMAGE_NAME=$4
    CMD=$5

    # Gestion des options docker par défaut
    DOCKER_IMAGE_EXTRA_OPTS="$DOCKER_IMAGE_EXTRA_OPTS -v $USER_HOME:$HOME"
    if [ $(isJenkinsSandbox) = false ]; then
        if [[ "$DOCKER_IMAGE_EXTRA_OPTS" != *"--user"* ]] && ([  $(isWSL) = true ] || [  $(isLinux) = true ]); then
            DOCKER_IMAGE_EXTRA_OPTS="$DOCKER_IMAGE_EXTRA_OPTS -v $USER_HOME/passwd:/etc/passwd:ro -v $USER_HOME/group:/etc/group:ro --user $(id -u):$(id -g)"
        fi
    fi

    # Début Chronomètre
    START=$(date +%s)

    # On lance la commande via un container
    docker run --rm --name $DOCKER_CONTAINER_NAME -w $WORKDIR $DOCKER_IMAGE_EXTRA_OPTS $DOCKER_IMAGE_NAME /bin/bash -c "$CMD"

    # Fin Chronomètre
    END=$(date +%s)
    DIFF=$(( $END - $START ))
    echo "Execution Time: $DIFF seconds"
}

# Permet d'attendre qu'un service soit prêt
# Paramètre:
# * $1 - URL - URL du service HTTP à tester
# * $2 - TRIES - Nombre de tentative (default: 6)
# * $3 - HTTP_CODE - Code HTTP attendu (default: 200)
waitForService() {
  URL=$1
  TRIES=$2
  HTTP_CODE=$3
  if [ -z "$TRIES" ]; then
    TRIES=6
  fi
  if [ -z "$HTTP_CODE" ]; then
    HTTP_CODE=(200)
  fi
  echo "Checking that URL '$URL' returns HTTP code '$HTTP_CODE'"
  echo "> Trying $TRIES times if need..."
  for ((try = 0; try <= $TRIES; try += 1))
  do
    STATUS=$(curl -s -o /dev/null -w '%{http_code}' $URL)
    FOUND=`echo ${HTTP_CODE[@]} | sed 's/ /|/g' | awk /$STATUS/`
    if [ -z "$FOUND" ]; then
      echo "HTTP Response: $STATUS ... Service Not Ready... Please wait..."
    else
      echo "HTTP Response: $HTTP_CODE! Service Ready!"
      break
    fi
    sleep 5
  done
  if [ -z "$FOUND" ]; then
    echo "Could not reach $URL after $TRIES tries"
    exit 1;
  fi
}


# Fonctions getContainerHealth et waitContainer
# Elles permettent d'attendre que le statut d'un conteneur lancé avec commande -health-cmd=<CMD> (ou HEALTHCHECK dans Dockerfile/docker-compose) soit dans l'état 'healthy'
# Cela permet par exemple de vérifier qu'un service soit bien up avant de lancer un prochain conteneur utilisant ce service
# ex pour tester qu'un serveur mariadb lancé dans un conteneur soit bien up : lancer le container mariadb avec arg --health-cmd=ci_docker/checkMariadbUp.sh
# Puis Attendre que mariadb a bien démarré avant de lancer prochain conteneur exécutant les tests
# waitContainer arrow-mariadb-builder
getContainerHealth() {
  docker inspect --format "{{json .State.Health.Status }}" $1
}

# Permet d'attendre qu'un container soit "ready"
waitContainer() {
  while STATUS=$(getContainerHealth $1); [ $STATUS != "\"healthy\"" ]; do
    if [ $STATUS == "\"unhealthy\"" ]; then
      echo "Failed!"
      exit -1
    fi
    printf .
    lf=$'\n'
    sleep 1
  done
  printf "$lf"
}

# Cas particulier du "jenkins-sandbox"
if [ $(isJenkinsSandbox) = true ]; then
    PWD="$JENKINS_SANDBOX_CURRENT_DIRECTORY"
fi

# On récupère l'emplacement du répertoire parent
WORKSPACE=$(clean_path "${PWD}")

# On récupère l'emplacement du répertoire de l'utilisateur courant (sous windows le home se trouve sur C:\Users)
if [ $(isJenkinsSandbox) = true ]; then
    HOME="$JENKINS_SANDBOX_HOME"
fi

USER_HOME=$(clean_path "${HOME}")

# On vérifie que répertoire/ficher monté dans un conteneur existe sur la machine hôte
# Dans un environnement WSL on peut monter qu'un répertoire/ficher qui existe dans une partition /c, /d, ...
if [  $(isWSL) = true ]; then
    if [[ ! ${USER_HOME::2} =~ /[a-z] ]] || [[ ! ${WORKSPACE::2} =~ /[a-z] ]]; then
        echo "ERREUR..."
        echo "Vous travaillez dans un environnement WSL..."
        echo "Il semble que vous tentiez de monter un répertoire qui n'est pas un disque partagé par votre Docker Host"
        echo "Seul les partitions du type /mnt/c/xxx peuvent être montées en tant que volume dans un container"
        echo "Pour plus d'information > http://srv-confluence:8090/display/OUT/Docker+-+Commandes+Utiles#Docker-CommandesUtiles-docker-wsl-volumeLesVolumes"
        exit 1
    fi
fi

if [ $(isLinux) = true ] || [ $(isWSL) = true ]; then
    if [ ! -f $HOME/passwd ]; then
      cp /etc/passwd $HOME
    fi

    if [ ! -f $HOME/group ]; then
      cp /etc/group $HOME
    fi

    # Fix USER/GROUP from AD/SSSD qui ne sont pas présent dans les fichiers "/etc/passwd" et "/etc/group"
    grep -qF "$USER" $HOME/passwd || sudo bash -c "echo \"$USER:x:$(id -u):$(id -g):$USER,,,:$HOME:$SHELL\" >> $HOME/passwd"
    grep -qF ":$(id -g):" $HOME/group || sudo bash -c "echo \"domaine:x:$(id -g):$USER\" >> $HOME/group"
fi



# Gestion du fichier "kubeconfig"
#KUBECONFIG=${HOME}/.kube/kubeconfig-local
#KCONFIG=${USER_HOME}/.kube/kubeconfig-local

# Suppression des containers inutiles
sudo docker rm $( docker ps -q -f status=exited)

echo ""
echo "+++++++++++++++++++++++++++++++++++++++++++"
echo "> Liste des fonctions disponibles"
echo "+++++++++++++++++++++++++++++++++++++++++++"
echo ""
echo "# Pour vérifier qu'une commande n'est pas en erreur"
echo "+ check_rc()"
echo ""
echo "# Pour savoir si on travaille dans un environnement WSL"
echo "+ isWSL()"
echo ""
echo "# Pour savoir si on travaille dans un environnement Git Bash"
echo "+ isGitBash()"
echo ""
echo "# Pour savoir si on travaille dans un environnement Linux"
echo "+ isLinux()"
echo ""
echo "# Pour savoir si on travaille dans un environnement Windows"
echo "+ isWindows()"
echo ""
echo "# Pour savoir si on travaille dans un environnement 'jenkins-sandbox'"
echo "+ isJenkinsSandbox()"
echo ""
echo "# Pour adapter un PATH en fonction du context d'exécution (Windows/Linux/WSL)"
echo "+ clean_path()"
echo ""
echo "# Pour lancer une commande de type 'docker run ... /bin/bash -c $CMD'"
echo "# Exemple > dockerRun DOCKER_CONTAINER_NAME WORKDIR DOCKER_OPTS DOCKER_IMAGE_NAME CMD"
echo "+ dockerRun()"
echo ""
echo "# Pour lancer une commande de type 'docker run ... /bin/bash -c $CMD' sans controller le bon fonctionnement de la commande"
echo "+ dockerRunWithoutCheckRc()"
echo ""
echo "# Permet de ccréer un répertoire s'il n'existe pas"
echo "+ createFolderIfNotExist()"
echo ""
echo "# Permet de supprimer un container s'il existe"
echo "+ removeContainerIfExist()"
echo ""
echo "# Pour s'assurer qu'un service HTTP retourne bien un code 200"
echo "+ waitForService() $URL"
echo ""
echo "+++++++++++++++++++++++++++++++++++++++++++"
echo "> Liste des variables disponibles"
echo "+++++++++++++++++++++++++++++++++++++++++++"
echo ""
echo "# Fichier kubeconfig local"
echo "+ KUBECONFIG = ${KUBECONFIG}"
echo "+ KCONFIG = ${KCONFIG}"
echo ""
echo "# Répertoire utilisateur (épuré ou non de /mnt en fonction du contexte d'exécution)"
echo "+ HOME = ${HOME}"
echo "+ USER_HOME = ${USER_HOME}"
echo ""
echo "# Répertoire courant (épuré ou non de /mnt en fonction du contexte d'exécution)"
echo "+ PWD = ${PWD}"
echo "+ WORKSPACE = ${WORKSPACE}"
echo ""
echo "+++++++++++++++++++++++++++++++++++++++++++"
echo ""

set -xe
