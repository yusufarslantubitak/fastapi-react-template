#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "Regenerating frontend TypeScript client SDK..."

# Ensure builder images exist
docker compose -f compose.dev.yml build backend frontend

# Export OpenAPI spec from backend
docker run --rm \
  --env-file .env \
  -v "$PROJECT_ROOT/backend:/app/backend" \
  -e PYTHONPATH=/app/backend \
  backend-builder:latest \
  python -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > "$PROJECT_ROOT/frontend/openapi.json"

# Generate TypeScript client SDK
docker run --rm \
  -v "$PROJECT_ROOT/frontend:/app/frontend" \
  -w /app/frontend \
  frontend-builder:latest \
  npm run generate-client

# Lint the generated code
docker run --rm \
  -v "$PROJECT_ROOT/frontend:/app/frontend" \
  -w /app/frontend \
  frontend-builder:latest \
  npm run lint

echo "Done! Client SDK successfully regenerated."
