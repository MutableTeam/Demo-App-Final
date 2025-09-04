"use client"

import { useEffect } from "react"

export default function IOSDarkModeScript() {
  useEffect(() => {
    const script = document.createElement("script")
    script.innerHTML = `
      (function() {
        // Force dark mode immediately
        const forceDarkMode = () => {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
          
          // Force iOS dark class if on iOS
          if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            document.documentElement.classList.add('ios-dark');
          }
        };
        
        // Execute immediately
        forceDarkMode();
        
        // Override any theme switching attempts
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
          if (key === 'theme' && value !== 'dark') {
            // Force dark theme instead
            originalSetItem.call(this, key, 'dark');
            forceDarkMode();
          } else {
            originalSetItem.call(this, key, value);
          }
        };
        
        // Prevent light mode class additions
        const originalAdd = document.documentElement.classList.add;
        document.documentElement.classList.add = function(...tokens) {
          const filteredTokens = tokens.filter(token => token !== 'light');
          if (filteredTokens.length > 0) {
            originalAdd.apply(this, filteredTokens);
          }
          // Always ensure dark is present
          if (!this.contains('dark')) {
            originalAdd.call(this, 'dark');
          }
        };
      })();
    `

    // Add the script to the head
    document.head.appendChild(script)

    return () => {
      // Clean up
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return null
}
