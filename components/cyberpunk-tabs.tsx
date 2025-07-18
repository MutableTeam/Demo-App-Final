"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

const CyberpunkTabs = TabsPrimitive.Root

const CyberpunkTabList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-md p-1 text-muted-foreground",
        isCyberpunk ? "bg-black/50 border border-cyan-500/50" : "bg-muted",
        className,
      )}
      {...props}
    />
  )
})
CyberpunkTabList.displayName = TabsPrimitive.List.displayName

const CyberpunkTab = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isCyberpunk
          ? "data-[state=active]:bg-cyan-900/50 data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-cyan-500/50 hover:bg-cyan-900/30 hover:text-cyan-300 text-cyan-300/70"
          : "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className,
      )}
      {...props}
    />
  )
})
CyberpunkTab.displayName = TabsPrimitive.Trigger.displayName

const CyberpunkTabContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isCyberpunk && "text-cyan-300",
        className,
      )}
      {...props}
    />
  )
})
CyberpunkTabContent.displayName = TabsPrimitive.Content.displayName

export { CyberpunkTabs, CyberpunkTabList, CyberpunkTab, CyberpunkTabContent }
