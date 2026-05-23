import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon"
import UserIcon from "@hugeicons/core-free-icons/dist/esm/UserIcon"
import Building01Icon from "@hugeicons/core-free-icons/dist/esm/Building01Icon"
import DollarCircleIcon from "@hugeicons/core-free-icons/dist/esm/DollarCircleIcon"
import CheckmarkCircle01Icon from "@hugeicons/core-free-icons/dist/esm/CheckmarkCircle01Icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"

export function AddBeneficiaryPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [account, setAccount] = useState("")
  const [bank, setBank] = useState("")
  const [saved, setSaved] = useState(false)

  if (saved) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/10">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={40} className="text-emerald-500" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Beneficiary Added!</h1>
          <p className="text-sm text-muted-foreground">
            {name} has been saved to your beneficiaries
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 pt-4">
          <Button size="lg" className="w-full" onClick={() => { setName(""); setAccount(""); setBank(""); setSaved(false) }}>
            Add Another
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/beneficiaries")}>
            Back to Beneficiaries
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate("/beneficiaries")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
            </Button>
            <h1 className="text-base font-semibold">Add Beneficiary</h1>
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-3 px-6 py-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <HugeiconsIcon icon={UserIcon} size={32} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Add a new beneficiary</p>
            <p className="text-xs text-muted-foreground">Save someone for quick transfers</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <HugeiconsIcon
              icon={UserIcon}
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="name"
              placeholder="e.g. Jane Doe"
              className="pl-9"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account">Account Number</Label>
          <div className="relative">
            <HugeiconsIcon
              icon={DollarCircleIcon}
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="account"
              placeholder="e.g. 1234567890"
              className="pl-9"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bank">Bank Name</Label>
          <div className="relative">
            <HugeiconsIcon
              icon={Building01Icon}
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="bank"
              placeholder="e.g. Equity Bank"
              className="pl-9"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!name || !account || !bank}
        onClick={() => setSaved(true)}
      >
        Save Beneficiary
      </Button>
    </div>
  )
}
