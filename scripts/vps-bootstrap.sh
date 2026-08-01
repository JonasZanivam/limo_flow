#!/usr/bin/env bash
# Setup inicial da VPS Hostinger (Ubuntu/Debian).
# Execute como root ou com sudo na VPS:
#   curl -fsSL ... | bash
# Ou copie o repo e rode: bash scripts/vps-bootstrap.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/limoflow}"
REPO_URL="${REPO_URL:-https://github.com/JonasZanivam/limo_flow.git}"
BRANCH="${BRANCH:-master}"

echo "==> Instalando Docker..."
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin não encontrado. Instale docker-compose-plugin."
  exit 1
fi

echo "==> Clonando repositório em ${APP_DIR}..."
if [ ! -d "${APP_DIR}/.git" ]; then
  git clone --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
else
  echo "Repositório já existe em ${APP_DIR}"
fi

cd "${APP_DIR}"

if [ ! -f .env ]; then
  cp .env.production.example .env
  echo ""
  echo "IMPORTANTE: edite ${APP_DIR}/.env antes do primeiro deploy!"
  echo "  - FRONTEND_URL"
  echo "  - POSTGRES_PASSWORD"
  echo "  - JWT_SECRET / JWT_REFRESH_SECRET"
  echo "  - Senhas do seed"
fi

echo ""
echo "==> Bootstrap concluído."
echo "Próximos passos:"
echo "  1. nano ${APP_DIR}/.env"
echo "  2. docker compose -f docker-compose.prod.yml --env-file .env up -d --build"
echo "  3. Configure secrets no GitHub Actions (VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_APP_PATH)"
echo "  4. Após primeiro deploy, defina RUN_SEED=false no .env"
