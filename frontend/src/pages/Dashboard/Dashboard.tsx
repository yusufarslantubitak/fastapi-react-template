import { useTranslation } from "react-i18next"
import useAuth from "@/hooks/useAuth"

export default function Dashboard() {
  const { user: currentUser } = useAuth()
  const { t } = useTranslation()

  return (
    <div>
      <div>
        <h1 className="text-2xl truncate max-w-sm">
          {t("dashboard.greeting", {
            name: currentUser?.full_name || currentUser?.email,
          })}
        </h1>
        <p className="text-muted-foreground">{t("dashboard.welcomeBack")}</p>
      </div>
    </div>
  )
}
