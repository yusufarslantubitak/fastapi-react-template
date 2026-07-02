import { createFileRoute } from "@tanstack/react-router"
import UserSettings from "@/pages/Settings/Settings"

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
  head: () => ({
    meta: [
      {
        title: "Settings - FastAPI Template",
      },
    ],
  }),
})
