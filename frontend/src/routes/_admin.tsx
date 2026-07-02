import { createFileRoute, redirect } from "@tanstack/react-router"
import type { UserPublic } from "@/client"
import { getAuthUser } from "@/hooks/useAuth"
import AdminLayout from "@/layouts/AdminLayout/AdminLayout"

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
  beforeLoad: async () => {
    let user: UserPublic
    try {
      user = await getAuthUser()
    } catch (_e) {
      throw redirect({
        to: "/login",
      })
    }
    if (!user.is_superuser) {
      throw redirect({
        to: "/",
      })
    }
  },
})
