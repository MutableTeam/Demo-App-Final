import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

interface CyberpunkAlertProps {
  title?: string
  description: string
  variant?: "default" | "info" | "success" | "warning" | "error"
  className?: string
}

export function CyberpunkAlert({ title, description, variant = "default", className }: CyberpunkAlertProps) {
  const { isCyberpunkMode, styleMode } = useCyberpunkTheme()

  const getIcon = () => {
    switch (variant) {
      case "info":
        return <Info className="h-5 w-5" />
      case "success":
        return <CheckCircle className="h-5 w-5" />
      case "warning":
      case "error":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getCyberpunkStyles = () => {
    if (!isCyberpunkMode || styleMode !== "cyberpunk") return ""

    switch (variant) {
      case "info":
        return "bg-[#00f0ff] bg-opacity-10 border-[#00f0ff] border-opacity-30 text-[#00f0ff]"
      case "success":
        return "bg-green-500 bg-opacity-10 border-green-500 border-opacity-30 text-green-400"
      case "warning":
        return "bg-yellow-500 bg-opacity-10 border-yellow-500 border-opacity-30 text-yellow-400"
      case "error":
        return "bg-[#ff00ff] bg-opacity-10 border-[#ff00ff] border-opacity-30 text-[#ff00ff]"
      default:
        return "bg-gray-800 border-gray-700 text-gray-300"
    }
  }

  return (
    <Alert
      className={cn(
        "relative",
        getCyberpunkStyles(),
        isCyberpunkMode && styleMode === "cyberpunk" && "border border-opacity-30",
        className,
      )}
    >
      {isCyberpunkMode && styleMode === "cyberpunk" && (
        <>
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-current opacity-70"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-current opacity-70"></div>
        </>
      )}

      <div className={cn("flex items-start gap-3", isCyberpunkMode && styleMode === "cyberpunk" && "text-current")}>
        {getIcon()}
        <div>
          {title && (
            <AlertTitle
              className={cn("font-medium mb-1", isCyberpunkMode && styleMode === "cyberpunk" && "text-current")}
            >
              {title}
            </AlertTitle>
          )}
          <AlertDescription
            className={cn(
              isCyberpunkMode && styleMode === "cyberpunk" ? "text-current opacity-80" : "text-muted-foreground",
            )}
          >
            {description}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
