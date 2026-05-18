#!/bin/bash
# security-scan.sh - Generic project-level security scanner
# This is the ONLY file projects need - everything else is in the Docker image
source .platforms/bootstrap.sh
# Project-specific configuration (customize per project)
SCANNER_IMAGE="srv-nexus:18444/outillage/zaproxy:stable"
PROJECT_NAME="minds-rgpd-front-ng"

# Application configuration (REQUIRED - customize for your app)
APP_URL=""  # e.g., "https://my-app.com" or "https://staging.my-app.com"
AUTH_URL="http://sso.minds.k8s/auth/realms/creative/protocol/openid-connect/token" # e.g., "https://auth.my-app.com/token" (optional, for JWT auth)

# Environment mapping (customize for your app)
case "${1:-develop}" in
    "prod"|"production")
        APP_URL="https://minds-rgpd-front-ng.groupe-creative.fr/"
        ;;
    "demo")
        APP_URL="https://demo.minds-rgpd-front-ng.minds.k8s/"
        ;;
    "valid")
        APP_URL="https://valid.minds-rgpd-front-ng.minds.k8s/"
        ;;
    "int"|"integration")
        APP_URL="https://valid.minds-rgpd-front-ng.minds.k8s/"
        ;;
    *)
        echo "❌ Unknown environment: ${1}"
        echo "Available: prod, staging, develop"
        exit 1
        ;;
esac

# Validation
if [ -z "$APP_URL" ]; then
    echo "❌ APP_URL not configured for environment: ${1:-develop}"
    echo "Edit this script and set APP_URL for your application"
    exit 1
fi

ENVIRONMENT=${1:-"develop"}

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}"
    echo "🔒 Corporate Security Scanner for $PROJECT_NAME"
    echo "Environment: $ENVIRONMENT"
    echo "Target: $APP_URL"
    echo "================================================"
    echo -e "${NC}"
}

# Validate configuration
validate_config() {
    if [ "$APP_URL" = "https://my-app.com" ] || [ "$APP_URL" = "https://staging.my-app.com" ] || [ "$APP_URL" = "https://dev.my-app.com" ]; then
        echo -e "${RED}❌ Please configure APP_URL in this script${NC}"
        echo "Edit the case statement to set your actual application URLs"
        exit 1
    fi
}

# Run security scan using corporate dockerRun method
run_scan() {
    echo "🚀 Starting security scan using corporate dockerRun..."

    # Create reports directory
    mkdir -p "./security-reports"

    # Prepare environment variables for the scanner
    local docker_env_vars=""

    # Always pass the target URL and environment type
    docker_env_vars="$docker_env_vars -e ZAP_TARGET_URL=$APP_URL"
    docker_env_vars="$docker_env_vars -e ZAP_ENVIRONMENT=$ENVIRONMENT"

    # Pass authentication URL if configured
    if [ -n "$AUTH_URL" ]; then
        docker_env_vars="$docker_env_vars -e ZAP_AUTH_URL=$AUTH_URL"
    fi

    # Pass credentials from Jenkins/environment
    if [ -n "$ZAP_USERNAME" ]; then
        docker_env_vars="$docker_env_vars -e ZAP_USERNAME=$ZAP_USERNAME"
    fi

    if [ -n "$ZAP_PASSWORD" ]; then
        docker_env_vars="$docker_env_vars -e ZAP_PASSWORD=$ZAP_PASSWORD"
    fi

    # Prepare docker run options
    local docker_opts="-v $(pwd)/security-reports:/zap/wrk $docker_env_vars"

    docker pull $SCANNER_IMAGE
    # Use corporate dockerRun method
    docker run --rm \
            --name "security-scanner" \
            --network host \
            --user "$USER_ID:$GROUP_ID" \
            -v "$(pwd)/security-reports:/zap/wrk:rw" \
            $docker_env_vars \
            "$SCANNER_IMAGE" \
            zap-scan scan "$ENVIRONMENT"

    exit_code=$?
    # Fix file permissions after scan
    echo "🔧 Fixing file permissions..."
    if sudo chown -R "$(id -u):$(id -g)" "./security-reports" 2>/dev/null; then
        echo "✅ File permissions fixed"
    else
        echo "⚠️  Could not fix permissions - you may need to run: sudo chown -R \$(id -u):\$(id -g) ./security-reports"
    fi

    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ Security scan completed successfully!${NC}"
    else
        echo -e "${RED}❌ Security scan failed with exit code: $exit_code${NC}"
    fi

    echo "📄 Results: ./security-reports/index.html"
    return $exit_code
}

# Show configuration help
show_config_help() {
    echo "🔧 Configuration Help"
    echo ""
    echo "To use this script, you need to configure your application URLs:"
    echo ""
    echo "1. Edit this script (security-scan.sh)"
    echo "2. Update the case statement with your actual URLs:"
    echo ""
    echo '   "prod")'
    echo '       APP_URL="https://your-actual-app.com"'
    echo '       AUTH_URL="https://your-auth-server.com/token"  # optional'
    echo '       ;;'
    echo ""
    echo "3. Run: ./security-scan.sh prod"
    echo ""
    echo "This script uses the corporate dockerRun method for:"
    echo "• Automatic permission handling"
    echo "• Corporate security standards"
    echo "• Consistent user mapping"
}

# Show available commands
show_help() {
    echo "🔒 Corporate Security Scanner"
    echo ""
    echo "Usage:"
    echo "  ./security-scan.sh [environment]"
    echo ""
    echo "Environments:"
    echo "  prod, staging, develop"
    echo ""
    echo "Examples:"
    echo "  ./security-scan.sh develop    # Scan develop environment"
    echo "  ./security-scan.sh prod       # Scan production"
    echo ""
    echo "Setup:"
    echo "  ./security-scan.sh config     # Show configuration help"
    echo ""
    echo "Features:"
    echo "  • Uses corporate dockerRun method"
    echo "  • Automatic permission handling"
    echo "  • Consistent with company standards"
    echo ""
    echo "Results will be saved in ./security-reports/"
}

# Main execution
main() {
    case "${1:-scan}" in
        "config")
            show_config_help
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_header
            validate_config
            run_scan
            echo ""
            echo -e "${GREEN}✅ Security scan completed using corporate standards!${NC}"
            echo "📄 Results: ./security-reports/index.html"
            ;;
    esac
}

main "$@"
