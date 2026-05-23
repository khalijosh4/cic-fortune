import { useParams, useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon"
import AlertCircleIcon from "@hugeicons/core-free-icons/dist/esm/AlertCircleIcon"
import CheckmarkCircle01Icon from "@hugeicons/core-free-icons/dist/esm/CheckmarkCircle01Icon"
import ChatIcon from "@hugeicons/core-free-icons/dist/esm/ChatIcon"
import UserIcon from "@hugeicons/core-free-icons/dist/esm/UserIcon"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  lastUpdated: string
  priority: "low" | "medium" | "high"
  messages: { from: string; text: string; time: string }[]
}

const requests: CustomerRequest[] = [
  {
    id: 1,
    title: "Dispute Transaction",
    description: "I don't recognize a charge of $49.99 on May 10th",
    status: "open",
    date: "Today",
    category: "Disputes",
    lastUpdated: "2 hours ago",
    priority: "high",
    messages: [
      { from: "You", text: "I don't recognize a charge of $49.99 on May 10th", time: "Today, 10:30 AM" },
    ],
  },
  {
    id: 2,
    title: "Loan Application Status",
    description: "Applied for personal loan 5 days ago, still pending",
    status: "in-progress",
    date: "Yesterday",
    category: "Loans",
    lastUpdated: "1 day ago",
    priority: "medium",
    messages: [
      { from: "You", text: "Applied for personal loan 5 days ago, still pending", time: "Yesterday, 2:15 PM" },
      { from: "Support", text: "We're reviewing your application. We'll update you within 48 hours.", time: "Yesterday, 4:30 PM" },
    ],
  },
  {
    id: 3,
    title: "Update Contact Number",
    description: "Need to update my phone number on the account",
    status: "resolved",
    date: "3 days ago",
    category: "Account",
    lastUpdated: "2 days ago",
    priority: "low",
    messages: [
      { from: "You", text: "Need to update my phone number on the account", time: "3 days ago, 9:00 AM" },
      { from: "Support", text: "Please provide your new phone number and we'll update it.", time: "3 days ago, 11:20 AM" },
      { from: "You", text: "My new number is +254 712 345 678", time: "3 days ago, 12:00 PM" },
      { from: "Support", text: "Your number has been updated successfully.", time: "2 days ago, 8:15 AM" },
    ],
  },
  {
    id: 4,
    title: "Card Replacement Request",
    description: "Lost my physical card, need a replacement",
    status: "in-progress",
    date: "5 days ago",
    category: "Cards",
    lastUpdated: "4 days ago",
    priority: "high",
    messages: [
      { from: "You", text: "Lost my physical card, need a replacement", time: "5 days ago, 6:45 PM" },
      { from: "Support", text: "Your card has been blocked. A replacement will be delivered in 5-7 business days.", time: "4 days ago, 9:30 AM" },
    ],
  },
  {
    id: 5,
    title: "Fee Waiver Request",
    description: "Requesting waiver of the monthly maintenance fee",
    status: "resolved",
    date: "1 week ago",
    category: "Billing",
    lastUpdated: "6 days ago",
    priority: "medium",
    messages: [
      { from: "You", text: "Requesting waiver of the monthly maintenance fee", time: "1 week ago, 3:00 PM" },
      { from: "Support", text: "We've waived the fee for the next 3 months as a goodwill gesture.", time: "6 days ago, 10:45 AM" },
    ],
  },
]

const statusConfig: Record<RequestStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  "open": { label: "Open", variant: "default" },
  "in-progress": { label: "In Progress", variant: "secondary" },
  "resolved": { label: "Resolved", variant: "outline" },
}

const priorityConfig = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  high: "bg-destructive/10 text-destructive",
}

export function RequestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const req = requests.find((r) => r.id === Number(id))

  if (!req) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-medium">Request not found</p>
        <Button variant="outline" onClick={() => navigate("/requests")}>Back to Requests</Button>
      </div>
    )
  }

  const status = statusConfig[req.status]

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate("/requests")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
            </Button>
            <h1 className="text-base font-semibold">Request #{req.id}</h1>
          </>
        }
      />

      <Card size="sm">
        <CardContent className="space-y-4 px-5 py-5">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-base font-semibold">{req.title}</h2>
              <p className="text-xs text-muted-foreground">{req.description}</p>
            </div>
            <Badge variant={status.variant} className="shrink-0">{status.label}</Badge>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Category</span>
              <p className="font-medium">{req.category}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Priority</span>
              <span className={`ml-1 rounded-full px-2 py-0.5 font-medium ${priorityConfig[req.priority]}`}>
                {req.priority}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Created</span>
              <p className="font-medium">{req.date}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Updated</span>
              <p className="font-medium">{req.lastUpdated}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {req.status !== "resolved" && (
        <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 px-4 py-3">
          <HugeiconsIcon icon={AlertCircleIcon} size={18} className="shrink-0 text-amber-500" />
          <span className="text-xs text-amber-600 dark:text-amber-400">
            {req.status === "open" ? "Waiting for support to respond." : "Support is working on this request."}
          </span>
        </div>
      )}

      {req.status === "resolved" && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-3">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} className="shrink-0 text-emerald-500" />
          <span className="text-xs text-emerald-600 dark:text-emerald-400">
            This request has been resolved.
          </span>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Conversation</h2>
        <div className="space-y-3">
          {req.messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.from === "You" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  msg.from === "You" ? "bg-primary/10" : "bg-muted"
                }`}
              >
                <HugeiconsIcon icon={msg.from === "You" ? UserIcon : ChatIcon} size={14} className={msg.from === "You" ? "text-primary" : "text-muted-foreground"} />
              </div>
              <div className={`max-w-[80%] space-y-1 ${msg.from === "You" ? "items-end" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    msg.from === "You"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-xs">{msg.text}</p>
                </div>
                <p className="px-1 text-[10px] text-muted-foreground">{msg.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Input placeholder="Type a message..." className="flex-1" />
        <Button>Send</Button>
      </div>
    </div>
  )
}

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={`h-9 w-full min-w-0 rounded-3xl border border-border bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 placeholder:text-muted-foreground ${className}`}
      {...props}
    />
  )
}
