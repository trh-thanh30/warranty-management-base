"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Skeleton } from "@repo/ui";

const data = [
  { month: "Jan", revenue: 1860 },
  { month: "Feb", revenue: 5580 },
  { month: "Mar", revenue: 1490 },
  { month: "Apr", revenue: 5420 },
  { month: "May", revenue: 3010 },
  { month: "Jun", revenue: 1670 },
  { month: "Jul", revenue: 2460 },
  { month: "Aug", revenue: 4380 },
  { month: "Sep", revenue: 4240 },
  { month: "Oct", revenue: 4930 },
  { month: "Nov", revenue: 1080 },
  { month: "Dec", revenue: 4210 },
];

export function DashboardOverviewChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="h-[22rem] w-full" />;
  }

  return (
    <div className="h-[22rem] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data}>
          <XAxis
            axisLine={false}
            dataKey="month"
            fontSize={12}
            stroke="currentColor"
            tickLine={false}
            tickMargin={10}
            className="text-slate-500"
          />
          <YAxis
            axisLine={false}
            fontSize={12}
            stroke="currentColor"
            tickFormatter={(value) => `$${value}`}
            tickLine={false}
            tickMargin={10}
            className="text-slate-500"
          />
          <Bar
            className="fill-slate-900 dark:fill-slate-200"
            dataKey="revenue"
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
