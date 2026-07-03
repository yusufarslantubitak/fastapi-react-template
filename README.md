# Full Stack FastAPI Template (Offline & Air-Gapped)

This repository contains a simplified full stack web application template configured for local, offline development in air-gapped environments.

---

## Prerequisites

Before starting, make sure you have the following installed on your computer:

- **Docker**: For running the database container.
- **Python (3.13.12)**: The programming language for the backend (we suggest using [pyenv](https://github.com/pyenv/pyenv) to manage Python versions).
- **uv**: Python package installer and resolver.
- **Node.js (22)**: Environment for frontend dependencies (we suggest using [fnm](https://github.com/Schniz/fnm) to manage Node.js versions).

---

## Setup

1. **Load Cached Offline Images** (run once to load base images for air-gapped system):
   ```bash
   ./scripts/offline-setup-docker.sh
   ```

---

## Development

Start both the backend and frontend development environments (along with the Postgres and Adminer Docker containers):

```bash
bash scripts/dev.sh
```

---

## Client SDK Generation

If you modify backend API models or routes, regenerate the frontend TypeScript client:

```bash
./scripts/generate-client.sh
```

---

## Production Build

This project utilizes a **two-stage build flow** designed for fast, offline, and air-gapped deployments. By separating dependency installation from code packaging, we cache heavy dependency layers (`node_modules` and Python site-packages) so that subsequent builds only take seconds.

### Step 1: Build the Builder Images (Run when dependencies change)

If you modify backend dependencies ([pyproject.toml](file:///home/user/coding/full-stack-fastapi-template/backend/pyproject.toml)) or frontend dependencies ([package.json](file:///home/user/coding/full-stack-fastapi-template/frontend/package.json)), you must rebuild the builder base images:

**Backend Builder:**
```bash
# Run from the project root
docker build --network host -t backend-builder:latest -f backend/Dockerfile.build .
```

**Frontend Builder:**
```bash
# Run from the project root
docker build --network host -t frontend-builder:latest -f frontend/Dockerfile.build .
```

*Note: The `--network host` flag allows the build containers to reach your local package registries (e.g., Nexus at `localhost:8081`).*

---

### Step 2: Build the Production Images (Run when code changes)

When you make changes to the source code (in `backend/app/` or `frontend/src/`), you do not need to rebuild the builders. You can build the production-ready containers immediately:

```bash
# Run from the root directory
docker compose build
```

This command will:
1. Inherit from the cached `backend-builder` and `frontend-builder` images.
2. Inject your latest source code.
3. Compile the frontend assets into Nginx and set up the production Uvicorn server for the backend.

