'use client'

import { Badge } from '@/components/ui/badge'
import type { Status } from '@/types'
import { STATUS_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const statusClasses: Record<Status, string> = {
  todo: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  in_review: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  done: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusClasses[status], 'text-xs font-medium', className)}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
