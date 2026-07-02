import { createFileRoute } from "@tanstack/react-router"
import Admin from "@/pages/Admin/Admin"

export const Route = createFileRoute("/_admin/admin")({
  component: Admin,
  head: () => ({
    meta: [
      {
        title: "Admin - FastAPI Template",
      },
    ],
  }),
})
