import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon"
import CopyIcon from "@hugeicons/core-free-icons/dist/esm/CopyIcon"
import Share01Icon from "@hugeicons/core-free-icons/dist/esm/Share01Icon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"

export function ReceivePage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
            </Button>
            <h1 className="text-base font-semibold">Receive Money</h1>
          </>
        }
      />

      <Card className="text-center">
        <CardContent className="space-y-6 px-6 py-8">
          <div className="mx-auto flex size-32 items-center justify-center rounded-3xl bg-muted">
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={`size-2 rounded-sm ${Math.random() > 0.5 ? "bg-foreground/20" : "bg-foreground/5"}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Your wallet address</p>
            <p className="break-all text-sm font-medium">0x8f3E...7a2C</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <HugeiconsIcon icon={CopyIcon} size={16} />
              Copy
            </Button>
            <Button className="flex-1">
              <HugeiconsIcon icon={Share01Icon} size={16} />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardContent className="space-y-3 px-4 py-4">
          <p className="text-xs font-medium">Share via</p>
          <div className="grid grid-cols-4 gap-3">
            {["Email", "SMS", "WhatsApp", "More"].map((method) => (
              <button
                key={method}
                type="button"
                className="rounded-2xl bg-muted py-2 text-xs font-medium text-muted-foreground"
              >
                {method}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
