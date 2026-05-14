'use client'

import { useMemo } from 'react'
import { FolderIcon, ArrowRightIcon, CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppSelector } from '@/store/hooks'
import { APP_ROUTES, PROJECT_STATUS_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'

const STATUS_VARIANT: Record<ProjectStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  on_hold: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  completed: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  cancelled: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
}

function formatDeadline(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86_400_000)
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, overdue: true }
  if (diff === 0) return { label: 'Due today', overdue: false }
  if (diff <= 7) return { label: `${diff}d left`, overdue: false }
  return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), overdue: false }
}

export function ProjectOverviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-44 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function ProjectOverview() {
  const projects = useAppSelector((s) => s.projects.items)
  const tasks = useAppSelector((s) => s.tasks.items)

  const projectStats = useMemo(() => {
    return projects
      .filter((p) => !p.isArchived)
      .map((p) => {
        const projectTasks = tasks.filter((t) => t.projectId === p.id)
        const done = projectTasks.filter((t) => t.status === 'done').length
        const total = projectTasks.length
        const pct = total > 0 ? Math.round((done / total) * 100) : 0
        const deadline = p.deadline ? formatDeadline(p.deadline) : null
        return { project: p, done, total, pct, deadline }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [projects, tasks])

  if (projectStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Overview</CardTitle>
          <CardDescription>Progress across active projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <FolderIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No active projects</p>
            <Link href={APP_ROUTES.projects} className="text-xs text-primary hover:underline">
              Create a project
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base">Project Overview</CardTitle>
          <CardDescription>Progress across your active projects</CardDescription>
        </div>
        <Link
          href={APP_ROUTES.projects}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5"
        >
          All projects <ArrowRightIcon className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {projectStats.map(({ project, done, total, pct, deadline }) => (
          <Link
            key={project.id}
            href={APP_ROUTES.projectDetail(project.id)}
            className="group block rounded-lg -mx-2 px-2 py-2 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{project.name}</span>
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    {deadline && (
                      <span
                        className={cn(
                          'flex items-center gap-0.5 text-[10px]',
                          deadline.overdue ? 'text-red-500' : 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="h-2.5 w-2.5" />
                        {deadline.label}
                      </span>
                    )}
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-medium',
                        STATUS_VARIANT[project.status],
                      )}
                    >
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="flex-shrink-0 text-xs tabular-nums text-muted-foreground">
                    {done}/{total}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
