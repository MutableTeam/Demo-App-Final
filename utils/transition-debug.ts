/**
 * Transition Debugger
 *
 * A utility for tracking component transitions and resource cleanup
 * to help identify and fix issues with component lifecycle management.
 */

import { debugManager } from "./debug-utils"

type ResourceType = "timeout" | "interval" | "animationFrame" | "eventListener"

interface Resource {
  id: string
  type: ResourceType
  component: string
  createdAt: number
  description?: string
}

class TransitionDebugger {
  private resources: Map<string, Resource> = new Map()
  private transitions: Array<{
    from: string
    to: string
    component: string
    timestamp: number
    metadata?: any
  }> = []

  // Track a transition between states
  trackTransition(from: string, to: string, component: string, metadata?: any) {
    const transition = {
      from,
      to,
      component,
      timestamp: Date.now(),
      metadata,
    }

    this.transitions.push(transition)
    debugManager.logInfo("TRANSITION", `${component}: ${from} → ${to}`, metadata)

    return transition
  }

  // Track resource cleanup
  trackCleanup(component: string, description: string, success: boolean, error?: any) {
    if (success) {
      debugManager.logInfo("CLEANUP", `${component}: ${description} cleaned up successfully`)
    } else {
      debugManager.logError("CLEANUP", `${component}: Failed to clean up ${description}`, error)
    }
  }

  // Register a resource
  private registerResource(id: string, type: ResourceType, component: string, description?: string): Resource {
    const resource: Resource = {
      id,
      type,
      component,
      createdAt: Date.now(),
      description,
    }

    this.resources.set(id, resource)
    debugManager.logDebug("RESOURCE", `Registered ${type}: ${id}`, { component, description })

    return resource
  }

  // Remove a resource
  private removeResource(id: string) {
    const resource = this.resources.get(id)
    if (resource) {
      this.resources.delete(id)
      debugManager.logDebug("RESOURCE", `Removed ${resource.type}: ${id}`, {
        component: resource.component,
        description: resource.description,
      })
    }
  }

  // Get all active resources
  getActiveResources(): Resource[] {
    return Array.from(this.resources.values())
  }

  // Get recent transitions
  getRecentTransitions(limit = 10): any[] {
    return this.transitions.slice(-limit)
  }

  // Safe setTimeout that tracks the resource
  safeSetTimeout(callback: Function, delay: number, id: string): NodeJS.Timeout {
    this.registerResource(id, "timeout", id.split("-")[0], `Timeout: ${delay}ms`)

    // Create a Map to store timeout IDs if it doesn't exist
    if (!(window as any).__timeoutDebugMap) {
      ;(window as any).__timeoutDebugMap = new Map()
    }

    const timeoutId = setTimeout(() => {
      try {
        callback()
      } catch (error) {
        debugManager.logError("TIMEOUT", `Error in timeout callback: ${id}`, error)
      } finally {
        this.removeResource(id)
        // Remove from the map when done
        const timeoutDebugMap = (window as any).__timeoutDebugMap
        if (timeoutDebugMap) {
          timeoutDebugMap.delete(timeoutId)
        }
      }
    }, delay)

    // Store the mapping between timeout ID and debug ID
    const timeoutDebugMap = (window as any).__timeoutDebugMap
    if (timeoutDebugMap) {
      timeoutDebugMap.set(timeoutId, id)
    }

    return timeoutId
  }

  // Safe clearTimeout that tracks the resource cleanup
  safeClearTimeout(id: string): void {
    const resources = Array.from(this.resources.values())
    const resource = resources.find((r) => r.id === id && r.type === "timeout")

    if (resource) {
      // Find all timeouts using our debug map
      const timeoutMap = (window as any).__timeoutDebugMap || new Map()

      // Find all timeout IDs associated with this debug ID
      const timeoutIds: number[] = []
      timeoutMap.forEach((debugId: string, timeoutId: number) => {
        if (debugId === id) {
          timeoutIds.push(timeoutId)
        }
      })

      // Clear all matching timeouts
      timeoutIds.forEach((timeoutId) => {
        clearTimeout(timeoutId)
        timeoutMap.delete(timeoutId)
      })

      this.removeResource(id)
    }
  }

  // Safe setInterval that tracks the resource
  safeSetInterval(callback: Function, delay: number, id: string): NodeJS.Timeout {
    this.registerResource(id, "interval", id.split("-")[0], `Interval: ${delay}ms`)

    // Create a Map to store interval IDs if it doesn't exist
    if (!(window as any).__intervalDebugMap) {
      ;(window as any).__intervalDebugMap = new Map()
    }

    const intervalId = setInterval(() => {
      try {
        callback()
      } catch (error) {
        debugManager.logError("INTERVAL", `Error in interval callback: ${id}`, error)
      } finally {
        // No need to remove resource here, it's handled by clearInterval
      }
    }, delay)

    // Store the mapping between interval ID and debug ID
    const intervalDebugMap = (window as any).__intervalDebugMap
    intervalDebugMap.set(intervalId, id)

    return intervalId
  }

  // Safe clearInterval that tracks the resource cleanup
  safeClearInterval(id: string): void {
    const resources = Array.from(this.resources.values())
    const resource = resources.find((r) => r.id === id && r.type === "interval")

    if (resource) {
      // Find all intervals using our debug map
      const intervalMap = (window as any).__intervalDebugMap || new Map()

      // Find all interval IDs associated with this debug ID
      const intervalIds: number[] = []
      intervalMap.forEach((debugId: string, intervalId: number) => {
        if (debugId === id) {
          intervalIds.push(intervalId)
        }
      })

      // Clear all matching intervals
      intervalIds.forEach((intervalId) => {
        clearInterval(intervalId)
        intervalMap.delete(intervalId)
      })

      this.removeResource(id)
    }
  }

  // Safe requestAnimationFrame that tracks the resource
  safeRequestAnimationFrame(callback: FrameRequestCallback, id: string): number {
    this.registerResource(id, "animationFrame", id.split("-")[0], "Animation Frame")

    const rafId = requestAnimationFrame((timestamp) => {
      try {
        callback(timestamp)
      } catch (error) {
        debugManager.logError("RAF", `Error in animation frame callback: ${id}`, error)
      } finally {
        this.removeResource(id)
      }
    })

    // Store our debug ID with the RAF ID
    ;(window as any).__rafDebugMap = (window as any).__rafDebugMap || {}
    ;(window as any).__rafDebugMap[rafId] = id

    return rafId
  }

  // Safe cancelAnimationFrame that tracks the resource cleanup
  safeCancelAnimationFrame(id: string): void {
    const resources = Array.from(this.resources.values())
    const resource = resources.find((r) => r.id === id && r.type === "animationFrame")

    if (resource) {
      // Find the RAF ID from our debug map
      const rafMap = (window as any).__rafDebugMap || {}
      const rafId = Object.keys(rafMap).find((key) => rafMap[key] === id)

      if (rafId) {
        cancelAnimationFrame(Number(rafId))
        delete rafMap[rafId]
      }

      this.removeResource(id)
    }
  }

  // Safe addEventListener that tracks the resource
  safeAddEventListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions,
    id?: string,
  ): void {
    const resourceId = id || `event-${type}-${Date.now()}`
    this.registerResource(resourceId, "eventListener", resourceId.split("-")[0], `Event: ${type}`)

    // Create a wrapper that handles errors
    const wrappedListener = function (this: any, event: Event) {
      try {
        if (typeof listener === "function") {
          listener.call(this, event)
        } else {
          listener.handleEvent(event)
        }
      } catch (error) {
        debugManager.logError("EVENT", `Error in event listener: ${type}`, error)
      }
    }

    // Store the original listener with our wrapped one
    ;(wrappedListener as any).__originalListener = listener
    ;(wrappedListener as any).__debugId = resourceId

    // Add the event listener
    target.addEventListener(type, wrappedListener, options)

    // Store in the target for cleanup
    ;(target as any).__debugEventListeners = (target as any).__debugEventListeners || {}
    ;(target as any).__debugEventListeners[resourceId] = {
      type,
      wrappedListener,
      options,
    }
  }

  // Safe removeEventListener that tracks the resource cleanup
  safeRemoveEventListener(id: string): void {
    const resources = Array.from(this.resources.values())
    const resource = resources.find((r) => r.id === id && r.type === "eventListener")

    if (resource) {
      // Find all potential targets with this listener
      const potentialTargets = [window, document, document.body]

      for (const target of potentialTargets) {
        const listeners = (target as any).__debugEventListeners || {}
        const listenerInfo = listeners[id]

        if (listenerInfo) {
          const { type, wrappedListener, options } = listenerInfo
          target.removeEventListener(type, wrappedListener, options)
          delete listeners[id]
          break
        }
      }

      this.removeResource(id)
    }
  }

  // Clean up all resources for a component
  cleanupAll(componentPrefix: string): void {
    const resources = Array.from(this.resources.values())
    const componentResources = resources.filter(
      (r) => r.id.startsWith(componentPrefix) || r.component === componentPrefix,
    )

    debugManager.logInfo("CLEANUP", `Cleaning up all resources for ${componentPrefix}`, {
      count: componentResources.length,
    })

    for (const resource of componentResources) {
      switch (resource.type) {
        case "timeout":
          this.safeClearTimeout(resource.id)
          break
        case "interval":
          this.safeClearInterval(resource.id)
          break
        case "animationFrame":
          this.safeCancelAnimationFrame(resource.id)
          break
        case "eventListener":
          this.safeRemoveEventListener(resource.id)
          break
      }
    }
  }
}

// Create a singleton instance
const transitionDebugger = new TransitionDebugger()
export default transitionDebugger
