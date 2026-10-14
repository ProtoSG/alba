#!/usr/bin/env bash
# Starts the full stack: PostgreSQL + ml-service + backend (Docker) and the Expo app.
#
# Usage:
#   ./run.sh          # services + app in the browser (web)
#   ./run.sh phone    # services + Expo QR for a physical device (same Wi-Fi)
#   ./run.sh stop     # stop the Docker services
set -euo pipefail

cd "$(dirname "$0")"
MODE="${1:-web}"

if [[ "$MODE" == "stop" ]]; then
  docker compose down
  exit 0
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

echo "Starting backend services (this builds images on the first run)..."
docker compose up -d --build --wait

echo "Services healthy: ml-service :8000, backend :8080"

cd app
if [[ ! -d node_modules ]]; then
  npm install
fi

case "$MODE" in
  web)
    export EXPO_PUBLIC_API_URL="http://localhost:8080"
    exec npx expo start --web
    ;;
  phone)
    LAN_IP="$(ip route get 1.1.1.1 | awk '{for (i=1;i<=NF;i++) if ($i=="src") print $(i+1)}')"
    export EXPO_PUBLIC_API_URL="http://${LAN_IP}:8080"
    echo "App will call the API at ${EXPO_PUBLIC_API_URL}"
    exec npx expo start --lan
    ;;
  *)
    echo "Unknown mode: $MODE (use web | phone | stop)" >&2
    exit 1
    ;;
esac
