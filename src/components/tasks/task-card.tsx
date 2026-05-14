'use client'

import { useRef, useState } from 'react'
import { CalendarIcon, ChevronRightIcon, MoreHorizontalIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import { useAppDispatch } from '@/store/hooks'
import { addSubtask, toggleSubtask, removeSubtask } from '@/store/slices/tasks.slice'

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
  const dispatch = useAppDispatch()
  const isDone = task.status === 'done'
  const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null

  const subtasks = task.subtasks ?? []
  const completedCount = subtasks.filter((s) => s.completed).length
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0

  const [subtasksOpen, setSubtasksOpen] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleAddSubtask() {
    const title = newSubtaskTitle.trim()
    if (!title) return
    dispatch(
      addSubtask({
        taskId: task.id,
        subtask: {
          id: crypto.randomUUID(),
          title,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      }),
    )
    setNewSubtaskTitle('')
    inputRef.current?.focus()
  }

  function handleOpenSubtasks(e: React.MouseEvent) {
    e.stopPropagation()
    setSubtasksOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div
      className={cn(
        'group flex flex-col rounded-lg border bg-card transition-colors hover:bg-accent/40',
        isDone && 'opacity-60',
      )}
    >
      {/* Main task row */}
      <div className="flex items-start gap-3 p-3 sm:p-4">
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
                  className="h-6 w-6 shrink-0"
                >
                  <MoreHorizontalIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">Task actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
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

      {/* Subtasks section */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <Collapsible open={subtasksOpen} onOpenChange={setSubtasksOpen}>
          {subtasks.length > 0 ? (
            <CollapsibleTrigger asChild>
              <button
                className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ChevronRightIcon
                  className={cn(
                    'h-3 w-3 shrink-0 transition-transform duration-200',
                    subtasksOpen && 'rotate-90',
                  )}
                />
                <Progress
                  value={subtaskProgress}
                  className="h-1.5 flex-1"
                  indicatorClassName={subtaskProgress === 100 ? 'bg-emerald-500' : undefined}
                />
                <span className="shrink-0 tabular-nums">
                  {completedCount}/{subtasks.length}
                </span>
              </button>
            </CollapsibleTrigger>
          ) : (
            <button
              className="flex items-center gap-1 rounded px-1 py-0.5 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
              onClick={handleOpenSubtasks}
            >
              <PlusIcon className="h-3 w-3" />
              Add subtask
            </button>
          )}

          <CollapsibleContent>
            <div className="mt-2 space-y-0.5 border-l-2 border-border pl-3">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="group/subtask flex items-center gap-2 rounded py-1"
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() =>
                      dispatch(toggleSubtask({ taskId: task.id, subtaskId: subtask.id }))
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="h-3.5 w-3.5 shrink-0"
                  />
                  <span
                    className={cn(
                      'flex-1 text-xs leading-snug',
                      subtask.completed && 'line-through text-muted-foreground',
                    )}
                  >
                    {subtask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0 opacity-0 transition-opacity group-hover/subtask:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      dispatch(removeSubtask({ taskId: task.id, subtaskId: subtask.id }))
                    }}
                  >
                    <Trash2Icon className="h-3 w-3" />
                    <span className="sr-only">Delete subtask</span>
                  </Button>
                </div>
              ))}

              {/* Inline add */}
              <div className="flex items-center gap-2 py-1">
                <PlusIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSubtask()
                    }
                    if (e.key === 'Escape') {
                      setNewSubtaskTitle('')
                      if (subtasks.length === 0) setSubtasksOpen(false)
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Add a subtask…"
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                />
                {newSubtaskTitle.trim() && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddSubtask()
                    }}
                  >
                    <PlusIcon className="h-3 w-3" />
                    <span className="sr-only">Add subtask</span>
                  </Button>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
