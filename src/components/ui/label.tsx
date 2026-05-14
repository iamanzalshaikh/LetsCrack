import * as React from "react"
import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground select-none",
        className
      )}
      {...props}
    />
  )
}

export { Label }
