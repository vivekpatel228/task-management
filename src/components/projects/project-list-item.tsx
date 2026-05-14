'use client'

import Link from 'next/link'
import {
  CalendarIcon,
  MoreHorizontalIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  PencilIcon,
  Trash2Icon,
  ListTodoIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, APP_ROUTES } from '@/lib/constants'
import type { Project } from '@/types'
import { cn } from '@/lib/utils'

interface ProjectListItemProps {
  project: Project
  taskTotal: number
  taskDone: number
  onEdit: (project: Project) => void
  onArchive: (id: string) => void
  onUnarchive: (id: string) => void
  onDelete: (id: string) => void
}

function formatDeadline(dateStr: string): { label: string; overdue: boolean } {
  const due = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, overdue: true }
  if (diff === 0) return { label: 'Due today', overdue: false }
  if (diff <= 7) return { label: `${diff}d left`, overdue: false }
  return {
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    overdue: false,
  }
}

export function ProjectListItem({
  project,
  taskTotal,
  taskDone,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: ProjectListItemProps) {
  const progress = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0
  const deadlineInfo = project.deadline ? formatDeadline(project.deadline) : null
  const statusColor = PROJECT_STATUS_COLORS[project.status]

  return (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/40',
        project.isArchived && 'opacity-60',
      )}
    >
      {/* Color dot + name */}
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white text-xs font-bold"
        style={{ backgroundColor: project.color }}
      >
        {project.name.charAt(0).toUpperCase()}
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Link
            href={APP_ROUTES.projectDetail(project.id)}
            className="truncate text-sm font-medium hover:text-primary transition-colors"
          >
            {project.name}
          </Link>
          {project.isArchived && (
            <Badge variant="outline" className="text-xs h-4 px-1 py-0">Archived</Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Progress value={progress} className="h-1 w-24 shrink-0" />
          <span className="text-xs text-muted-foreground tabular-nums">
            {taskDone}/{taskTotal}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <Badge
        variant="outline"
        className="hidden md:flex text-xs px-1.5 h-5 shrink-0"
        style={{
          borderColor: statusColor + '50',
          color: statusColor,
          backgroundColor: statusColor + '10',
        }}
      >
        {PROJECT_STATUS_LABELS[project.status]}
      </Badge>

      {/* Deadline */}
      {deadlineInfo ? (
        <span
          className={cn(
            'hidden lg:flex items-center gap-1 text-xs shrink-0 w-28',
            deadlineInfo.overdue ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          {deadlineInfo.label}
        </span>
      ) : (
        <span className="hidden lg:block w-28 text-xs text-muted-foreground/40">No deadline</span>
      )}

      {/* Progress % */}
      <span className="hidden sm:block text-xs font-medium tabular-nums w-10 text-right shrink-0">
        {progress}%
      </span>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
          >
            <MoreHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <Link href={APP_ROUTES.projectDetail(project.id)}>
              <ListTodoIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              View Tasks
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(project)}>
            <PencilIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            Edit
          </DropdownMenuItem>
          {project.isArchived ? (
            <DropdownMenuItem onClick={() => onUnarchive(project.id)}>
              <ArchiveRestoreIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              Unarchive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => onArchive(project.id)}>
              <ArchiveIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(project.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
