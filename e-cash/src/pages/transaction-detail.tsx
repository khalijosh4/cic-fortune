import { useNavigate, useParams } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon"
import UserIcon from "@hugeicons/core-free-icons/dist/esm/UserIcon"
import Calendar01Icon from "@hugeicons/core-free-icons/dist/esm/Calendar01Icon"
import Edit01Icon from "@hugeicons/core-free-icons/dist/esm/Edit01Icon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"
import { transactions } from "@/lib/data"

export function TransactionDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const tx = transactions.find((t) => t.id === Number(id))

  if (!tx) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-4 p-4">
        <p className="text-sm text-muted-foreground">Transaction not found</p>
        <Button variant="outline" onClick={() => navigate("/transactions")}>
          Back
        </Button>
      </div>
    )
  }

  const isPositive = tx.amount > 0

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate("/transactions")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
            </Button>
            <h1 className="text-base font-semibold">Transaction</h1>
          </>
        }
      />

      <Card className="text-center">
        <CardContent className="space-y-4 px-6 py-8">
          <div className={`mx-auto flex size-16 items-center justify-center rounded-full ${
            isPositive ? "bg-emerald-500/10" : "bg-muted"
          }`}>
            <HugeiconsIcon
              icon={UserIcon}
              size={28}
              className={isPositive ? "text-emerald-500" : "text-foreground"}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{tx.name}</p>
            <p className={`text-4xl font-bold tabular-nums tracking-tight ${
              isPositive ? "text-emerald-600 dark:text-emerald-400" : ""
            }`}>
              {isPositive ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
            </p>
          </div>
          {tx.description && (
            <p className="text-sm text-muted-foreground">{tx.description}</p>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardContent className="space-y-0 px-4 py-2">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Calendar01Icon} size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Date</span>
            </div>
            <span className="text-xs font-medium">{tx.date}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={UserIcon} size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">From / To</span>
            </div>
            <span className="text-xs font-medium">{tx.name}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Edit01Icon} size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Description</span>
            </div>
            <span className="text-xs font-medium">{tx.description ?? "—"}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => navigate("/home")}>
          Home
        </Button>
        <Button className="flex-1" onClick={() => navigate("/transfer")}>
          Send Again
        </Button>
      </div>
    </div>
  )
}
