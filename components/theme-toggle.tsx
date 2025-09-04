"use client"
import { Moon, Sun, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Update the ThemeToggleProps interface to include "xs" as a size option
interface ThemeToggleProps {
  size?: "default" | "sm" | "xs"
}

// Update the ThemeToggle component to handle the "xs" size
export function ThemeToggle({ size = "default" }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "hover:bg-amber-300/50 dark:hover:bg-slate-600/50 rounded-full",
            size === "sm" ? "h-8 w-8" : size === "xs" ? "h-6 w-6" : "h-10 w-10",
          )}
        >
          <Sun
            className={cn(
              "rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-black",
              size === "xs" ? "h-3 w-3" : size === "sm" ? "h-4 w-4" : "h-5 w-5",
            )}
          />
          <Moon
            className={cn(
              "absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100",
              size === "xs" ? "h-3 w-3" : size === "sm" ? "h-4 w-4" : "h-5 w-5",
            )}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
