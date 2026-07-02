---
name: tanstack-frontend
description: Guidelines for Vite + React + TanStack Router + TanStack Query frontend development, including file-based routing, query hooks, mutations, and form handling.
---

# TanStack Frontend Patterns

Use this skill when developing or reviewing React frontend code using TanStack Router, TanStack Query (React Query), and shadcn/ui.

---

## 1. Routing (TanStack Router)

Routes are located in [src/routes/](file:///home/user/coding/full-stack-fastapi-template/frontend/src/routes/) and follow file-based routing.

### Route Definition

Use `createFileRoute` from `@tanstack/react-router` to define routes:

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/items")({
  component: ItemsComponent,
  head: () => ({
    meta: [{ title: "Items - FastAPI Template" }],
  }),
});
```

### Layout Routes

Prefix files with an underscore (e.g., `_layout.tsx` and folder `_layout/`) to define layout routes that wrap all child components under a shared template/navigation structure.

---

## 2. Data Fetching (TanStack Query)

Do not fetch APIs directly in components. Define query options and use TanStack Query hooks to cache and sync state.

### Suspense Queries

Prefer `useSuspenseQuery` for automatic loading states handled by `<Suspense>` wrappers:

```typescript
import { useSuspenseQuery } from "@tanstack/react-query";
import { ItemsService } from "@/client";

function getItemsQueryOptions() {
  return {
    queryFn: () => ItemsService.readItems({ skip: 0, limit: 100 }),
    queryKey: ["items"],
  };
}

// In component:
const { data: items } = useSuspenseQuery(getItemsQueryOptions());
```

### Mutations and Cache Invalidation

Use `useMutation` for writes/updates, and invalidate matching queries in `onSettled` (or `onSuccess`) to refresh the UI:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (data: ItemCreate) =>
    ItemsService.createItem({ requestBody: data }),
  onSuccess: () => {
    showSuccessToast("Item created!");
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});
```

---

## 3. Form Handling (React Hook Form & Zod)

Use `react-hook-form` along with `@hookform/resolvers/zod` and `zod` for schemas:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
});

const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: { title: "" },
});
```
