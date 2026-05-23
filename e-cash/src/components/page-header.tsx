import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useScroll } from "@/hooks/use-scroll"

export function PageHeader({
  left,
  right,
}: {
  left: ReactNode
  right?: ReactNode
}) {
  const scrolled = useScroll()

  return (
    <div
      className={cn(
        "fixed border border-muted top-8 left-1/2 z-40 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 flex items-center justify-between rounded-full text-xs font-medium px-4 py-3 transition-all duration-300",
        scrolled && "border border-muted bg-background/80 shadow-xs backdrop-blur-xl",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-4 transition-all duration-300",
          scrolled &&
            "rounded-full bg-muted/80 pl-1.5 pr-4 py-1.5 shadow-xs backdrop-blur-xl",
        )}
      >
        {left}
      </div>
      {right && (
        <div
          className={cn(
            "flex items-center transition-all duration-300",
            scrolled &&
              "rounded-full bg-muted/80 px-1 py-1 shadow-xs backdrop-blur-xl",
          )}
        >
          {right}
        </div>
      )}
    </div>
  )
}
