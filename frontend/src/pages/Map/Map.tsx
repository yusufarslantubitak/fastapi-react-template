import { MapIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import LeafletMap from "@/components/Map/LeafletMap"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function MapPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("map.workspace")}
        </h1>
        <p className="text-muted-foreground">{t("map.description")}</p>
      </div>

      <Alert>
        <MapIcon className="h-4 w-4" />
        <AlertTitle>{t("map.alertTitle")}</AlertTitle>
        <AlertDescription>{t("map.alertDesc")}</AlertDescription>
      </Alert>

      <LeafletMap />
    </div>
  )
}
