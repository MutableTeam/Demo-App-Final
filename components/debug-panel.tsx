"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bug, X, Download, Trash2, ToggleLeft, ToggleRight, ChevronUp, ChevronDown } from "lucide-react"
import logger from "@/utils/logger"

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Update logs every second when panel is open
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      try {
        setLogs(logger.getLogs())

        // Check debug mode
        const debugMode = localStorage.getItem("mutable_debug_mode") === "true"
        setIsDebugMode(debugMode)
      } catch (e) {
        console.error("Error updating logs:", e)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen])

  const toggleDebugMode = useCallback(() => {
    try {
      if (isDebugMode) {
        logger.disableDebugMode()
        setIsDebugMode(false)
      } else {
        logger.enableDebugMode()
        setIsDebugMode(true)
      }
    } catch (e) {
      console.error("Error toggling debug mode:", e)
    }
  }, [isDebugMode])

  const clearLogs = useCallback(() => {
    try {
      logger.clearLogs()
      setLogs([])
    } catch (e) {
      console.error("Error clearing logs:", e)
    }
  }, [])

  const downloadLogs = useCallback(() => {
    try {
      const logData = logger.exportLogs()
      const blob = new Blob([logData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `mutable-logs-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("Error downloading logs:", e)
    }
  }, [])

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-white shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <Bug className="h-4 w-4 mr-1" />
        Debug
      </Button>
    )
  }

  const errorCount = logs.filter((log) => log.level === "error").length

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            <CardTitle className="text-lg">Debug Panel</CardTitle>
            {errorCount > 0 && <Badge variant="destructive">{errorCount} errors</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 ${isDebugMode ? "bg-green-50" : ""}`}
              onClick={toggleDebugMode}
            >
              {isDebugMode ? (
                <>
                  <ToggleRight className="h-4 w-4" />
                  Debug Mode On
                </>
              ) : (
                <>
                  <ToggleLeft className="h-4 w-4" />
                  Debug Mode Off
                </>
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList>
              <TabsTrigger value="all">All Logs</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
              <TabsTrigger value="warnings">Warnings</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="debug">Debug</TabsTrigger>
            </TabsList>

            <div className="flex justify-end gap-2 my-2">
              <Button variant="outline" size="sm" onClick={clearLogs}>
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={downloadLogs}>
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>

            <TabsContent value="all" className="flex-grow overflow-hidden">
              <LogList logs={logs} />
            </TabsContent>
            <TabsContent value="errors" className="flex-grow overflow-hidden">
              <LogList logs={logs.filter((log) => log.level === "error")} />
            </TabsContent>
            <TabsContent value="warnings" className="flex-grow overflow-hidden">
              <LogList logs={logs.filter((log) => log.level === "warn")} />
            </TabsContent>
            <TabsContent value="info" className="flex-grow overflow-hidden">
              <LogList logs={logs.filter((log) => log.level === "info")} />
            </TabsContent>
            <TabsContent value="debug" className="flex-grow overflow-hidden">
              <LogList logs={logs.filter((log) => log.level === "debug")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function LogList({ logs }: { logs: any[] }) {
  if (logs.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-400">No logs to display</div>
  }

  return (
    <ScrollArea className="h-[50vh]">
      <div className="space-y-1">
        {logs.map((log, index) => (
          <LogEntry key={index} log={log} />
        ))}
      </div>
    </ScrollArea>
  )
}

function LogEntry({ log }: { log: any }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getBgColor = () => {
    switch (log.level) {
      case "error":
        return "bg-red-50"
      case "warn":
        return "bg-yellow-50"
      case "info":
        return "bg-blue-50"
      case "debug":
        return "bg-gray-50"
      default:
        return "bg-white"
    }
  }

  const getTextColor = () => {
    switch (log.level) {
      case "error":
        return "text-red-700"
      case "warn":
        return "text-yellow-700"
      case "info":
        return "text-blue-700"
      case "debug":
        return "text-gray-700"
      default:
        return "text-gray-900"
    }
  }

  const getBadgeColor = () => {
    switch (log.level) {
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      case "warn":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "debug":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const hasDetails = log.options?.details || log.options?.stack

  return (
    <div
      className={`p-2 rounded text-sm ${getBgColor()} ${getTextColor()} cursor-pointer`}
      onClick={() => hasDetails && setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={getBadgeColor()}>
          {log.level.toUpperCase()}
        </Badge>
        <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
        {log.options?.component && (
          <Badge variant="outline" className="bg-white">
            {log.options.component}
          </Badge>
        )}
        <span className="flex-grow">{log.message}</span>
        {hasDetails && (
          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-2 pl-4 space-y-2">
          {log.options?.details && (
            <div>
              <div className="text-xs font-semibold mb-1">Details:</div>
              <pre className="text-xs bg-white/50 p-2 rounded overflow-x-auto">
                {typeof log.options.details === "object"
                  ? JSON.stringify(log.options.details, null, 2)
                  : String(log.options.details)}
              </pre>
            </div>
          )}

          {log.options?.stack && (
            <div>
              <div className="text-xs font-semibold mb-1">Stack:</div>
              <pre className="text-xs bg-white/50 p-2 rounded overflow-x-auto">{log.options.stack}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
