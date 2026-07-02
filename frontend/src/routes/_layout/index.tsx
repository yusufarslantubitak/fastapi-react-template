import { createFileRoute } from "@tanstack/react-router"
import Dashboard from "@/pages/Dashboard/Dashboard"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Dashboard - FastAPI Template",
      },
    ],
  }),
})
