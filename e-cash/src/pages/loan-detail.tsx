import { useParams, useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon"
import CoinsDollarIcon from "@hugeicons/core-free-icons/dist/esm/CoinsDollarIcon"
import Calendar01Icon from "@hugeicons/core-free-icons/dist/esm/Calendar01Icon"
import AlertCircleIcon from "@hugeicons/core-free-icons/dist/esm/AlertCircleIcon"
import CheckmarkCircle01Icon from "@hugeicons/core-free-icons/dist/esm/CheckmarkCircle01Icon"
import BankIcon from "@hugeicons/core-free-icons/dist/esm/BankIcon"
import { Card, CardContent } from "@/components/ui/card"
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
  interestRate: string
  term: string
  disbursed: string
  lender: string
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
    interestRate: "12.5%",
    term: "24 months",
    disbursed: "Jan 15, 2025",
    lender: "Equity Bank",
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
    interestRate: "14%",
    term: "36 months",
    disbursed: "Aug 10, 2024",
    lender: "KCB",
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
    interestRate: "18%",
    term: "12 months",
    disbursed: "May 20, 2026",
    lender: "Co-op Bank",
  },
]

const statusConfig: Record<LoanStatus, { label: string; variant: "default" | "destructive" | "secondary" }> = {
  active: { label: "Active", variant: "default" },
  overdue: { label: "Overdue", variant: "destructive" },
  paid: { label: "Paid", variant: "secondary" },
}

export function LoanDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const loan = loans.find((l) => l.id === Number(id))

  if (!loan) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-medium">Loan not found</p>
        <Button variant="outline" onClick={() => navigate("/loans")}>Back to Loans</Button>
      </div>
    )
  }

  const status = statusConfig[loan.status]

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate("/loans")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
            </Button>
            <h1 className="text-base font-semibold">{loan.type}</h1>
          </>
        }
        right={
          <Badge variant={status.variant}>{status.label}</Badge>
        }
      />

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="space-y-5 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Remaining Balance</p>
              <p className="text-3xl font-bold">${loan.remaining.toLocaleString()}</p>
            </div>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <HugeiconsIcon icon={CoinsDollarIcon} size={28} className="text-primary" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Repayment Progress</span>
              <span className="font-medium">{loan.progress}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${loan.progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loan.status === "overdue" && (
        <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 px-4 py-3">
          <HugeiconsIcon icon={AlertCircleIcon} size={18} className="shrink-0 text-destructive" />
          <span className="text-xs text-destructive">
            Payment overdue. Please make your payment of ${loan.monthlyPayment} by {loan.nextPayment}.
          </span>
        </div>
      )}

      <Card size="sm">
        <CardContent className="space-y-4 px-5 py-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Loan Amount</span>
            <span className="text-sm font-medium">${loan.amount.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Monthly Payment</span>
            <span className="text-sm font-medium">${loan.monthlyPayment.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Interest Rate</span>
            <span className="text-sm font-medium">{loan.interestRate}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Term</span>
            <span className="text-sm font-medium">{loan.term}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Disbursed</span>
            </div>
            <span className="text-sm font-medium">{loan.disbursed}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={BankIcon} size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Lender</span>
            </div>
            <span className="text-sm font-medium">{loan.lender}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-3">
        <HugeiconsIcon icon={Calendar01Icon} size={18} className="text-muted-foreground" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Next payment due</p>
          <p className="text-sm font-medium">{loan.nextPayment}</p>
        </div>
        <Button size="sm">Pay ${loan.monthlyPayment}</Button>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
          Pay Full Balance
        </Button>
        <Button className="flex-1">Pay ${loan.monthlyPayment}</Button>
      </div>
    </div>
  )
}
