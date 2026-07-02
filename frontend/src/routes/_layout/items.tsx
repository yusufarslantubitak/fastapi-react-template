import { createFileRoute } from "@tanstack/react-router"
import Items from "@/pages/Items/Items"

export const Route = createFileRoute("/_layout/items")({
  component: Items,
  head: () => ({
    meta: [
      {
        title: "Items - FastAPI Template",
      },
    ],
  }),
})
