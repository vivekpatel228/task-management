'use client'

import { Badge } from '@/components/ui/badge'
import type { Priority } from '@/types'
import { PRIORITY_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const priorityClasses: Record<Priority, string> = {
  low: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
  high: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  urgent: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
}

interface PriorityBadgeProps {
  priority: Priority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge variant="outline" className={cn(priorityClasses[priority], 'text-xs font-medium', className)}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}
