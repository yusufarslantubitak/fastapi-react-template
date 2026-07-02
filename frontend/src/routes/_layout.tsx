import { createFileRoute, redirect } from "@tanstack/react-router"
import { getAuthUser } from "@/hooks/useAuth"
import DashboardLayout from "@/layouts/DashboardLayout/DashboardLayout"

export const Route = createFileRoute("/_layout")({
  component: DashboardLayout,
  beforeLoad: async () => {
    try {
      await getAuthUser()
    } catch (_e) {
      throw redirect({
        to: "/login",
      })
    }
  },
})
