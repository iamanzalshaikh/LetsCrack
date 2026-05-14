import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    color?: string
  }
>

const ChartConfigContext = React.createContext<ChartConfig>({})

type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}

/**
 * shadcn-style chart wrapper: theme-friendly container + ResponsiveContainer
 */
function ChartContainer({ className, config, children, ...props }: ChartContainerProps) {
  return (
    <ChartConfigContext.Provider value={config}>
      <div
        className={cn(
          "flex w-full flex-col text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line]:stroke-border/50",
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%" minHeight={220}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartConfigContext.Provider>
  )
}

type TooltipPayload = {
  dataKey?: string
  name?: string
  value?: number
  color?: string
  payload?: Record<string, unknown>
}

type ChartTooltipContentProps = {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
  className?: string
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ active, payload, label, className }, ref) => {
    if (!active || !payload?.length) return null
    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-36 gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-2 text-xs shadow-md",
          className
        )}
      >
        {label != null && label !== "" && (
          <div className="font-medium text-muted-foreground">{String(label)}</div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item, i) => {
            const k = (item.dataKey as string) || item.name || `k-${i}`
            const v = item.value
            if (v === undefined) return null
            const displayName =
              (item.name as string) ||
              k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase().trim())
            return (
              <div key={k} className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{displayName}</span>
                </div>
                <span className="font-mono font-bold tabular-nums text-foreground">{v}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartTooltip = RechartsPrimitive.Tooltip

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfigContext }
