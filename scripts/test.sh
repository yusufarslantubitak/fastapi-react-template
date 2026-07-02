#!/usr/bin/env bash

# Exit in case of error
set -e

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

# Start DB dependency in Docker
echo "Starting Postgres in Docker..."
docker compose up -d db

# Run migrations and tests locally
echo "Running migrations and DB setup locally..."
cd backend
export PYTHONPATH=$(pwd)
$UV_CMD run bash scripts/prestart.sh

# Run tests locally
echo "Running tests..."
$UV_CMD run bash scripts/tests-start.sh "$@"

