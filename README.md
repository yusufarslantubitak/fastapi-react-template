# Full Stack FastAPI Template (Offline, Air-Gapped & Docker-Only)

This repository contains a full stack web application template configured for local, offline development in air-gapped environments using Docker as the **sole dependency**. 

No local installation of Python, Node.js, uv, or npm is required on your host machine.

---

## Prerequisites

Depending on how you choose to run the development environment:

- **Docker-based (Recommended)**: Only **Docker** (and Docker Compose) is required. No local Python or Node.js environment is needed.
- **Local/Host-based**: You will need:
  - **Docker**: For running the database container.
  - **Python (3.13.12)**: For running the backend locally.
  - **uv**: Python package manager.
  - **Node.js (22)**: For running the frontend locally.

---

## Development

You can start the development environments in one of two ways:

### Option A: Docker-based (Recommended, only requires Docker on host)

This mode runs the entire stack (database, migrations, backend, and frontend) inside Docker containers. Code directories are bind-mounted with hot-reloading enabled. It also extracts dependencies to the host for autocomplete/linter support.

To start:
```bash
bash scripts/dev.sh
```

- **Frontend**: http://localhost:5173 (with hot reload via Vite HMR)
- **Backend API Docs**: http://localhost:8000/docs (Swagger UI)
- **Adminer**: http://localhost:8080 (System: `PostgreSQL`, Server: `db`, DB/User: `app`/`postgres`, Password: `changethis`)

### Option B: Local/Host-based (Requires local Python/Node.js/uv)

This mode runs the database and adminer in Docker, while running the backend and frontend servers natively on your host machine.

To start:
```bash
bash scripts/dev-local.sh
```

- **Frontend**: http://localhost:5173 (with hot reload via Vite HMR)
- **Backend API Docs**: http://localhost:8000/docs (Swagger UI)
- **Adminer**: http://localhost:8080 (System: `PostgreSQL`, Server: `localhost`, DB/User: `app`/`postgres`, Password: `changethis`)

---

## IDE Support (Autocomplete & Linting)

To get full editor support (autocomplete, diagnostics, types, and suggestions):

1. Run `bash scripts/dev.sh` once. This extracts `node_modules` and `.venv` to your host filesystem and dynamically configures the virtualenv to use your host's Python 3.13.12 interpreter.
2. In VS Code or Cursor, select `backend/.venv/bin/python` as your workspace interpreter.
3. Your editor will now natively resolve all package imports and autocompletions using the Python 3.13.12 environment.

---

## Client SDK Generation

If you modify backend API models or routes, regenerate the frontend TypeScript client SDK inside the containers by running:

```bash
bash scripts/generate-client.sh
```

---

## Production Build

This project utilizes a **two-stage build flow** designed for fast, offline, and air-gapped deployments. By separating dependency installation from code packaging, we cache heavy dependency layers (`node_modules` and Python site-packages) so that subsequent builds only take seconds.

### Step 1: Build the Builder Images (Run when dependencies change)

If you modify backend dependencies ([pyproject.toml](file:///home/user/coding/full-stack-fastapi-template/backend/pyproject.toml)) or frontend dependencies ([package.json](file:///home/user/coding/full-stack-fastapi-template/frontend/package.json)), you must rebuild the builder base images:

**Backend Builder:**
```bash
docker build --network host -t backend-builder:latest -f backend/Dockerfile.build .
```

**Frontend Builder:**
```bash
docker build --network host -t frontend-builder:latest -f frontend/Dockerfile.build .
```

*Note: The `--network host` flag allows the build containers to reach your local package registries (e.g., Nexus at `localhost:8081`).*

---

### Step 2: Build the Production Images (Run when code changes)

When you make changes to the source code (in `backend/app/` or `frontend/src/`), you do not need to rebuild the builders. You can build the production-ready containers immediately:

```bash
docker compose build
```

This command will:
1. Inherit from the cached `backend-builder` and `frontend-builder` images.
2. Inject your latest source code.
3. Compile the frontend assets into Nginx and set up the production Uvicorn server for the backend.
