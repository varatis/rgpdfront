@Library("jenkins-pipeline-library")

import fr.creative.jenkins.BuildContextHolder
import fr.creative.jenkins.config.ConfigUtils
import fr.creative.jenkins.exception.TechnicalException
import fr.creative.jenkins.model.DockerRegistry
import fr.creative.jenkins.model.Module
import fr.creative.jenkins.model.Sonar
import fr.creative.jenkins.service.*
import fr.creative.jenkins.utils.*
import groovy.json.JsonSlurperClassic

@NonCPS
def jsonParse(def json) {
    new groovy.json.JsonSlurperClassic().parseText(json)
}

node() {
    properties([
    parameters([
        choice(name:'deployTo', choices: ['','valid','demo'], defaultValue: '', description: 'Environnement sur lequel deployer, laisser vide pour ne pas déployer.'),
        booleanParam(name:'skipBuild', defaultValue: false),
        booleanParam(name:'skipLicense', defaultValue: false),
        booleanParam(name:'skipSonarqube', defaultValue: false),
        booleanParam(name:'skipVulnerabilityCheck', defaultValue: false),
        booleanParam(name:'skipTrivy', defaultValue: false),
        booleanParam(name:'skipPackage', defaultValue: false),
        booleanParam(name:'skipDeploy', defaultValue: false),
        booleanParam(name:'skipTest', defaultValue: false)
    ])
])
    // Nom du Projet Gitlab
    String projectName = "minds-rgpd-front-ng"
    // Branche GIT à builder/packager/déployer
    String projectBranch = env.BRANCH_NAME
    // Environnement sur lequel on souhaite déployer l'application
    String deployTo = params.deployTo
    // Version de l'application que l'on souhaite déployer
    String version

    // Skip licenses checking
    boolean skipLicense = params.skipLicense
    // Skip Deploy
    boolean skipBuild = params.skipBuild
    // Skip Tests
    boolean skipTest = params.skipTest
    // Skip Sonarqube
    boolean skipSonarqube = params.skipSonarqube
    // set critical Sonarqube behaviour
    boolean isSonarqubeCritical = true
    // Skip Deploy
    boolean skipPackage = params.skipPackage
     // Skip Trivy
    boolean skipTrivy = params.skipTrivy
    // skip ZAP
    boolean skipZAP = params.skipZAP

    // Skip Deploy
    boolean skipDeploy = params.skipDeploy
    // Skip Scan
    boolean skipScan = params.skipScan

    boolean isMergeRequest = false

    // URL Channel Teams
    String webhookUrl = "https://creativecorebusiness.webhook.office.com/webhookb2/3757b4c6-ab34-424d-8289-0ea5d29282bc@07cdf6c2-b866-4ffc-a7cf-eaeb75545f95/JenkinsCI/8a1c571231184f73b10b5f85519a528d/41524f31-8514-413e-8217-a9a6bad73477"

    try {
        BuildContextHolder.init(this)

        GitlabService.instance().updatePipelineStatusToRunning()

        // Ne pas deployer s'il s'agit d'une pipeline déclenché par gitlab
        if(GitlabService.instance().isTriggeredByGitlab()){
            skipDeploy = true
            skipVulnerabilityCheck = true
            isSonarqubeCritical = false
            isMergeRequest = true

            projectBranch = "origin/" + env.gitlabSourceBranch

            println "projectBranch before checkout ${projectBranch}"
            checkout scmGit(branches: [[name: '${projectBranch}']], extensions: [], userRemoteConfigs: [[url: 'git@srv-gitlab.domaine.local:minds-labs/minds-rgpd/minds-rgpd-front-ng.git']])
        } else {
            checkout scm
        }

        stage('Verify Node Version') {
            sh 'node -v'
        }

        stage('Prepare') {
            sh("chmod 777 -R .platforms/ci/")
            sh("find . -type f -print0 | xargs -0 dos2unix -q")
            env.TARGET_ENV=deployTo 

            // def config = jsonParse(new File("${env.WORKSPACE}/package.json").getText())
            // version = config.version
            // PropertiesUtils.updateValue(".env", "PROJECT_VERSION", version)
            

        }

        stage("Check Licenses") {
            if (!skipLicense) {
                println "Building project"
                sh "bash ./.platforms/ci/check-licenses.sh"
            }
        }

        stage("Build") {
            if (!skipBuild) {
                println "Building project"
                sh "bash ./.platforms/ci/build.sh"
                def config = jsonParse(new File("${env.WORKSPACE}/git-version.json").getText())
                version = config.imageversion
                PropertiesUtils.updateValue("${env.WORKSPACE}/.env", "PROJECT_VERSION", version)
            }
        }

        stage("Tu") {
             if (!skipTest) {
                println "Building project"
                sh "bash ./.platforms/ci/test.sh"
            }
        }

        stage("Security Tests (Trivy)") {
            if (!skipTrivy) {
                boolean trivyError=false
                try {
                    // Rapport au format HTML
                    sh("bash ./.platforms/ci/trivy.sh")
                } catch (err) {
                    trivyError=true
                } finally {
                    // Publication du rapport HTML
                    JenkinsService.instance().publishHtml("./.trivy/", "triby.html", "Trivy Report",true)
                    archiveArtifacts artifacts: '.trivy/trivy.html', excludes: null
                    if (trivyError) {
                        String url = JenkinsService.instance().getJobUrl() + "/TrivyReport/"
                        JenkinsService.instance().setStageAsUnstable("Trivy - Niveau de sécurité insuffisant > ${url}")
                    }
                }
            }
        }

        stage("Sonarqube") {
            if (!skipSonarqube) {
                println "Qualimetry Sonarqube"
                HttpService.instance().waitForService("https://sonarqube.tools.k8s/")
                sh "bash ./.platforms/ci/sonar.sh --git-branch ${projectBranch}"

                // Validation de l'analyse sonar (blocage si bug critique)
                if (isSonarqubeCritical) {
                  def sonarproject = new Sonar()
                   println("Analysing minds-rgpd-front-ng")
                   sonarproject.key = "minds-rgpd-front-ng"
                  SonarService.instance().checkProjectStatus(sonarproject, "main", true)
                }
            }
        }

        stage("Package") {
            if (!skipPackage) {
                DockerService.instance().login(DockerRegistry.getDefaultRegistry())
                println "Creating Docker Images"
                if (isMergeRequest) {
                  sh "bash ./.platforms/ci/package.sh"
                } else {
                  sh "bash ./.platforms/ci/package.sh --with-push"
                }
            }
        }

        stage("Deploy") {
            if (!skipDeploy && deployTo != '') {
              // def config = jsonParse(new File("${env.WORKSPACE}/git-version.json").getText())
              // version = config.imageversion
              // PropertiesUtils.updateValue("${env.WORKSPACE}/.env", "PROJECT_VERSION", version)
                withKubeConfig([credentialsId: 'kubeconfig-minds-admin']) {
                    println "Deploying project using generated version ${version}"
                    sh "bash ./.platforms/k8s/deploy.sh ${deployTo}"
                }
            }
        }

        stage("Security Scan (ZAP)") {
            if (!skipZAP && !skipScan) {
                boolean zapError = false
                try {
                    echo "🔒 Starting OWASP ZAP Security Scan..."

                    // Set ZAP credentials
                    withCredentials([
                        usernamePassword(credentialsId: 'minds-rgpd-front-ng-admin',
                                       usernameVariable: 'ZAP_USERNAME',
                                       passwordVariable: 'ZAP_PASSWORD')
                    ]) {
                        // Run the new security scanner
                        sh "bash ./.platforms/ci/security-scan.sh ${deployTo}"
                    }

                    echo "✅ Security scan completed successfully"

                } catch (err) {
                    zapError = true
                    echo "❌ Security scan failed: ${err.getMessage()}"
                } finally {
                    // Archive security reports
                    archiveArtifacts artifacts: 'security-reports/**/*', allowEmptyArchive: true

                    // Publish HTML report if it exists
                    if (fileExists('security-reports/index.html')) {
                        publishHTML([
                            allowMissing: false,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'security-reports',
                            reportFiles: 'index.html',
                            reportName: 'ZAP Security Report',
                            reportTitles: 'OWASP ZAP Security Scan Results'
                        ])
                    }

                    // Parse and check results
                    if (fileExists('security-reports/summary.txt')) {
                        def summary = readFile('security-reports/summary.txt')
                        echo "Security Scan Summary:\n${summary}"

                        // Check for high-risk issues
                        if (summary.contains('High risk:') && !summary.contains('High risk: 0')) {
                            zapError = true
                            echo "⚠️ High-risk security issues found!"
                        }
                    }

                    if (zapError) {
                        String url = "${env.BUILD_URL}ZAP_Security_Report/"
                        currentBuild.result = 'UNSTABLE'
                        echo "⚠️ Security scan issues detected. Report: ${url}"
                        // Don't fail the build for security issues, just mark unstable
                    }
                }
            }
        }


        if (isMergeRequest) {
          println "'${projectName}': Successful merge request"
        } else {
          println "'${projectName}': Successful project deployment"
        }
        //MicrosoftTeamsService.instance().send(webhookUrl, "Deploy 'TunnelCourtier' (Branch '${projectBranch}' To '${deployTo}') SUCCESS")
        GitlabService.instance().updatePipelineStatusToSuccess()
    } catch (err) {
      JenkinsService.instance().raiseTechnicalError(err)
      //MicrosoftTeamsService.instance().send(webhookUrl, "Deploy 'TunnelCourtier' (Branch '${projectBranch}' To '${deployTo}') FAILED")
      GitlabService.instance().updatePipelineStatusToFailed()
    }
}
