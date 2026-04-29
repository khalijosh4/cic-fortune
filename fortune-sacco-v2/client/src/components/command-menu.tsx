import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Settings,
  LayoutDashboard,
  Package,
  Users,
  Mail,
  FileText,
  Briefcase,
  BookOpen,
  ShieldCheck,
  Moon,
  Sun,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useTheme } from "@/components/theme-provider"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/products"))}>
            <Package className="mr-2 h-4 w-4" />
            <span>Products</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/users"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Users</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => setTheme(theme === "light" ? "dark" : "light"))}>
            {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
            <span>Toggle Theme</span>
            <CommandShortcut>⌘T</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/inbox"))}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Inbox</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/blog"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Blog</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/jobs"))}>
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Jobs</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/knowledge-base"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Knowledge Base</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/legal"))}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            <span>Legal</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
