'use client'

import { CheckSquareIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TaskEmptyStateProps {
  hasFilters: boolean
  onNewTask: () => void
}

export function TaskEmptyState({ hasFilters, onNewTask }: TaskEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <CheckSquareIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">
          {hasFilters ? 'No matching tasks' : 'No tasks yet'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? 'Try adjusting your search or filters.'
            : 'Create your first task to get started.'}
        </p>
      </div>
      {!hasFilters && (
        <Button onClick={onNewTask} size="sm" className="gap-2">
          <PlusIcon className="h-4 w-4" />
          New Task
        </Button>
      )}
    </div>
  )
}
