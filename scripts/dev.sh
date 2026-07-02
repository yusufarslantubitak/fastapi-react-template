#!/usr/bin/env bash
set -e

# ==========================================================
# dev.sh — Start both backend and frontend dev environments
# ==========================================================

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

# --- Step 1: Start DB dependency ---
echo "Starting Postgres and Adminer in Docker..."
docker compose up -d db adminer

# --- Step 2: Install and migrate Backend ---
echo "Installing python dependencies locally..."
cd "$PROJECT_ROOT/backend"
$UV_CMD sync

echo "Running migrations and initial database setup..."
$UV_CMD run bash scripts/prestart.sh

# --- Step 3: Install Frontend dependencies ---
echo "Installing frontend dependencies locally..."
cd "$PROJECT_ROOT/frontend"
npm install

# --- Step 4: Start development servers ---
echo "Starting development servers..."

# Function to clean up background processes on exit
cleanup() {
  echo ""
  echo "Shutting down development servers..."
  # Get PIDs of background jobs started in this shell session
  local pids
  pids=$(jobs -p)
  if [ -n "$pids" ]; then
    kill $pids 2>/dev/null || true
  fi
}

# Trap INT, TERM, and EXIT to trigger cleanup
trap cleanup INT TERM EXIT

# Start backend dev server in background
cd "$PROJECT_ROOT/backend"
$UV_CMD run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

# Start frontend dev server in background
cd "$PROJECT_ROOT/frontend"
npm run dev -- --host &

# Wait for any of the background processes to exit
wait -n
