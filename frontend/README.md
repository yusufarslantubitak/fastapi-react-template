# Frontend Guide

This is a guide for frontend-specific tasks like client SDK generation and configuration.

---

## 1. Client SDK Generation

To regenerate the frontend TypeScript API client SDK when the backend routes change (run from the project root):
```bash
bash ./scripts/generate-client.sh
```

---

## 2. Using a Remote API

If you want to use a remote API, you can set the environment variable `VITE_API_URL` to the URL of the remote API in your `frontend/.env` file:
```env
VITE_API_URL=https://api.my-domain.example.com
```

---

## 3. Code Structure

```text
frontend/
└── src/                  # Main source code
    ├── assets/           # Static assets
    ├── client/           # Generated OpenAPI client SDK
    ├── components/       # Common UI components
    ├── hooks/            # Custom React hooks
    └── routes/           # TanStack File-based routing pages
```
