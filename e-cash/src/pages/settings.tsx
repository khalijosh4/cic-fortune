import { useNavigate } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon"
import Sun01Icon from "@hugeicons/core-free-icons/dist/esm/Sun01Icon"
import Moon01Icon from "@hugeicons/core-free-icons/dist/esm/Moon01Icon"
import MonitorDotIcon from "@hugeicons/core-free-icons/dist/esm/MonitorDotIcon"
import CheckmarkCircle01Icon from "@hugeicons/core-free-icons/dist/esm/CheckmarkCircle01Icon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

type ThemeOption = "light" | "dark" | "system"

const themes: { value: ThemeOption; label: string; icon: typeof Sun01Icon }[] = [
  { value: "light", label: "Light", icon: Sun01Icon },
  { value: "dark", label: "Dark", icon: Moon01Icon },
  { value: "system", label: "System", icon: MonitorDotIcon },
]

export function SettingsPage() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pt-28">
      <PageHeader
        left={
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
            </Button>
            <h1 className="text-base font-semibold">Settings</h1>
          </>
        }
      />

      <Card>
        <CardContent className="space-y-4 px-6 py-6">
          <div className="space-y-1">
            <p className="text-sm font-medium">Appearance</p>
            <p className="text-xs text-muted-foreground">
              Choose how the app looks
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => {
              const isActive = theme === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-3xl border px-3 py-4 text-sm font-medium transition-all",
                    isActive
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                  )}
                >
                  {isActive && (
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      size={16}
                      className="absolute right-2 top-2 text-primary"
                    />
                  )}
                  <HugeiconsIcon icon={t.icon} size={22} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
