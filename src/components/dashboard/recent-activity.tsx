'use client'

import { useMemo } from 'react'
import { ActivityIcon, ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/tasks/status-badge'
import { PriorityBadge } from '@/components/tasks/priority-badge'
import { useAppSelector } from '@/store/hooks'
import { APP_ROUTES } from '@/lib/constants'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-44 mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function RecentActivity() {
  const tasks = useAppSelector((s) => s.tasks.items)
  const projects = useAppSelector((s) => s.projects.items)

  const recent = useMemo(() => {
    return [...tasks]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 8)
      .map((t) => ({
        ...t,
        projectName: projects.find((p) => p.id === t.projectId)?.name,
        projectColor: projects.find((p) => p.id === t.projectId)?.color,
      }))
  }, [tasks, projects])

  if (recent.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Your latest task updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <ActivityIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No activity yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Latest task updates across all projects</CardDescription>
        </div>
        <Link
          href={APP_ROUTES.tasks}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5"
        >
          View all <ArrowRightIcon className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {recent.map((task) => (
          <div
            key={task.id}
            className="group flex items-start gap-3 rounded-lg px-2 py-2 -mx-2 transition-colors hover:bg-muted/50"
          >
            <div
              className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: task.projectColor ?? '#94a3b8' }}
            >
              {(task.projectName ?? 'T').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight">{task.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                {task.projectName && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {task.projectName}
                  </Badge>
                )}
              </div>
            </div>
            <span className="flex-shrink-0 text-[11px] text-muted-foreground mt-0.5 tabular-nums">
              {timeAgo(task.updatedAt)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
