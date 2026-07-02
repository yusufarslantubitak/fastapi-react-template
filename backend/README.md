# Backend Guide

This is a guide for backend-specific tasks like database migrations and tests.

---

## 1. Database Changes (Migrations)


If you add a new field or table to [models.py](file:///home/user/coding/full-stack-fastapi-template/backend/app/models.py), you must tell the database to update its tables.

1. **Create the update plan** (run this in the `backend` folder):
   ```bash
   uv run alembic revision --autogenerate -m "description of change"
   ```
2. **Apply the update plan** to the database:
   ```bash
   uv run alembic upgrade head
   ```

_(If you do not want to use migrations at all, you can uncomment `SQLModel.metadata.create_all(engine)` in [db.py](file:///home/user/coding/full-stack-fastapi-template/backend/app/core/db.py) so tables are created automatically)._

---

## 2. How to Run Tests

Tests make sure your code works and you didn't break anything.

- **Run tests locally using the Docker database**:
  ```bash
  bash scripts/test.sh
  ```
- **Run pytest directly** (requires database to be already running):
  ```bash
  uv run pytest
  ```

