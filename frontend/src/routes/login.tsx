import { createFileRoute, redirect } from "@tanstack/react-router"
import { getAuthUser } from "@/hooks/useAuth"
import Login from "@/pages/Login/Login"

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    try {
      await getAuthUser()
    } catch (_e) {
      return
    }
    throw redirect({
      to: "/",
    })
  },
  head: () => ({
    meta: [
      {
        title: "Log In - FastAPI Template",
      },
    ],
  }),
})
