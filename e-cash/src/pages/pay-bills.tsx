import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon"
import Search01Icon from "@hugeicons/core-free-icons/dist/esm/Search01Icon"
import ElectricityStackIcon from "@hugeicons/core-free-icons/dist/esm/ElectricityStackIcon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"

const billers = [
  { name: "Electricity", icon: ElectricityStackIcon, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { name: "Water", icon: ElectricityStackIcon, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { name: "Internet", icon: ElectricityStackIcon, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { name: "Phone", icon: ElectricityStackIcon, color: "bg-green-500/10 text-green-600 dark:text-green-400" },
  { name: "Insurance", icon: ElectricityStackIcon, color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  { name: "Tax", icon: ElectricityStackIcon, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
]

export function PayBillsPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
            </Button>
            <h1 className="text-base font-semibold">Pay Bills</h1>
          </>
        }
      />

      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input placeholder="Search billers..." className="pl-9" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {billers.map((biller) => (
          <button
            key={biller.name}
            type="button"
            className="flex flex-col items-center gap-2 rounded-2xl border border-border px-3 py-4"
          >
            <div className={`flex size-10 items-center justify-center rounded-xl ${biller.color}`}>
              <HugeiconsIcon icon={biller.icon} size={20} />
            </div>
            <span className="text-xs font-medium">{biller.name}</span>
          </button>
        ))}
      </div>

      <Card size="sm">
        <CardContent className="space-y-3 px-4 py-4">
          <p className="text-xs font-medium">Recent Payments</p>
          <div className="space-y-2">
            {["Electric Bill - $95.00", "Phone Plan - $55.00"].map((item) => (
              <button
                key={item}
                type="button"
                className="w-full rounded-2xl bg-muted px-3 py-2 text-left text-xs"
              >
                {item}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
