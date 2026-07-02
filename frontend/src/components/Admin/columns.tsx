import type { ColumnDef } from "@tanstack/react-table"
import { useTranslation } from "react-i18next"

import type { UserPublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { UserActionsMenu } from "./UserActionsMenu"

export type UserTableData = UserPublic & {
  isCurrentUser: boolean
}

export const columns: ColumnDef<UserTableData>[] = [
  {
    accessorKey: "full_name",
    header: () => {
      const { t } = useTranslation()
      return t("admin.fullName")
    },
    cell: ({ row }) => {
      const { t } = useTranslation()
      const fullName = row.original.full_name
      return (
        <div className="flex items-center gap-2">
          <span
            className={cn("font-medium", !fullName && "text-muted-foreground")}
          >
            {fullName || "N/A"}
          </span>
          {row.original.isCurrentUser && (
            <Badge variant="outline" className="text-xs">
              {t("admin.youBadge")}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: () => {
      const { t } = useTranslation()
      return t("admin.email")
    },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "is_superuser",
    header: () => {
      const { t } = useTranslation()
      return t("admin.role")
    },
    cell: ({ row }) => {
      const { t } = useTranslation()
      return (
        <Badge variant={row.original.is_superuser ? "default" : "secondary"}>
          {row.original.is_superuser ? t("admin.superuser") : t("admin.user")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "is_active",
    header: () => {
      const { t } = useTranslation()
      return t("admin.status")
    },
    cell: ({ row }) => {
      const { t } = useTranslation()
      return (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2 rounded-full",
              row.original.is_active ? "bg-green-500" : "bg-gray-400",
            )}
          />
          <span
            className={row.original.is_active ? "" : "text-muted-foreground"}
          >
            {row.original.is_active ? t("admin.active") : t("admin.inactive")}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => {
      const { t } = useTranslation()
      return <span className="sr-only">{t("admin.actions")}</span>
    },
    cell: ({ row }) => (
      <div className="flex justify-end">
        <UserActionsMenu user={row.original} />
      </div>
    ),
  },
]
