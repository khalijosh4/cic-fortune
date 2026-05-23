import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import Wallet01Icon from "@hugeicons/core-free-icons/dist/esm/Wallet01Icon"
import Mail01Icon from "@hugeicons/core-free-icons/dist/esm/Mail01Icon"
import LockIcon from "@hugeicons/core-free-icons/dist/esm/LockIcon"
import EyeIcon from "@hugeicons/core-free-icons/dist/esm/EyeIcon"
import ViewOffIcon from "@hugeicons/core-free-icons/dist/esm/ViewOffIcon"
import AlertCircleIcon from "@hugeicons/core-free-icons/dist/esm/AlertCircleIcon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/layouts/auth-layout"

const TEST_CREDENTIALS = { email: "test@ecash.app", password: "test123" }

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (email !== TEST_CREDENTIALS.email || password !== TEST_CREDENTIALS.password) {
      setError("Invalid email or password")
      return
    }
    sessionStorage.setItem("justLoggedIn", "true")
    navigate("/home")
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-3 pt-8">
        <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10">
          <HugeiconsIcon
            icon={Wallet01Icon}
            size={28}
            className="text-primary"
          />
        </div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <HugeiconsIcon
              icon={Mail01Icon}
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <HugeiconsIcon
              icon={LockIcon}
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="pl-9 pr-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffIcon : EyeIcon}
                size={16}
              />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 px-3 py-2">
            <HugeiconsIcon icon={AlertCircleIcon} size={16} className="shrink-0 text-destructive" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Sign In
        </Button>
      </form>

      <div className="space-y-3">
        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => navigate("/")}
          >
            Sign up
          </button>
        </p>
        <div className="rounded-2xl bg-muted px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">
            Test: <span className="font-mono font-medium">test@ecash.app</span> /{" "}
            <span className="font-mono font-medium">test123</span>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
