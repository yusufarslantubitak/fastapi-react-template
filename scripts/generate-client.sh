#!/usr/bin/env bash
set -e
set -x

# ==========================================================
# generate-client.sh — Regenerate the frontend OpenAPI client SDK
# ==========================================================

# Locate uv binary
if command -v uv &> /dev/null; then
  UV_CMD="uv"
else
  PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
  LOCAL_UV="$PROJECT_ROOT/backend/bin/uv/uv"
  if [ -f "$LOCAL_UV" ]; then
    UV_CMD="$LOCAL_UV"
  else
    echo "Error: uv is not installed and local copy not found at $LOCAL_UV" >&2
    exit 1
  fi
fi

cd "$(dirname "$0")/.."

echo "Exporting OpenAPI spec from backend..."
cd backend
$UV_CMD run python -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > ../frontend/openapi.json
cd ..


echo "Generating TypeScript client..."
cd frontend
npm run generate-client

echo "Linting generated code..."
npm run lint
cd ..

echo "Client SDK regenerated."

