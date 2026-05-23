import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon"
import Edit01Icon from "@hugeicons/core-free-icons/dist/esm/Edit01Icon"
import Mail01Icon from "@hugeicons/core-free-icons/dist/esm/Mail01Icon"
import TelephoneIcon from "@hugeicons/core-free-icons/dist/esm/TelephoneIcon"
import Location01Icon from "@hugeicons/core-free-icons/dist/esm/Location01Icon"
import Shield01Icon from "@hugeicons/core-free-icons/dist/esm/Shield01Icon"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"

export function ProfilePage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
            </Button>
            <h1 className="text-base font-semibold">Profile</h1>
          </>
        }
        right={
          <Button variant="ghost" size="icon">
            <HugeiconsIcon icon={Edit01Icon} size={20} />
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 px-6 py-8 text-center">
          <Avatar className="size-20">
            <AvatarFallback className="text-2xl">A</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">Alex Johnson</h2>
            <p className="text-sm text-muted-foreground">Premium Member</p>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardContent className="space-y-4 px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                <HugeiconsIcon icon={Mail01Icon} size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">alex@ecash.app</p>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                <HugeiconsIcon icon={TelephoneIcon} size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">+254 712 345 678</p>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                <HugeiconsIcon icon={Location01Icon} size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">Nairobi, Kenya</p>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                <HugeiconsIcon icon={Shield01Icon} size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">January 2024</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
