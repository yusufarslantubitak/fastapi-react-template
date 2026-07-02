---
name: frontend-architecture
description: Frontend architecture guidelines using Feature-Sliced Design (FSD) and co-located React components/hooks.
---

# Frontend Architecture: Feature-Sliced Design (FSD)

The frontend is structured by functional domains (slices) under `frontend/src/features/` rather than flat global files.

---

## 1. Directory Structure
Each feature domain (like `items`) must be completely self-contained in its own directory:
```
frontend/src/features/items/
├── components/
│   ├── AddItem.tsx
│   ├── EditItem.tsx
│   ├── DeleteItem.tsx
│   └── columns.tsx
└── hooks/
    └── useItems.ts
```

---

## 2. Layer Definitions & Rules

### Components Layer (`features/[feature_name]/components/`)
- Handles the UI layout, styling (Tailwind CSS, shadcn), and validation (e.g. `react-hook-form` + `zod`).
- **Rule**: Banned from directly using raw `useQuery`/`useMutation` or importing from the OpenAPI auto-generated `@/client` folder. They must delegate all API coordination to custom hooks.

### Hooks Layer (`features/[feature_name]/hooks/`)
- Contains custom React hooks encapsulating TanStack Query hooks, query keys, invalidation triggers, and toast notifications.
- Exposes query results and mutation triggers to components.
- Example (`features/items/hooks/useItems.ts`):
  ```typescript
  export const useCreateItemMutation = (options?: { onSuccess?: () => void }) => {
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const { t } = useTranslation()

    return useMutation({
      mutationFn: (data: ItemCreate) => ItemsService.createItem({ requestBody: data }),
      onSuccess: () => {
        showSuccessToast(t("items.successCreated"))
        options?.onSuccess?.()
      },
      onError: handleError.bind(showErrorToast),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["items"] })
      },
    })
  }
  ```

### Pages Layer (`src/pages/`)
- Contains folder-based page components (e.g., `src/pages/Items/Items.tsx`).
- Orchestrates and composes features, components, and hooks for specific pages.

### Layouts Layer (`src/layouts/`)
- Contains folder-based layout components (e.g., `src/layouts/DashboardLayout/DashboardLayout.tsx`).
- Each layout wraps an `<Outlet />` and provides shared chrome (sidebar, header, footer) for a group of routes.
- Different route groups use different layouts:
  - `DashboardLayout` — regular app pages (dashboard, items, map, settings) via `_layout.tsx`.
  - `AdminLayout` — admin pages via `_admin.tsx`, with admin-specific sidebar and visual indicators.
- **Rule**: Layout files must not contain routing logic. They receive children via `<Outlet />` from TanStack Router.

### Routes Layer (`src/routes/`)
- Handles path mapping, routing configurations (TanStack Router), and route guards.
- **Rule**: Route files must not define page or layout component rendering logic directly. They must import the component from `@/pages/...` or `@/layouts/...` (e.g., `import DashboardLayout from "@/layouts/DashboardLayout/DashboardLayout"`).

