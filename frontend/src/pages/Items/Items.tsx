import { Search } from "lucide-react"
import { Suspense } from "react"
import { useTranslation } from "react-i18next"

import { DataTable } from "@/components/Common/DataTable"
import PendingItems from "@/components/Pending/PendingItems"
import AddItem from "@/features/items/components/AddItem"
import { columns } from "@/features/items/components/columns"
import { useItemsSuspenseQuery } from "@/features/items/hooks/useItems"

function ItemsTableContent() {
  const { t } = useTranslation()
  const { data: items } = useItemsSuspenseQuery()

  if (items.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">{t("items.noItems")}</h3>
        <p className="text-muted-foreground">{t("items.noItemsDesc")}</p>
      </div>
    )
  }

  return <DataTable columns={columns} data={items.data} />
}

function ItemsTable() {
  return (
    <Suspense fallback={<PendingItems />}>
      <ItemsTableContent />
    </Suspense>
  )
}

export default function Items() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("items.title")}
          </h1>
          <p className="text-muted-foreground">{t("items.description")}</p>
        </div>
        <AddItem />
      </div>
      <ItemsTable />
    </div>
  )
}
