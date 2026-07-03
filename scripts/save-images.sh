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
docker pull node:22-slim
docker pull python:3.13.12-slim

# --- Step 2: Save all images to offline cache ---

echo "Saving images to offline-cache/docker/..."
mkdir -p offline-cache/docker

docker save -o offline-cache/docker/nginx.tar                  nginx:1
docker save -o offline-cache/docker/postgres.tar               postgres:18
docker save -o offline-cache/docker/adminer.tar                adminer
docker save -o offline-cache/docker/alpine.tar                 alpine:latest
docker save -o offline-cache/docker/node.tar                   node:22-slim
docker save -o offline-cache/docker/python.tar                 python:3.13.12-slim

echo "Done! Transfer the project to the air-gapped PC."

