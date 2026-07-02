import { Link as RouterLink, useRouterState } from "@tanstack/react-router"
import { ArrowLeft, Shield, Users } from "lucide-react"
import { useTranslation } from "react-i18next"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import { User } from "@/components/Sidebar/User"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"

export function AdminSidebar() {
  const { user: currentUser } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()
  const { t } = useTranslation()
  const router = useRouterState()
  const currentPath = router.location.pathname

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>
            <Shield className="mr-2 size-3.5" />
            {t("sidebar.adminPanel")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={t("sidebar.admin")}
                  isActive={currentPath === "/admin"}
                  asChild
                >
                  <RouterLink to="/admin" onClick={handleMenuClick}>
                    <Users />
                    <span>{t("sidebar.admin")}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={t("sidebar.backToApp")} asChild>
                  <RouterLink to="/" onClick={handleMenuClick}>
                    <ArrowLeft />
                    <span>{t("sidebar.backToApp")}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AdminSidebar
