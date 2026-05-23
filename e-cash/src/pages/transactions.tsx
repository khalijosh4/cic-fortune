import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon"
import Search01Icon from "@hugeicons/core-free-icons/dist/esm/Search01Icon"
import ArrowRight01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowRight01Icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"
import { transactions } from "@/lib/data"

export function TransactionsPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
            </Button>
            <h1 className="text-base font-semibold">Transactions</h1>
          </>
        }
      />

      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input placeholder="Search transactions..." className="pl-9" />
      </div>

      <Card size="sm">
        <CardContent className="space-y-0 px-4 py-2">
          {transactions.map((tx, i) => (
            <div key={tx.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between py-3 text-left"
                onClick={() => navigate(`/transactions/${tx.id}`)}
              >
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{tx.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{tx.name}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium tabular-nums ${
                      tx.amount > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-muted-foreground" />
                </div>
              </button>
              {i < transactions.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
