'use client'

import { Suspense } from 'react'
import { StatsCards, StatsCardsSkeleton } from '@/components/dashboard/stats-cards'
import { ProductivityChart, ProductivityChartSkeleton } from '@/components/dashboard/productivity-chart'
import { TaskBreakdown, TaskBreakdownSkeleton } from '@/components/dashboard/task-breakdown'
import { RecentActivity, RecentActivitySkeleton } from '@/components/dashboard/recent-activity'
import { ProjectOverview, ProjectOverviewSkeleton } from '@/components/dashboard/project-overview'
import { useAppSelector } from '@/store/hooks'

function DashboardContent() {
  const tasksStatus = useAppSelector((s) => s.tasks.status)
  const loading = tasksStatus === 'loading'

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of your tasks, projects, and productivity
        </p>
      </div>

      {/* Stats row */}
      {loading ? <StatsCardsSkeleton /> : <StatsCards />}

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? <ProductivityChartSkeleton /> : <ProductivityChart />}
        {loading ? <TaskBreakdownSkeleton /> : <TaskBreakdown />}
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? <RecentActivitySkeleton /> : <RecentActivity />}
        {loading ? <ProjectOverviewSkeleton /> : <ProjectOverview />}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <StatsCardsSkeleton />
        <div className="grid gap-6 lg:grid-cols-2">
          <ProductivityChartSkeleton />
          <TaskBreakdownSkeleton />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentActivitySkeleton />
          <ProjectOverviewSkeleton />
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
