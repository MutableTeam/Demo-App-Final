"use client"

import { useEffect } from "react"
import { isIOS } from "@/utils/ios-dark-mode"

export default function IOSDarkModeScript() {
  useEffect(() => {
    if (!isIOS()) return

    // Create and inject a script element
    const script = document.createElement("script")
    script.innerHTML = `
      (function() {
        // Check if dark mode is enabled
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Apply iOS dark mode class
        if (isDarkMode) {
          document.documentElement.classList.add('ios-dark');
        }
        
        // Listen for theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (e.matches) {
            document.documentElement.classList.add('ios-dark');
          } else {
            document.documentElement.classList.remove('ios-dark');
          }
        });
        
        // Override the setTheme function to handle iOS dark mode
        const originalSetTheme = window.localStorage.setItem;
        window.localStorage.setItem = function(key, value) {
          originalSetTheme.call(this, key, value);
          
          // Check if this is a theme change
          if (key === 'theme') {
            if (value === 'dark') {
              document.documentElement.classList.add('ios-dark');
            } else {
              document.documentElement.classList.remove('ios-dark');
            }
          }
        };
      })();
    `

    // Add the script to the head
    document.head.appendChild(script)

    return () => {
      // Clean up
      document.head.removeChild(script)
    }
  }, [])

  return null
}
