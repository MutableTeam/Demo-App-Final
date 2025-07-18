"use client"

import type React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"

// Add glitch animation keyframes
const glitchAnim1 = `
  @keyframes glitchAnim1 {
    0%, 100% { 
      transform: translate(0); 
      text-shadow: -1px 0 #0ff, 1px 0 #f0f;
    }
    25% { 
      transform: translate(-1px, 1px); 
      text-shadow: 1px 0 #0ff, -1px 0 #f0f;
    }
    50% { 
      transform: translate(1px, -1px); 
      text-shadow: 1px 0 #0ff, -1px 0 #f0f;
    }
    75% { 
      transform: translate(-1px, -1px); 
      text-shadow: -1px 0 #0ff, 1px 0 #f0f;
    }
  }
`

const glitchAnim2 = `
  @keyframes glitchAnim2 {
    0%, 100% { 
      transform: translate(0); 
      filter: hue-rotate(0deg);
    }
    33% { 
      transform: translate(-2px, 0); 
      filter: hue-rotate(45deg);
    }
    66% { 
      transform: translate(2px, 0); 
      filter: hue-rotate(-45deg);
    }
  }
`

interface CyberpunkTabsProps {
  tabs: {
    value: string
    label: string
    content: React.ReactNode
  }[]
  defaultValue?: string
  className?: string
}

export function CyberpunkTabs({ tabs, defaultValue, className }: CyberpunkTabsProps) {
  const { isCyberpunkMode, styleMode } = useCyberpunkTheme()
  const defaultTab = defaultValue || tabs[0]?.value

  return (
    <Tabs defaultValue={defaultTab} className={className}>
      <style jsx global>{`
      ${
        isCyberpunkMode && styleMode === "cyberpunk"
          ? `
        @keyframes glitchAnim1 {
          0%, 100% { 
            transform: translate(0); 
            text-shadow: -1px 0 #0ff, 1px 0 #f0f;
          }
          25% { 
            transform: translate(-1px, 1px); 
            text-shadow: 1px 0 #0ff, -1px 0 #f0f;
          }
          50% { 
            transform: translate(1px, -1px); 
            text-shadow: 1px 0 #0ff, -1px 0 #f0f;
          }
          75% { 
            transform: translate(-1px, -1px); 
            text-shadow: -1px 0 #0ff, 1px 0 #f0f;
          }
        }
        
        @keyframes glitchAnim2 {
          0%, 100% { 
            transform: translate(0); 
            filter: hue-rotate(0deg);
          }
          33% { 
            transform: translate(-2px, 0); 
            filter: hue-rotate(45deg);
          }
          66% { 
            transform: translate(2px, 0); 
            filter: hue-rotate(-45deg);
          }
        }
        
        [data-state="active"] {
          animation: glitchAnim1 2s infinite;
          position: relative;
        }
        
        [data-state="active"]::before {
          content: attr(data-content);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          animation: glitchAnim2 3s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          transform: translate(-2px, 0);
        }
      `
          : ""
      }
    `}</style>

      <TabsList
        className={cn(
          "w-full",
          isCyberpunkMode &&
            styleMode === "cyberpunk" &&
            "bg-black bg-opacity-80 border border-[#00f0ff] border-opacity-30 relative overflow-hidden",
        )}
      >
        {isCyberpunkMode && styleMode === "cyberpunk" && (
          <>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent opacity-50"></div>
          </>
        )}

        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "flex-1 relative",
              isCyberpunkMode &&
                styleMode === "cyberpunk" &&
                "text-gray-400 data-[state=active]:text-[#00f0ff] data-[state=active]:shadow-none data-[state=active]:bg-gray-900 data-[state=active]:bg-opacity-50",
              isCyberpunkMode && styleMode === "cyberpunk" && "data-[state=active]:animate-[glitchAnim1_2s_infinite]",
            )}
            style={
              isCyberpunkMode && styleMode === "cyberpunk"
                ? ({
                    ...(glitchAnim1 && { "--glitch-anim-1": glitchAnim1 }),
                    ...(glitchAnim2 && { "--glitch-anim-2": glitchAnim2 }),
                  } as React.CSSProperties)
                : {}
            }
          >
            {tab.label}
            {isCyberpunkMode && styleMode === "cyberpunk" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00f0ff] opacity-0 data-[state=active]:opacity-70 transition-opacity"></div>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
