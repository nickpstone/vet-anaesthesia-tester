#!/usr/bin/env bash
# ==============================================================================
# VetVap Test - Automated Virtual Machine Deployment Script
# Supports:
#   1) Docker & Docker Compose deployment (Recommended, isolated)
#   2) Native Linux Nginx deployment (Ubuntu/Debian/Rocky/RHEL)
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

APP_NAME="vetvap-tester"
WEB_ROOT="/var/www/vetvap"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}   VetVap Test - Virtual Machine Deployment Script              ${NC}"
echo -e "${CYAN}================================================================${NC}"

cd "${PROJECT_ROOT}"

# Check for Docker option
DEPLOY_MODE="auto"
if [[ "${1:-}" == "--docker" ]]; then
  DEPLOY_MODE="docker"
elif [[ "${1:-}" == "--native" ]]; then
  DEPLOY_MODE="native"
fi

if [[ "${DEPLOY_MODE}" == "auto" ]]; then
  if command -v docker &>/dev/null && command -v docker-compose &>/dev/null || docker compose version &>/dev/null 2>&1; then
    DEPLOY_MODE="docker"
    echo -e "${GREEN}✓ Detected Docker on this system. Using Docker deployment mode.${NC}"
  else
    DEPLOY_MODE="native"
    echo -e "${YELLOW}! Docker not found. Defaulting to Native Nginx deployment mode.${NC}"
  fi
fi

# ------------------------------------------------------------------------------
# 1. DOCKER DEPLOYMENT
# ------------------------------------------------------------------------------
if [[ "${DEPLOY_MODE}" == "docker" ]]; then
  echo -e "\n${CYAN}>>> Starting Docker Compose Deployment...${NC}"

  if docker compose version &>/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
  elif command -v docker-compose &>/dev/null; then
    COMPOSE_CMD="docker-compose"
  else
    echo -e "${RED}Error: Docker Compose is not installed.${NC}"
    exit 1
  fi

  echo -e "Stopping previous containers if any..."
  ${COMPOSE_CMD} down || true

  echo -e "Building Docker image..."
  ${COMPOSE_CMD} build --pull

  echo -e "Starting container..."
  ${COMPOSE_CMD} up -d

  echo -e "\n${GREEN}================================================================${NC}"
  echo -e "${GREEN}✓ Successfully deployed VetVap Test container via Docker!${NC}"
  echo -e "${GREEN}  Container: ${APP_NAME}${NC}"
  echo -e "${GREEN}  Accessible on: http://$(hostname -I | awk '{print $1}') or http://localhost${NC}"
  echo -e "${GREEN}================================================================${NC}"
  exit 0
fi

# ------------------------------------------------------------------------------
# 2. NATIVE NGINX DEPLOYMENT
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}>>> Starting Native Nginx Deployment...${NC}"

# Check Node.js and NPM
if ! command -v node &>/dev/null || ! command -v npm &>/dev/null; then
  echo -e "${RED}Error: Node.js and NPM are required for native build.${NC}"
  echo -e "Please install Node.js (v20+) or use Docker mode (--docker)."
  exit 1
fi

echo -e "Building production frontend assets with npm..."
npm install
npm run build

# Install Nginx if missing
if ! command -v nginx &>/dev/null; then
  echo -e "${YELLOW}Installing Nginx...${NC}"
  if command -v apt-get &>/dev/null; then
    sudo apt-get update -qq
    sudo apt-get install -y nginx
  elif command -v dnf &>/dev/null; then
    sudo dnf install -y nginx
  elif command -v yum &>/dev/null; then
    sudo yum install -y nginx
  elif command -v pacman &>/dev/null; then
    sudo pacman -Sy --noconfirm nginx
  else
    echo -e "${RED}Unsupported package manager. Please install Nginx manually.${NC}"
    exit 1
  fi
fi

# Prepare web root directory
echo -e "Publishing assets to ${WEB_ROOT}..."
sudo mkdir -p "${WEB_ROOT}"
sudo cp -r "${PROJECT_ROOT}/dist/"* "${WEB_ROOT}/"
sudo chown -R www-data:www-data "${WEB_ROOT}" 2>/dev/null || sudo chown -R nginx:nginx "${WEB_ROOT}" 2>/dev/null || true

# Setup Nginx configuration
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"

if [[ -d "${NGINX_CONF_DIR}" ]]; then
  # Debian / Ubuntu layout
  sudo cp "${PROJECT_ROOT}/nginx.conf" "${NGINX_CONF_DIR}/vetvap.conf"
  # Replace default root path in nginx.conf for native hosting
  sudo sed -i "s|root /usr/share/nginx/html;|root ${WEB_ROOT};|g" "${NGINX_CONF_DIR}/vetvap.conf"
  
  sudo mkdir -p "${NGINX_ENABLED_DIR}"
  sudo rm -f "${NGINX_ENABLED_DIR}/default" 2>/dev/null || true
  sudo ln -sf "${NGINX_CONF_DIR}/vetvap.conf" "${NGINX_ENABLED_DIR}/vetvap.conf"
else
  # RedHat / Alpine layout (/etc/nginx/conf.d/)
  sudo cp "${PROJECT_ROOT}/nginx.conf" "/etc/nginx/conf.d/vetvap.conf"
  sudo sed -i "s|root /usr/share/nginx/html;|root ${WEB_ROOT};|g" "/etc/nginx/conf.d/vetvap.conf"
  sudo rm -f "/etc/nginx/conf.d/default.conf" 2>/dev/null || true
fi

echo -e "Validating Nginx configuration syntax..."
sudo nginx -t

echo -e "Restarting Nginx service..."
if command -v systemctl &>/dev/null; then
  sudo systemctl restart nginx
  sudo systemctl enable nginx
else
  sudo service nginx restart || sudo nginx -s reload
fi

IP_ADDR=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "your-server-ip")

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}✓ Successfully deployed VetVap Test on Native Nginx!${NC}"
echo -e "${GREEN}  Web root: ${WEB_ROOT}${NC}"
echo -e "${GREEN}  Accessible on: http://${IP_ADDR} or http://localhost${NC}"
echo -e "${GREEN}================================================================${NC}"
