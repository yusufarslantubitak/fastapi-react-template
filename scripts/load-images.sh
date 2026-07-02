#!/usr/bin/env bash
set -e

# ==========================================================
# offline-setup-docker.sh — Run on the AIR-GAPPED PC only once.
#
# Loads all Docker images from the offline cache.
# ==========================================================

cd "$(dirname "$0")/.."

IMAGE_DIR="offline-cache/docker"

if [ ! -d "$IMAGE_DIR" ] || [ -z "$(ls -A $IMAGE_DIR/*.tar 2>/dev/null)" ]; then
  echo "Error: No .tar files found in $IMAGE_DIR"
  exit 1
fi

echo "Loading Docker images from $IMAGE_DIR/..."
for tar in $IMAGE_DIR/*.tar; do
  echo "  Loading $(basename $tar)..."
  docker load -i "$tar"
done

echo "Done! Now start the development environment using: bash scripts/dev.sh"
