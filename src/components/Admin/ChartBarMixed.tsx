import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const COL = {
  learners: "#3b82f6",
  testSets: "#475569",
  published: "#10b981",
} as const

const chartConfig = {
  learners: { label: "Learners", color: COL.learners },
  testSets: { label: "Test sets (total)", color: COL.testSets },
  published: { label: "Published sets", color: COL.published },
} satisfies ChartConfig

export type ChartBarMixedDatum = {
  label: string
  learners: number
  testSets: number
  published: number
}

type ChartBarMixedProps = {
  data: ChartBarMixedDatum[]
  loading?: boolean
  title?: string
  description?: string
}

/**
 * Grouped bar chart (Learners / Test sets / Published) — same pattern as school-admin Fee dashboard charts.
 */
export default function ChartBarMixed({
  data,
  loading,
  title = "Platform overview",
  description = "Learner accounts, total test set definitions, and published (live) sets.",
}: ChartBarMixedProps) {
  if (loading) {
    return (
      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="mt-1 h-4 w-full max-w-md rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          No data to chart yet.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-bold tracking-tight md:text-lg">{title}</CardTitle>
            <CardDescription className="text-sm font-medium">{description}</CardDescription>
          </div>
          <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-primary">
            Snapshot
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-[min(360px,55vh)] pt-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tickFormatter={(v) => (typeof v === "string" && v.length > 8 ? `${v.slice(0, 6)}…` : String(v))}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={32}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
            />
            <Legend wrapperStyle={{ paddingTop: 4 }} />
            <Bar
              name="Learners"
              dataKey="learners"
              fill={COL.learners}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              name="Test sets"
              dataKey="testSets"
              fill={COL.testSets}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              name="Published"
              dataKey="published"
              fill={COL.published}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
