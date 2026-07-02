import { createFileRoute } from "@tanstack/react-router"
import MapPage from "@/pages/Map/Map"

export const Route = createFileRoute("/_layout/map")({
  component: MapPage,
  head: () => ({
    meta: [
      {
        title: "Interactive Map - FastAPI Template",
      },
    ],
  }),
})
