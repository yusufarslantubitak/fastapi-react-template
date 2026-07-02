# Build command (run this from the project root):
# docker build -t backend-prod:latest -f backend/Dockerfile .

FROM backend-builder:latest

WORKDIR /app/backend

COPY ./backend /app/backend

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH="/app/backend"
ENV PATH="/app/.venv/bin:$PATH"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]