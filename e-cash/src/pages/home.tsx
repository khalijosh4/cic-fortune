import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import Notification01Icon from "@hugeicons/core-free-icons/dist/esm/Notification01Icon"
import Settings02Icon from "@hugeicons/core-free-icons/dist/esm/Settings02Icon"
import MoneySend01Icon from "@hugeicons/core-free-icons/dist/esm/MoneySend01Icon"
import MoneyReceive01Icon from "@hugeicons/core-free-icons/dist/esm/MoneyReceive01Icon"
import Payment01Icon from "@hugeicons/core-free-icons/dist/esm/Payment01Icon"
import AddCircleIcon from "@hugeicons/core-free-icons/dist/esm/AddCircleIcon"
import ArrowRight01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowRight01Icon"
import UserIcon from "@hugeicons/core-free-icons/dist/esm/UserIcon"
import ChartIcon from "@hugeicons/core-free-icons/dist/esm/ChartIcon"
import EyeIcon from "@hugeicons/core-free-icons/dist/esm/EyeIcon"
import ViewOffIcon from "@hugeicons/core-free-icons/dist/esm/ViewOffIcon"
import Wallet01Icon from "@hugeicons/core-free-icons/dist/esm/Wallet01Icon"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"
import { transactions, beneficiaries } from "@/lib/data"

const quickActions = [
  { label: "Send", icon: MoneySend01Icon, color: "bg-primary/10 text-primary", to: "/transfer" },
  { label: "Receive", icon: MoneyReceive01Icon, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", to: "/receive" },
  { label: "Pay", icon: Payment01Icon, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", to: "/pay-bills" },
  { label: "Top Up", icon: AddCircleIcon, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", to: "/top-up" },
]

const recentTransactions = transactions.slice(0, 10)

export function HomePage() {
  const navigate = useNavigate()
  const [showGreeting, setShowGreeting] = useState(false)
  const [showBalance, setShowBalance] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem("justLoggedIn")) {
      setShowGreeting(true)
      const timer = setTimeout(() => {
        setShowGreeting(false)
        sessionStorage.removeItem("justLoggedIn")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <button type="button" className="flex items-center gap-3 text-left" onClick={() => navigate("/profile")}>
            <Avatar className="size-9">
              <AvatarFallback>
                <HugeiconsIcon icon={UserIcon} size={18} />
              </AvatarFallback>
            </Avatar>
            <div>
              {showGreeting && (
                <p className="text-xs text-muted-foreground transition-opacity duration-500">
                  Welcome back
                </p>
              )}
              <p className="text-sm font-medium">Alex Johnson</p>
            </div>
          </button>
        }
        right={
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <HugeiconsIcon icon={Settings02Icon} size={28} />
            </Button>
            <Button variant="ghost" size="icon">
              <HugeiconsIcon icon={Notification01Icon} size={28} />
            </Button>
          </>
        }
      />

      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-8 opacity-10">
          <HugeiconsIcon icon={Wallet01Icon} size={160} />
        </div>
        <CardContent className="relative space-y-4 px-6 py-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-primary-foreground/70">Total Balance</p>
            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              className="text-primary-foreground/70 hover:text-primary-foreground"
            >
              <HugeiconsIcon icon={showBalance ? EyeIcon : ViewOffIcon} size={18} />
            </button>
          </div>
          <div className="space-y-1">
            <p className="break-all text-3xl font-bold tracking-tight sm:text-4xl">
              {showBalance ? "$12,845.60" : "*****"}
            </p>
            <p className="text-xs text-primary-foreground/60">Main Wallet &middot; **** 8842</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
              +$1,240 this month
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="flex flex-col items-center gap-2"
            onClick={() => navigate(action.to)}
          >
            <div className={`flex size-12 items-center justify-center rounded-2xl ${action.color}`}>
              <HugeiconsIcon icon={action.icon} size={22} />
            </div>
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      <Card size="sm">
        <CardContent className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10">
              <HugeiconsIcon icon={ChartIcon} size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Spent this month</p>
              <p className="text-sm font-bold">$2,340.00</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">vs last month</p>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">-12%</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Saved Beneficiaries</h2>
          <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground" onClick={() => navigate("/beneficiaries")}>
            Manage <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {beneficiaries.map((b) => (
            <button
              key={b.id}
              type="button"
              className="flex shrink-0 flex-col items-center gap-2"
              onClick={() => navigate(`/beneficiaries/${b.id}`)}
            >
              <Avatar>
                <AvatarFallback>{b.initial}</AvatarFallback>
              </Avatar>
              <span className="max-w-16 truncate text-xs text-muted-foreground">{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Recent Transactions</h2>
          <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground" onClick={() => navigate("/transactions")}>
            See All <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </button>
        </div>
        <Card size="sm">
          <CardContent className="space-y-0 px-4 py-2">
            {recentTransactions.map((tx, i) => (
              <div key={tx.id}>
                <button type="button" className="flex w-full items-center justify-between py-3 text-left" onClick={() => navigate(`/transactions/${tx.id}`)}>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>{tx.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{tx.name}</p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium tabular-nums ${
                      tx.amount > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </button>
                {i < recentTransactions.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
