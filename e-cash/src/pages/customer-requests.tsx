import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import CustomerServiceIcon from "@hugeicons/core-free-icons/dist/esm/CustomerServiceIcon"
import ChatIcon from "@hugeicons/core-free-icons/dist/esm/ChatIcon"
import AlertCircleIcon from "@hugeicons/core-free-icons/dist/esm/AlertCircleIcon"
import CheckmarkCircle01Icon from "@hugeicons/core-free-icons/dist/esm/CheckmarkCircle01Icon"
import PlusSignIcon from "@hugeicons/core-free-icons/dist/esm/PlusSignIcon"
import Search01Icon from "@hugeicons/core-free-icons/dist/esm/Search01Icon"
import FilterIcon from "@hugeicons/core-free-icons/dist/esm/FilterIcon"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"

type RequestStatus = "open" | "in-progress" | "resolved"

type CustomerRequest = {
  id: number
  title: string
  description: string
  status: RequestStatus
  date: string
  category: string
}

const requests: CustomerRequest[] = [
  {
    id: 1,
    title: "Dispute Transaction",
    description: "I don't recognize a charge of $49.99 on May 10th",
    status: "open",
    date: "Today",
    category: "Disputes",
  },
  {
    id: 2,
    title: "Loan Application Status",
    description: "Applied for personal loan 5 days ago, still pending",
    status: "in-progress",
    date: "Yesterday",
    category: "Loans",
  },
  {
    id: 3,
    title: "Update Contact Number",
    description: "Need to update my phone number on the account",
    status: "resolved",
    date: "3 days ago",
    category: "Account",
  },
  {
    id: 4,
    title: "Card Replacement Request",
    description: "Lost my physical card, need a replacement",
    status: "in-progress",
    date: "5 days ago",
    category: "Cards",
  },
  {
    id: 5,
    title: "Fee Waiver Request",
    description: "Requesting waiver of the monthly maintenance fee",
    status: "resolved",
    date: "1 week ago",
    category: "Billing",
  },
]

const statusConfig: Record<RequestStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  "open": { label: "Open", variant: "default" },
  "in-progress": { label: "In Progress", variant: "secondary" },
  "resolved": { label: "Resolved", variant: "outline" },
}

export function CustomerRequestsPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <h1 className="text-base font-semibold">Requests</h1>
          </>
        }
        right={
          <Button size="xs">
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            New
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input placeholder="Search requests..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon">
          <HugeiconsIcon icon={FilterIcon} size={18} />
        </Button>
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-muted/50 px-4 py-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10">
          <HugeiconsIcon icon={CustomerServiceIcon} size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Need help?</p>
          <p className="text-xs text-muted-foreground">
            Chat with our support team
          </p>
        </div>
        <Button size="sm" variant="outline">
          <HugeiconsIcon icon={ChatIcon} size={16} />
          Chat
        </Button>
      </div>

      <Card size="sm">
        <CardContent className="space-y-0 px-4 py-2">
          {requests.map((req, i) => {
            const status = statusConfig[req.status]
            return (
              <div key={req.id}>
                <button type="button" className="flex w-full items-start gap-3 py-3 text-left" onClick={() => navigate(`/requests/${req.id}`)}>
                  <Avatar size="sm">
                    <AvatarFallback>
                      {req.status === "resolved" ? (
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-emerald-500" />
                      ) : (
                        <HugeiconsIcon icon={AlertCircleIcon} size={14} className={req.status === "open" ? "text-destructive" : "text-amber-500"} />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium">{req.title}</p>
                      <Badge variant={status.variant} className="shrink-0">{status.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {req.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{req.category}</span>
                      <span>&middot;</span>
                      <span>{req.date}</span>
                    </div>
                  </div>
                </button>
                {i < requests.length - 1 && <Separator />}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
