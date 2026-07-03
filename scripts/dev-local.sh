#!/usr/bin/env bash
set -e

# Resolve project root
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Locate uv binary
if command -v uv &> /dev/null; then
  UV_CMD="uv"
else
  LOCAL_UV="$PROJECT_ROOT/backend/bin/uv/uv"
  if [ -f "$LOCAL_UV" ]; then
    UV_CMD="$LOCAL_UV"
  else
    echo "Error: uv is not installed and local copy not found at $LOCAL_UV" >&2
    exit 1
  fi
fi

# 1. Start database in Docker
echo "Starting Postgres and Adminer in Docker..."
docker compose up -d db adminer

# 2. Setup backend locally
echo "Syncing backend dependencies..."
cd "$PROJECT_ROOT/backend"
$UV_CMD sync

echo "Running backend migrations..."
$UV_CMD run bash scripts/prestart.sh

# 3. Setup frontend locally
echo "Installing frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
npm install

# 4. Start local development servers
echo "Starting local development servers..."

cleanup() {
  echo ""
  echo "Shutting down local servers..."
  local pids
  pids=$(jobs -p)
  if [ -n "$pids" ]; then
    kill $pids 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

# Start backend dev server in background
cd "$PROJECT_ROOT/backend"
$UV_CMD run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

# Start frontend dev server in background
cd "$PROJECT_ROOT/frontend"
npm run dev -- --host &

wait -n
