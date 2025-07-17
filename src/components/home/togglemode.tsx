"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "../ui/themeprovider"
import { Button } from "../ui/button"

export function ToggleMode() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="w-10 h-10 p-2 border-gray-200 dark:border-gray-700">
        <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="w-10 h-10 p-2 rounded-full border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-400 hover:text-yellow-500 transition-colors" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
