import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface StatItem {
  metric: string;
  current: string | number;
  previous?: string | number;
  difference?: string;
  trend?: "up" | "down";
}

interface Stats02Props {
  stats: StatItem[];
  isLoading?: boolean;
}

export function Stats02({ stats, isLoading }: Stats02Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 divide-y bg-border divide-border overflow-hidden rounded-lg md:grid-cols-3 md:divide-x md:divide-y-0">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-none border-0 shadow-sm py-0">
            <CardContent className="p-4 sm:p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 divide-y bg-border divide-border overflow-hidden rounded-lg md:grid-cols-3 md:divide-x md:divide-y-0">
      {stats.map((item) => (
        <Card
          key={item.metric}
          className="rounded-none border-0 shadow-sm py-0"
        >
          <CardContent className="p-4 sm:p-6">
            <CardTitle className="text-base font-normal">
              {item.metric}
            </CardTitle>
            <div className="mt-1 flex items-baseline gap-2 md:block lg:flex">
              <div className="tabular-nums flex items-baseline text-2xl font-semibold text-primary">
                {item.current}
                {item.previous !== undefined && (
                  <span className="tabular-nums ml-2 text-sm font-medium text-muted-foreground">
                    from {item.previous}
                  </span>
                )}
              </div>

              {item.difference && item.trend && (
                <Badge
                  variant="outline"
                  className={cn(
                    "tabular-nums inline-flex items-center px-1.5 ps-2.5 py-0.5 text-xs font-medium md:mt-2 lg:mt-0",
                    item.trend === "up"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {item.trend === "up" ? (
                    <TrendingUp className="mr-0.5 -ml-1 h-5 w-5 shrink-0 self-center text-green-500" />
                  ) : (
                    <TrendingDown className="mr-0.5 -ml-1 h-5 w-5 shrink-0 self-center text-red-500" />
                  )}
                  <span className="sr-only">
                    {item.trend === "up" ? "Increased" : "Decreased"} by{" "}
                  </span>
                  {item.difference}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
