import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon"
import SmartPhone01Icon from "@hugeicons/core-free-icons/dist/esm/SmartPhone01Icon"
import CardExchange01Icon from "@hugeicons/core-free-icons/dist/esm/CardExchange01Icon"
import ReceiptDollarIcon from "@hugeicons/core-free-icons/dist/esm/ReceiptDollarIcon"
import ChartCandlestickIcon from "@hugeicons/core-free-icons/dist/esm/ChartCandlestickIcon"
import MoneySend01Icon from "@hugeicons/core-free-icons/dist/esm/MoneySend01Icon"
import MoneyReceive01Icon from "@hugeicons/core-free-icons/dist/esm/MoneyReceive01Icon"
import CallingIcon from "@hugeicons/core-free-icons/dist/esm/CallingIcon"
import ShoppingCart01Icon from "@hugeicons/core-free-icons/dist/esm/ShoppingCart01Icon"
import CoinsDollarIcon from "@hugeicons/core-free-icons/dist/esm/CoinsDollarIcon"
import CheckmarkCircle01Icon from "@hugeicons/core-free-icons/dist/esm/CheckmarkCircle01Icon"
import UserIcon from "@hugeicons/core-free-icons/dist/esm/UserIcon"
import DollarCircleIcon from "@hugeicons/core-free-icons/dist/esm/DollarCircleIcon"
import Edit01Icon from "@hugeicons/core-free-icons/dist/esm/Edit01Icon"
import Wallet01Icon from "@hugeicons/core-free-icons/dist/esm/Wallet01Icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"

type View = "main" | "mpesa" | "mpesa-action" | "transfer" | "transfer-confirm" | "transfer-success" | "buy-shares" | "buy-shares-success"

const mpesaActions = [
  { id: "send", label: "Send Money", icon: MoneySend01Icon, description: "Send money to any Mpesa number" },
  { id: "deposit", label: "Deposit from Mpesa", icon: MoneyReceive01Icon, description: "Deposit funds from your Mpesa" },
  { id: "airtime", label: "Buy Airtime", icon: CallingIcon, description: "Buy airtime for any number" },
  { id: "goods", label: "Buy Goods", icon: ShoppingCart01Icon, description: "Pay for goods and services" },
  { id: "float", label: "Float Purchase", icon: CoinsDollarIcon, description: "Purchase float for your business" },
]

const serviceCategories = [
  {
    id: "mpesa",
    label: "Mpesa",
    icon: SmartPhone01Icon,
    description: "Send, deposit, buy airtime & more",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "transfer",
    label: "Funds Transfer",
    icon: CardExchange01Icon,
    description: "Send money to any bank or wallet",
    color: "bg-primary/10 text-primary",
  },
  {
    id: "bills",
    label: "Bill Payment",
    icon: ReceiptDollarIcon,
    description: "Pay all your bills in one place",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: "shares",
    label: "Buy Shares",
    icon: ChartCandlestickIcon,
    description: "Invest in the stock market",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
]

export function FundsTransferPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<View>("main")
  const [selectedAction, setSelectedAction] = useState("")

  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")

  const [phone, setPhone] = useState("")
  const [mpesaAmount, setMpesaAmount] = useState("")

  const [symbol, setSymbol] = useState("")
  const [sharesAmount, setSharesAmount] = useState("")

  const resetForm = () => {
    setRecipient("")
    setAmount("")
    setMemo("")
    setView("main")
  }

  const resetMpesa = () => {
    setPhone("")
    setMpesaAmount("")
    setView("main")
  }

  const resetShares = () => {
    setSymbol("")
    setSharesAmount("")
    setView("main")
  }

  if (view === "transfer-success") {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/10">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={40} className="text-emerald-500" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Transfer Successful!</h1>
          <p className="text-sm text-muted-foreground">
            ${amount} has been sent to {recipient}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 pt-4">
          <Button size="lg" className="w-full" onClick={resetForm}>
            Send Another
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/home")}>
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  if (view === "transfer-confirm") {
    return (
      <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
        <PageHeader
          left={
            <>
              <Button variant="ghost" size="icon" onClick={() => setView("transfer")}>
                <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
              </Button>
              <h1 className="text-base font-semibold">Confirm Transfer</h1>
            </>
          }
        />

        <Card>
          <CardContent className="space-y-5 px-6 py-6">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{recipient.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">To: {recipient}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-3xl font-bold">${amount}</p>
            </div>
            {memo && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Memo</p>
                  <p className="text-sm">{memo}</p>
                </div>
              </>
            )}
            <Separator />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-sm font-medium">Main Wallet ($12,845.60)</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setView("transfer")}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => setView("transfer-success")}>
            Confirm & Send
          </Button>
        </div>
      </div>
    )
  }

  if (view === "transfer") {
    return (
      <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
        <PageHeader
          left={
            <>
              <Button variant="ghost" size="icon" onClick={() => setView("main")}>
                <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
              </Button>
              <h1 className="text-base font-semibold">Funds Transfer</h1>
            </>
          }
        />

        <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <HugeiconsIcon icon={Wallet01Icon} size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-sm font-medium">Main Wallet</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-sm font-medium">$12,845.60</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={UserIcon}
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="recipient"
                placeholder="Phone number or email"
                className="pl-9"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          </div>

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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <p className="px-1 text-[10px] text-muted-foreground">
              Available: ${Number(12845.6 - Number(amount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">Memo (optional)</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={Edit01Icon}
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="memo"
                placeholder="What is this for?"
                className="pl-9"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={!recipient || !amount}
          onClick={() => setView("transfer-confirm")}
        >
          Continue
        </Button>
      </div>
    )
  }

  if (view === "mpesa") {
    return (
      <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
        <PageHeader
          left={
            <>
              <Button variant="ghost" size="icon" onClick={() => setView("main")}>
                <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
              </Button>
              <h1 className="text-base font-semibold">Mpesa Services</h1>
            </>
          }
        />

        <div className="space-y-3">
          {mpesaActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors hover:bg-accent"
              onClick={() => {
                setSelectedAction(action.label)
                setView("mpesa-action")
              }}
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <HugeiconsIcon icon={action.icon} size={24} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{action.label}</p>
                <p className="truncate text-xs text-muted-foreground">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (view === "mpesa-action") {
    const action = mpesaActions.find((a) => a.label === selectedAction)
    return (
      <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
        <PageHeader
          left={
            <>
              <Button variant="ghost" size="icon" onClick={() => setView("mpesa")}>
                <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
              </Button>
              <h1 className="text-base font-semibold">{selectedAction}</h1>
            </>
          }
        />

        <Card>
          <CardContent className="flex flex-col items-center gap-3 px-6 py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <HugeiconsIcon icon={action?.icon ?? SmartPhone01Icon} size={32} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{action?.description}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <HugeiconsIcon icon={Wallet01Icon} size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-sm font-medium">Main Wallet</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-sm font-medium">$12,845.60</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={SmartPhone01Icon}
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="phone"
                type="tel"
                placeholder="07XX XXX XXX"
                className="pl-9"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mpesa-amount">Amount</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={DollarCircleIcon}
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="mpesa-amount"
                type="number"
                placeholder="0.00"
                className="pl-9"
                value={mpesaAmount}
                onChange={(e) => setMpesaAmount(e.target.value)}
              />
            </div>
            <p className="px-1 text-[10px] text-muted-foreground">
              Available: ${Number(12845.6 - Number(mpesaAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={!phone || !mpesaAmount}
          onClick={() => {
            setView("main")
            resetMpesa()
          }}
        >
          Submit
        </Button>
      </div>
    )
  }

  if (view === "buy-shares-success") {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/10">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={40} className="text-emerald-500" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Order Placed!</h1>
          <p className="text-sm text-muted-foreground">
            ${sharesAmount} of {symbol} has been purchased
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 pt-4">
          <Button size="lg" className="w-full" onClick={resetShares}>
            Buy More
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/home")}>
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  if (view === "buy-shares") {
    return (
      <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
        <PageHeader
          left={
            <>
              <Button variant="ghost" size="icon" onClick={() => setView("main")}>
                <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
              </Button>
              <h1 className="text-base font-semibold">Buy Shares</h1>
            </>
          }
        />

        <Card>
          <CardContent className="flex flex-col items-center gap-3 px-6 py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-violet-500/10">
              <HugeiconsIcon icon={ChartCandlestickIcon} size={32} className="text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Invest in your favorite stocks</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <HugeiconsIcon icon={Wallet01Icon} size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-sm font-medium">Main Wallet</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-sm font-medium">$12,845.60</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="symbol">Stock Symbol</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={ChartCandlestickIcon}
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="symbol"
                placeholder="e.g. AAPL, GOOGL, TSLA"
                className="pl-9 uppercase"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shares-amount">Amount</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={DollarCircleIcon}
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="shares-amount"
                type="number"
                placeholder="0.00"
                className="pl-9"
                value={sharesAmount}
                onChange={(e) => setSharesAmount(e.target.value)}
              />
            </div>
            <p className="px-1 text-[10px] text-muted-foreground">
              Available: ${Number(12845.6 - Number(sharesAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={!symbol || !sharesAmount}
          onClick={() => setView("buy-shares-success")}
        >
          Buy Now
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
            </Button>
            <h1 className="text-base font-semibold">Transfers & Services</h1>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4">
        {serviceCategories.map((service) => (
          <button
            key={service.id}
            type="button"
            className="flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-colors hover:bg-accent"
            onClick={() => {
              if (service.id === "bills") {
                navigate("/pay-bills")
              } else if (service.id === "mpesa") {
                setView("mpesa")
              } else if (service.id === "transfer") {
                setView("transfer")
              } else if (service.id === "shares") {
                setView("buy-shares")
              }
            }}
          >
            <div className={`flex size-14 items-center justify-center rounded-2xl ${service.color}`}>
              <HugeiconsIcon icon={service.icon} size={28} />
            </div>
            <div>
              <p className="text-sm font-medium">{service.label}</p>
              <p className="text-xs text-muted-foreground">{service.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
