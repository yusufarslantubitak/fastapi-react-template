import type { ColumnDef } from "@tanstack/react-table"
import { Check, Copy } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { ItemPublic } from "@/client"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { cn } from "@/lib/utils"
import { ItemActionsMenu } from "./ItemActionsMenu"

function CopyId({ id }: { id: string }) {
  const [copiedText, copy] = useCopyToClipboard()
  const isCopied = copiedText === id

  return (
    <div className="flex items-center gap-1.5 group">
      <span className="font-mono text-xs text-muted-foreground">{id}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copy(id)}
      >
        {isCopied ? (
          <Check className="size-3 text-green-500" />
        ) : (
          <Copy className="size-3" />
        )}
        <span className="sr-only">Copy ID</span>
      </Button>
    </div>
  )
}

export const columns: ColumnDef<ItemPublic>[] = [
  {
    accessorKey: "id",
    header: () => {
      const { t } = useTranslation()
      return t("items.id")
    },
    cell: ({ row }) => <CopyId id={row.original.id} />,
  },
  {
    accessorKey: "title",
    header: () => {
      const { t } = useTranslation()
      return t("items.name")
    },
    cell: ({ row }) => (
      <span className="font-medium">{row.original.title}</span>
    ),
  },
  {
    accessorKey: "description",
    header: () => {
      const { t } = useTranslation()
      return t("items.descriptionLabel")
    },
    cell: ({ row }) => {
      const { t } = useTranslation()
      const description = row.original.description
      return (
        <span
          className={cn(
            "max-w-xs truncate block text-muted-foreground",
            !description && "italic",
          )}
        >
          {description || t("items.noDescription")}
        </span>
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
        <ItemActionsMenu item={row.original} />
      </div>
    ),
  },
]
