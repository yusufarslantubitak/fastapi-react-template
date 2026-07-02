#!/usr/bin/env bash
set -e
set -x

# ==========================================================
# create-images.sh — Run on the INTERNET-CONNECTED PC
#
# Builds builder images, pulls base images, and saves
# everything needed for offline development to a tar file.
# ==========================================================

cd "$(dirname "$0")/.."

# --- Step 1: Pull base images ---

echo "Pulling base images..."
docker pull nginx:1
docker pull postgres:18
docker pull adminer
docker pull alpine:latest

# --- Step 2: Save all images to offline cache ---

echo "Saving images to offline-cache/docker/..."
mkdir -p offline-cache/docker

docker save -o offline-cache/docker/nginx.tar                  nginx:1
docker save -o offline-cache/docker/postgres.tar               postgres:18
docker save -o offline-cache/docker/adminer.tar                adminer
docker save -o offline-cache/docker/alpine.tar                 alpine:latest

echo "Done! Transfer the project to the air-gapped PC."

