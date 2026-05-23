import { Outlet, NavLink } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import Home01Icon from "@hugeicons/core-free-icons/dist/esm/Home01Icon"
import CardExchange01Icon from "@hugeicons/core-free-icons/dist/esm/CardExchange01Icon"
import BankIcon from "@hugeicons/core-free-icons/dist/esm/BankIcon"
import CustomerServiceIcon from "@hugeicons/core-free-icons/dist/esm/CustomerServiceIcon"
import { cn } from "@/lib/utils"
 
const navItems = [
  { to: "/home", label: "Home", icon: Home01Icon },
  { to: "/transfer", label: "Transfer", icon: CardExchange01Icon },
  { to: "/loans", label: "Loans", icon: BankIcon },
  { to: "/requests", label: "Support", icon: CustomerServiceIcon },
]

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1 pt-5 pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5">
        <div className="mx-auto flex h-16 max-w-sm items-center justify-between rounded-full bg-background/90 px-4 shadow-lg ring-1 ring-border backdrop-blur-xl">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <HugeiconsIcon
                    icon={item.icon}
                    size={26}
                    className={cn(isActive && "text-primary")}
                  />
                  <span className="text-xs">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
