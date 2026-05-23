import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import CoinsDollarIcon from "@hugeicons/core-free-icons/dist/esm/CoinsDollarIcon"
import Calendar01Icon from "@hugeicons/core-free-icons/dist/esm/Calendar01Icon"
import AlertCircleIcon from "@hugeicons/core-free-icons/dist/esm/AlertCircleIcon"
import ArrowRight01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowRight01Icon"
import PlusSignIcon from "@hugeicons/core-free-icons/dist/esm/PlusSignIcon"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"

type LoanStatus = "active" | "overdue" | "paid"

type Loan = {
  id: number
  type: string
  amount: number
  remaining: number
  nextPayment: string
  status: LoanStatus
  progress: number
  monthlyPayment: number
}

const loans: Loan[] = [
  {
    id: 1,
    type: "Personal Loan",
    amount: 10000,
    remaining: 6200,
    nextPayment: "Jun 15, 2026",
    status: "active",
    progress: 38,
    monthlyPayment: 420,
  },
  {
    id: 2,
    type: "Business Loan",
    amount: 25000,
    remaining: 18000,
    nextPayment: "May 28, 2026",
    status: "active",
    progress: 28,
    monthlyPayment: 1100,
  },
  {
    id: 3,
    type: "Emergency Loan",
    amount: 3000,
    remaining: 3000,
    nextPayment: "May 20, 2026",
    status: "overdue",
    progress: 0,
    monthlyPayment: 250,
  },
]

const statusConfig: Record<LoanStatus, { label: string; variant: "default" | "destructive" | "secondary" }> = {
  active: { label: "Active", variant: "default" },
  overdue: { label: "Overdue", variant: "destructive" },
  paid: { label: "Paid", variant: "secondary" },
}

function LoanCard({ loan }: { loan: Loan }) {
  const status = statusConfig[loan.status]
  const navigate = useNavigate()

  return (
    <button type="button" className="w-full text-left" onClick={() => navigate(`/loans/${loan.id}`)}>
      <Card size="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{loan.type}</CardTitle>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-xl font-bold">${loan.remaining.toLocaleString()}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs text-muted-foreground">Total Loan</p>
            <p className="text-sm">${loan.amount.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{loan.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${loan.progress}%` }}
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Calendar01Icon} size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Next: {loan.nextPayment}
            </span>
          </div>
          <span className="text-xs font-medium">
            ${loan.monthlyPayment}/mo
          </span>
        </div>
      </CardContent>
      </Card>
    </button>
  )
}

export function LoansPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <h1 className="text-base font-semibold">My Loans</h1>
          </>
        }
        right={
          <Button size="xs" variant="default">
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Apply
          </Button>
        }
      />

      <Card>
        <CardContent className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10">
              <HugeiconsIcon icon={CoinsDollarIcon} size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Outstanding</p>
              <p className="text-2xl font-bold">$27,200</p>
            </div>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="text-muted-foreground" />
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-destructive" />
        <span className="text-xs text-destructive">1 overdue payment</span>
      </div>

      <div className="space-y-4">
        {loans.map((loan) => (
          <LoanCard key={loan.id} loan={loan} />
        ))}
      </div>
    </div>
  )
}
