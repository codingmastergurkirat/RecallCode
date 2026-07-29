"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ActivityPoint } from "@/services/dashboard.service";

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  const chartData = data.map((item) => ({
    ...item,
    label: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    }).format(new Date(`${item.date}T00:00:00`)),
  }));

  return (
    <div className="activity-chart" aria-label="Fourteen day learning activity">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            interval={2}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: "#f97316", strokeDasharray: "3 3" }}
            contentStyle={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              background: "var(--card)",
              color: "var(--foreground)",
              boxShadow: "var(--shadow-md)",
            }}
          />
          <Area
            type="monotone"
            dataKey="solved"
            name="Problems solved"
            stroke="#f97316"
            strokeWidth={2.5}
            fill="url(#activityFill)"
          />
          <Area
            type="monotone"
            dataKey="reviews"
            name="Reviews"
            stroke="#171717"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="transparent"
            className="review-chart-line"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
