import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import Wallet01Icon from "@hugeicons/core-free-icons/dist/esm/Wallet01Icon"
import SendToMobileIcon from "@hugeicons/core-free-icons/dist/esm/SendToMobileIcon"
import Shield01Icon from "@hugeicons/core-free-icons/dist/esm/Shield01Icon"
import { Button } from "@/components/ui/button"
import { AuthLayout } from "@/components/layouts/auth-layout"

const features = [
  {
    icon: SendToMobileIcon,
    title: "Instant Transfers",
    description: "Send and receive money in real-time to anyone, anywhere",
  },
  {
    icon: Shield01Icon,
    title: "Secure & Safe",
    description: "Bank-grade security with end-to-end encryption",
  },
  {
    icon: Wallet01Icon,
    title: "Smart Wallet",
    description: "Manage your finances all in one place",
  },
]

export function OnboardingPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-4 pt-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-3xl bg-primary/10">
          <HugeiconsIcon
            icon={Wallet01Icon}
            size={32}
            className="text-primary"
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">eCash</h1>
        <p className="text-sm text-muted-foreground">
          Your digital wallet for fast, secure payments
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted">
              <HugeiconsIcon
                icon={feature.icon}
                size={20}
                className="text-foreground"
              />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{feature.title}</p>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          className="w-full"
          onClick={() => navigate("/login")}
        >
          Get Started
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
        </p>
      </div>
    </AuthLayout>
  )
}
