import { Outlet } from "@tanstack/react-router"
import { Shield } from "lucide-react"
import { useTranslation } from "react-i18next"
import AdminSidebar from "@/components/Sidebar/AdminSidebar"
import { Badge } from "@/components/ui/badge"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function AdminLayout() {
  const { t } = useTranslation()

  return (
    <SidebarProvider className="overflow-x-hidden">
      <AdminSidebar />
      <SidebarInset className="min-w-0 overflow-x-hidden">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-sidebar-accent/30 px-4">
          <SidebarTrigger className="-ml-1 text-muted-foreground" />
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          >
            <Shield className="size-3" />
            {t("sidebar.adminBadge")}
          </Badge>
        </header>
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
