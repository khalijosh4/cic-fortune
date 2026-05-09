import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface ChartDataPoint {
  month: string
  claims: number
  premiums: number
}

interface OverviewProps {
  data?: ChartDataPoint[]
}

const chartConfig = {
  premiums: {
    label: "Premiums",
    color: "var(--chart-1)",
  },
  claims: {
    label: "Claims",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function Overview({ data }: OverviewProps) {
  if (!data || data.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claims vs Premiums</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="claims"
              type="natural"
              fill="var(--color-claims)"
              fillOpacity={0.4}
              stroke="var(--color-claims)"
              stackId="a"
            />
            <Area
              dataKey="premiums"
              type="natural"
              fill="var(--color-premiums)"
              fillOpacity={0.4}
              stroke="var(--color-premiums)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
