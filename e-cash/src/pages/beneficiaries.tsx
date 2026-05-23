import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon"
import PlusSignIcon from "@hugeicons/core-free-icons/dist/esm/PlusSignIcon"
import Edit01Icon from "@hugeicons/core-free-icons/dist/esm/Edit01Icon"
import Delete01Icon from "@hugeicons/core-free-icons/dist/esm/Delete01Icon"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"
import { beneficiaries } from "@/lib/data"

export function BeneficiariesPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
            </Button>
            <h1 className="text-base font-semibold">Beneficiaries</h1>
          </>
        }
        right={
          <Button size="xs" onClick={() => navigate("/beneficiaries/add")}>
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Add
          </Button>
        }
      />

      <p className="text-xs text-muted-foreground">
        {beneficiaries.length} saved {beneficiaries.length === 1 ? "beneficiary" : "beneficiaries"}
      </p>

      <Card size="sm">
        <CardContent className="space-y-0 px-4 py-2">
          {beneficiaries.map((b, i) => (
            <div key={b.id}>
              <div className="flex items-center gap-3 py-3">
                <button
                  type="button"
                  className="flex flex-1 items-center gap-3 text-left"
                  onClick={() => navigate(`/beneficiaries/${b.id}`)}
                >
                  <Avatar>
                    <AvatarFallback>{b.initial}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.bank} &middot; {b.account}</p>
                  </div>
                </button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-xs">
                    <HugeiconsIcon icon={Edit01Icon} size={14} />
                  </Button>
                  <Button variant="ghost" size="icon-xs">
                    <HugeiconsIcon icon={Delete01Icon} size={14} />
                  </Button>
                </div>
              </div>
              {i < beneficiaries.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {beneficiaries.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-muted-foreground">No beneficiaries yet</p>
          <Button size="sm" onClick={() => navigate("/beneficiaries/add")}>
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Add a Beneficiary
          </Button>
        </div>
      )}
    </div>
  )
}
