"use client"

import * as React from "react"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={`rounded-md border p-4 ${variant === "destructive" ? "border-red-500 bg-red-50 text-red-700" : "border-yellow-500 bg-yellow-50 text-yellow-700"} ${className}`}
        {...props}
      />
    )
  }
)

Alert.displayName = "Alert"

interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm ${className}`}
    {...props}
  />
))

AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }