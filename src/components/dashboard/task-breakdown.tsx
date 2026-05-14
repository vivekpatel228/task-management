'use client'

import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppSelector } from '@/store/hooks'
import type { Priority, Status } from '@/types'

const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  todo: { label: 'Todo', color: '#94a3b8' },
  in_progress: { label: 'In Progress', color: '#3b82f6' },
  in_review: { label: 'In Review', color: '#8b5cf6' },
  done: { label: 'Done', color: '#10b981' },
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#3b82f6' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#f97316' },
  urgent: { label: 'Urgent', color: '#ef4444' },
}

export function TaskBreakdownSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-48 mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

export function TaskBreakdown() {
  const tasks = useAppSelector((s) => s.tasks.items)

  const { statusData, priorityData, total } = useMemo(() => {
    const total = tasks.length

    const statusCounts = tasks.reduce(
      (acc, t) => {
        acc[t.status] = (acc[t.status] ?? 0) + 1
        return acc
      },
      {} as Record<Status, number>,
    )

    const priorityCounts = tasks.reduce(
      (acc, t) => {
        acc[t.priority] = (acc[t.priority] ?? 0) + 1
        return acc
      },
      {} as Record<Priority, number>,
    )

    const statusData = (Object.keys(STATUS_CONFIG) as Status[])
      .map((s) => ({
        name: STATUS_CONFIG[s].label,
        value: statusCounts[s] ?? 0,
        color: STATUS_CONFIG[s].color,
        pct: total > 0 ? Math.round(((statusCounts[s] ?? 0) / total) * 100) : 0,
      }))
      .filter((d) => d.value > 0)

    const priorityData = (Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => ({
      name: PRIORITY_CONFIG[p].label,
      value: priorityCounts[p] ?? 0,
      color: PRIORITY_CONFIG[p].color,
      pct: total > 0 ? Math.round(((priorityCounts[p] ?? 0) / total) * 100) : 0,
    }))

    return { statusData, priorityData, total }
  }, [tasks])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Task Breakdown</CardTitle>
        <CardDescription>Status and priority distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Donut chart */}
          <div className="flex flex-col items-center gap-2">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={statusData.length ? statusData : [{ name: 'No data', value: 1, color: '#e2e8f0' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={54}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {statusData.length
                    ? statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)
                    : <Cell fill="#e2e8f0" />}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-xs text-muted-foreground">{total} total</p>
          </div>

          {/* Status breakdown bars */}
          <div className="flex-1 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">By status</p>
            {(Object.keys(STATUS_CONFIG) as Status[]).map((s) => {
              const entry = statusData.find((d) => d.name === STATUS_CONFIG[s].label)
              const count = entry?.value ?? 0
              const pct = entry?.pct ?? 0
              return (
                <div key={s} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STATUS_CONFIG[s].color }}
                      />
                      {STATUS_CONFIG[s].label}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {count} · {pct}%
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Priority pills */}
        <div className="mt-5 border-t pt-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">By priority</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {priorityData.map((p) => (
              <div key={p.name} className="rounded-lg border bg-muted/30 p-2 text-center">
                <div
                  className="mx-auto mb-1 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <p className="text-lg font-bold tabular-nums">{p.value}</p>
                <p className="text-[10px] text-muted-foreground">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
