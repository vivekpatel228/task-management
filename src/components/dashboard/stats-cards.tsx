'use client'

import { useMemo } from 'react'
import { CheckCircle2Icon, ClockIcon, AlertCircleIcon, ListTodoIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppSelector } from '@/store/hooks'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number
  subtitle: string
  icon: React.ReactNode
  trend?: { value: number; label: string }
  accent: string
  badge?: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
}

function StatCard({ title, value, subtitle, icon, trend, accent, badge }: StatCardProps) {
  const TrendIcon =
    !trend ? null
    : trend.value > 0 ? TrendingUpIcon
    : trend.value < 0 ? TrendingDownIcon
    : MinusIcon

  return (
    <Card className="relative overflow-hidden">
      <div className={cn('absolute inset-x-0 top-0 h-0.5', accent)} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', `${accent}/10`)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {badge && <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>}
            {trend && TrendIcon && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.value > 0 ? 'text-emerald-600 dark:text-emerald-400'
                : trend.value < 0 ? 'text-red-600 dark:text-red-400'
                : 'text-muted-foreground',
              )}>
                <TrendIcon className="h-3 w-3" />
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2 pt-4">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function StatsCards() {
  const tasks = useAppSelector((s) => s.tasks.items)
  const today = new Date().toISOString().split('T')[0]

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.status === 'done').length
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length
    const inReview = tasks.filter((t) => t.status === 'in_review').length
    const todo = tasks.filter((t) => t.status === 'todo').length
    const pending = todo + inProgress + inReview
    const overdue = tasks.filter(
      (t) => t.dueDate && t.dueDate.split('T')[0] < today && t.status !== 'done',
    ).length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, pending, overdue, completionRate, inProgress }
  }, [tasks, today])

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Tasks"
        value={stats.total}
        subtitle={`${stats.inProgress} currently in progress`}
        icon={<ListTodoIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />}
        accent="bg-violet-500"
        badge={{ label: 'All time', variant: 'secondary' }}
      />
      <StatCard
        title="Completed"
        value={stats.completed}
        subtitle={`${stats.completionRate}% completion rate`}
        icon={<CheckCircle2Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
        accent="bg-emerald-500"
        trend={{ value: stats.completionRate >= 50 ? 12 : -5, label: 'vs last week' }}
      />
      <StatCard
        title="Pending"
        value={stats.pending}
        subtitle="Todo, in progress & review"
        icon={<ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        accent="bg-blue-500"
        badge={{ label: 'Active', variant: 'secondary' }}
      />
      <StatCard
        title="Overdue"
        value={stats.overdue}
        subtitle="Past due date, not completed"
        icon={<AlertCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />}
        accent="bg-red-500"
        badge={stats.overdue > 0 ? { label: 'Needs attention', variant: 'destructive' } : { label: 'All clear', variant: 'secondary' }}
      />
    </div>
  )
}
