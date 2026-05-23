import { useParams, useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon"
import Edit01Icon from "@hugeicons/core-free-icons/dist/esm/Edit01Icon"
import Delete01Icon from "@hugeicons/core-free-icons/dist/esm/Delete01Icon"
import MoneySend01Icon from "@hugeicons/core-free-icons/dist/esm/MoneySend01Icon"
import BankIcon from "@hugeicons/core-free-icons/dist/esm/BankIcon"
import DollarCircleIcon from "@hugeicons/core-free-icons/dist/esm/DollarCircleIcon"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"
import { beneficiaries } from "@/lib/data"

export function BeneficiaryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const beneficiary = beneficiaries.find((b) => b.id === Number(id))

  if (!beneficiary) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-medium">Beneficiary not found</p>
        <Button variant="outline" onClick={() => navigate("/beneficiaries")}>Back to Beneficiaries</Button>
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
            <h1 className="text-base font-semibold">Beneficiary</h1>
          </>
        }
        right={
          <div className="flex gap-1">
            <Button variant="ghost" size="icon">
              <HugeiconsIcon icon={Edit01Icon} size={20} />
            </Button>
            <Button variant="ghost" size="icon">
              <HugeiconsIcon icon={Delete01Icon} size={20} />
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 px-6 py-8 text-center">
          <Avatar className="size-20">
            <AvatarFallback className="text-2xl">{beneficiary.initial}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{beneficiary.name}</h2>
            <p className="text-sm text-muted-foreground">{beneficiary.account}</p>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardContent className="space-y-4 px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={BankIcon} size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Bank</span>
            </div>
            <span className="text-sm font-medium">{beneficiary.bank}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={DollarCircleIcon} size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Account</span>
            </div>
            <span className="text-sm font-medium">{beneficiary.account}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Last Sent</span>
            <span className="text-sm font-medium">3 days ago</span>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" className="w-full" onClick={() => navigate("/transfer")}>
        <HugeiconsIcon icon={MoneySend01Icon} size={18} />
        Send Money to {beneficiary.name.split(" ")[0]}
      </Button>
    </div>
  )
}
