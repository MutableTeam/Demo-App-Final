import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import { ArrowDownUp } from "lucide-react"

interface CyberpunkTokenSwapProps {
  className?: string
}

export function CyberpunkTokenSwap({ className }: CyberpunkTokenSwapProps) {
  const { isCyberpunkMode, styleMode } = useCyberpunkTheme()

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        isCyberpunkMode &&
          styleMode === "cyberpunk" &&
          "border-[#00f0ff] border-opacity-50 bg-black bg-opacity-80 relative",
        className,
      )}
    >
      {isCyberpunkMode && styleMode === "cyberpunk" && (
        <>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent opacity-70"></div>
          <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-transparent via-[#00f0ff] to-transparent opacity-70"></div>
          <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-transparent via-[#ff00ff] to-transparent opacity-70"></div>

          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00f0ff] opacity-70"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00f0ff] opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ff00ff] opacity-70"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#ff00ff] opacity-70"></div>
        </>
      )}

      <CardHeader className={cn("pb-2", isCyberpunkMode && styleMode === "cyberpunk" && "text-[#00f0ff]")}>
        <CardTitle
          className={cn("text-xl", isCyberpunkMode && styleMode === "cyberpunk" && "text-[#00f0ff] font-bold")}
        >
          Swap Tokens
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div
            className={cn(
              "p-4 rounded-lg",
              isCyberpunkMode && styleMode === "cyberpunk"
                ? "bg-gray-900 border border-[#00f0ff] border-opacity-30"
                : "bg-gray-100 dark:bg-gray-800",
            )}
          >
            <div className="flex justify-between items-center mb-2">
              <span
                className={cn("text-sm font-medium", isCyberpunkMode && styleMode === "cyberpunk" && "text-gray-300")}
              >
                From
              </span>
              <span className={cn("text-sm", isCyberpunkMode && styleMode === "cyberpunk" && "text-gray-400")}>
                Balance: 0.00
              </span>
            </div>
            <div className="flex justify-between items-center">
              <input
                type="number"
                placeholder="0.0"
                className={cn(
                  "bg-transparent text-2xl font-bold outline-none w-2/3",
                  isCyberpunkMode && styleMode === "cyberpunk" ? "text-white" : "text-black dark:text-white",
                )}
              />
              <button
                className={cn(
                  "px-3 py-2 rounded-lg flex items-center space-x-2",
                  isCyberpunkMode && styleMode === "cyberpunk"
                    ? "bg-gray-800 hover:bg-gray-700 text-[#00f0ff] border border-[#00f0ff] border-opacity-30"
                    : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600",
                )}
              >
                <img src="/solana-logo.png" alt="SOL" className="w-5 h-5" />
                <span>SOL</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className={cn(
                "p-2 rounded-full",
                isCyberpunkMode && styleMode === "cyberpunk"
                  ? "bg-gray-800 text-[#00f0ff] border border-[#00f0ff] border-opacity-30 hover:bg-gray-700"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600",
              )}
            >
              <ArrowDownUp size={20} />
            </button>
          </div>

          <div
            className={cn(
              "p-4 rounded-lg",
              isCyberpunkMode && styleMode === "cyberpunk"
                ? "bg-gray-900 border border-[#ff00ff] border-opacity-30"
                : "bg-gray-100 dark:bg-gray-800",
            )}
          >
            <div className="flex justify-between items-center mb-2">
              <span
                className={cn("text-sm font-medium", isCyberpunkMode && styleMode === "cyberpunk" && "text-gray-300")}
              >
                To
              </span>
              <span className={cn("text-sm", isCyberpunkMode && styleMode === "cyberpunk" && "text-gray-400")}>
                Balance: 0.00
              </span>
            </div>
            <div className="flex justify-between items-center">
              <input
                type="number"
                placeholder="0.0"
                className={cn(
                  "bg-transparent text-2xl font-bold outline-none w-2/3",
                  isCyberpunkMode && styleMode === "cyberpunk" ? "text-white" : "text-black dark:text-white",
                )}
              />
              <button
                className={cn(
                  "px-3 py-2 rounded-lg flex items-center space-x-2",
                  isCyberpunkMode && styleMode === "cyberpunk"
                    ? "bg-gray-800 hover:bg-gray-700 text-[#ff00ff] border border-[#ff00ff] border-opacity-30"
                    : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600",
                )}
              >
                <img src="/images/mutable-token.png" alt="MUTB" className="w-5 h-5" />
                <span>MUTB</span>
              </button>
            </div>
          </div>

          <div
            className={cn(
              "p-3 rounded-lg text-sm",
              isCyberpunkMode && styleMode === "cyberpunk"
                ? "bg-gray-900 border border-gray-700 text-gray-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
            )}
          >
            <div className="flex justify-between">
              <span>Rate</span>
              <span>1 SOL = 1000 MUTB</span>
            </div>
            <div className="flex justify-between">
              <span>Fee</span>
              <span>0.3%</span>
            </div>
            <div className="flex justify-between">
              <span>Slippage Tolerance</span>
              <span>0.5%</span>
            </div>
          </div>

          <Button
            className={cn(
              "w-full",
              isCyberpunkMode &&
                styleMode === "cyberpunk" &&
                "bg-gradient-to-r from-[#9333ea] to-[#3b82f6] hover:from-[#a855f7] hover:to-[#60a5fa] text-white",
            )}
          >
            Swap
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
