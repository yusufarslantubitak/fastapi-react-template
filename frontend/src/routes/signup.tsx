import { createFileRoute, redirect } from "@tanstack/react-router"
import { getAuthUser } from "@/hooks/useAuth"
import SignUp from "@/pages/SignUp/SignUp"

export const Route = createFileRoute("/signup")({
  component: SignUp,
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
        title: "Sign Up - FastAPI Template",
      },
    ],
  }),
})
