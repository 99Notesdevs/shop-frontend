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
      <Button variant="primary" size="lg" className="w-10 h-10">
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={toggleTheme}
      className="w-10 h-10 hover:bg-transparent hover:scale-110 transition-transform duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      )}
    </Button>
  )
}
