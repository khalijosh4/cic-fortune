import { useState, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, ChevronRight, Laptop, Moon, Sun, SearchIcon } from 'lucide-react'
import { useSearch } from '@/context/search-provider'
import { useTheme } from '@/context/theme-provider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { sidebarData } from './layout/data/sidebar-data'
import { ScrollArea } from './ui/scroll-area'
import { cn } from '@/lib/utils'

interface FlatItem {
  id: string
  title: string
  url?: string
  parentTitle?: string
  group: string
}

export function CommandMenu() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const flatItems: FlatItem[] = useMemo(() => {
    const items: FlatItem[] = []
    sidebarData.navGroups.forEach((group) => {
      group.items.forEach((navItem) => {
        if (navItem.url) {
          items.push({ id: navItem.url, title: navItem.title, url: navItem.url, group: group.title })
        }
        navItem.items?.forEach((subItem) => {
          items.push({
            id: `${navItem.title}-${subItem.url}`,
            title: subItem.title,
            url: subItem.url,
            parentTitle: navItem.title,
            group: group.title,
          })
        })
      })
    })
    return items
  }, [])

  const themeItems: FlatItem[] = useMemo(() => [
    { id: 'theme-light', title: 'Light', group: 'Theme' },
    { id: 'theme-dark', title: 'Dark', group: 'Theme' },
    { id: 'theme-system', title: 'System', group: 'Theme' },
  ], [])

  const allItems = useMemo(() => [...flatItems, ...themeItems], [flatItems, themeItems])

  const filtered = useMemo(() => {
    if (!query) return allItems
    const q = query.toLowerCase()
    return allItems.filter(i => i.title.toLowerCase().includes(q))
  }, [query, allItems])

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setQuery('')
    }
  }, [setOpen])

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedIndex(0)
  }, [])

  const inputRefCallback = useCallback((el: HTMLInputElement | null) => {
    if (el && open) {
      setTimeout(() => el.focus(), 50)
    }
    ;(inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el
  }, [open])

  const listRefCallback = useCallback((el: HTMLDivElement | null) => {
    ;(listRef as React.MutableRefObject<HTMLDivElement | null>).current = el
    if (el && selectedIndex >= 0) {
      const child = el.children[selectedIndex] as HTMLElement | undefined
      child?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const runCommand = useCallback((fn: () => unknown) => {
    setOpen(false)
    setQuery('')
    fn()
  }, [setOpen])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[selectedIndex]
      if (!item) return
      if (item.id === 'theme-light') runCommand(() => setTheme('light'))
      else if (item.id === 'theme-dark') runCommand(() => setTheme('dark'))
      else if (item.id === 'theme-system') runCommand(() => setTheme('system'))
      else if (item.url) runCommand(() => navigate({ to: item.url }))
    }
  }, [filtered, selectedIndex, runCommand, navigate, setTheme])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogHeader className="sr-only">
        <DialogTitle>Command Palette</DialogTitle>
        <DialogDescription>Search for a command to run...</DialogDescription>
      </DialogHeader>
      <DialogContent className="top-[15%] translate-y-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg [&>button]:hidden" showCloseButton={false}>
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground/50" />
          <Input
            ref={inputRefCallback}
            placeholder="Type a command or search..."
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="max-h-72 overflow-y-auto p-1.5">
          <div ref={listRefCallback}>
            {filtered.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">No results found.</div>
            )}
            {filtered.map((item, i) => (
              <button
                key={item.id}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium outline-none',
                  i === selectedIndex ? 'bg-muted text-foreground' : 'text-muted-foreground'
                )}
                onClick={() => {
                  if (item.id === 'theme-light') runCommand(() => setTheme('light'))
                  else if (item.id === 'theme-dark') runCommand(() => setTheme('dark'))
                  else if (item.id === 'theme-system') runCommand(() => setTheme('system'))
                  else if (item.url) runCommand(() => navigate({ to: item.url }))
                }}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <div className="flex size-4 items-center justify-center">
                  <ArrowRight className="size-2 text-muted-foreground/60" />
                </div>
                {item.parentTitle ? (
                  <>{item.parentTitle} <ChevronRight className="size-3" /> {item.title}</>
                ) : item.id.startsWith('theme-') ? (
                  <>{item.id === 'theme-light' ? <Sun className="size-3.5" /> : item.id === 'theme-dark' ? <Moon className="size-3.5" /> : <Laptop className="size-3.5" />} {item.title}</>
                ) : (
                  item.title
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
