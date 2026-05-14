'use client'

import { CalendarIcon, MoreHorizontalIcon } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PriorityBadge } from './priority-badge'
import { StatusBadge } from './status-badge'
import type { Task } from '@/types'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onToggleComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

function formatDueDate(dateStr: string): { label: string; overdue: boolean } {
  const due = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  const diff = Math.floor((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, overdue: true }
  if (diff === 0) return { label: 'Today', overdue: false }
  if (diff === 1) return { label: 'Tomorrow', overdue: false }
  return {
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    overdue: false,
  }
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const isDone = task.status === 'done'
  const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/40 sm:p-4',
        isDone && 'opacity-60',
      )}
    >
      <div className="pt-0.5">
        <Checkbox
          checked={isDone}
          onCheckedChange={() => onToggleComplete(task.id)}
          aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
          className="mt-0.5"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm font-medium leading-snug',
              isDone && 'line-through text-muted-foreground',
            )}
          >
            {task.title}
          </p>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              >
                <MoreHorizontalIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Task actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleComplete(task.id)}>
                {isDone ? 'Mark Incomplete' : 'Mark Complete'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />

          {task.labels.map((label) => (
            <Badge
              key={label.id}
              variant="outline"
              className="text-xs"
              style={{ borderColor: label.color + '60', color: label.color }}
            >
              {label.name}
            </Badge>
          ))}

          {dueInfo && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                dueInfo.overdue ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="h-3 w-3" />
              {dueInfo.label}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
