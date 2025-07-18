"use client"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  size?: "default" | "sm" | "xs"
}

export function ThemeToggle({ size = "default" }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "hover:bg-accent rounded-full",
        size === "sm" ? "h-8 w-8" : size === "xs" ? "h-6 w-6" : "h-10 w-10",
      )}
    >
      <Sun
        className={cn(
          "rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0",
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
  )
}
