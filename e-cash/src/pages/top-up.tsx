import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon"
import DollarCircleIcon from "@hugeicons/core-free-icons/dist/esm/DollarCircleIcon"
import CheckmarkCircle01Icon from "@hugeicons/core-free-icons/dist/esm/CheckmarkCircle01Icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"

const quickAmounts = [20, 50, 100, 200]

export function TopUpPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
            </Button>
            <h1 className="text-base font-semibold">Top Up</h1>
          </>
        }
      />

      <Card>
        <CardContent className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={DollarCircleIcon}
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                className="rounded-2xl border border-border py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="card">From</Label>
            <div className="flex items-center gap-3 rounded-2xl border border-border px-3 py-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Debit Card •••• 4832</p>
                <p className="text-xs text-muted-foreground">Default</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" className="w-full">
        Top Up Now
      </Button>
    </div>
  )
}
