#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "Starting development environment..."
docker compose -f compose.dev.yml up -d --build

echo "Exposing lock files, node_modules, and .venv to host..."
mkdir -p frontend backend

docker run --rm -v "$PROJECT_ROOT/frontend:/host" frontend-builder:latest sh -c \
  "cp -rf /app/frontend/node_modules /host/ && cp -f /app/frontend/package-lock.json /host/ 2>/dev/null || true && chown -R $(id -u):$(id -g) /host/node_modules /host/package-lock.json 2>/dev/null || true"

docker run --rm -v "$PROJECT_ROOT/backend:/host" backend-builder:latest sh -c \
  "cp -rf /app/.venv /host/ && cp -f /app/backend/uv.lock /host/ 2>/dev/null || true && chown -R $(id -u):$(id -g) /host/.venv /host/uv.lock 2>/dev/null || true"

docker compose -f compose.dev.yml logs -f
