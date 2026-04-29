import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { usePageTitle } from "@/hooks/use-page-title"
import { CommandMenu } from "@/components/command-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import { useTheme } from "@/components/theme-provider"
import { useNavigate } from "react-router-dom"
import { LayoutDashboard, Package, Users, Settings, Moon, Sun } from "lucide-react"
import { useEffect } from "react"

export default function Layout({ user }: { user?: any }) {
  usePageTitle()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "t" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setTheme(theme === "light" ? "dark" : "light")
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [theme, setTheme])

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <ContextMenu>
          <ContextMenuTrigger className="flex flex-1 flex-col">
            <SiteHeader />
            <main className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
              <Outlet />
            </main>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem onClick={() => navigate("/")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => navigate("/products")}>
              <Package className="mr-2 h-4 w-4" />
              <span>Products</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => navigate("/users")}>
              <Users className="mr-2 h-4 w-4" />
              <span>Users</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
              <span>Toggle Theme</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </SidebarInset>
      <CommandMenu />
    </SidebarProvider>
  )
}
