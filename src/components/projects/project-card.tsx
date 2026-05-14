'use client'

import Link from 'next/link'
import {
  CalendarIcon,
  MoreHorizontalIcon,
  CheckCircle2Icon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  PencilIcon,
  Trash2Icon,
  ListTodoIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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

interface ProjectCardProps {
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
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    overdue: false,
  }
}

export function ProjectCard({
  project,
  taskTotal,
  taskDone,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: ProjectCardProps) {
  const progress = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0
  const deadlineInfo = project.deadline ? formatDeadline(project.deadline) : null
  const statusColor = PROJECT_STATUS_COLORS[project.status]

  return (
    <Card
      className={cn(
        'group relative flex flex-col overflow-hidden border transition-shadow hover:shadow-md',
        project.isArchived && 'opacity-60',
      )}
    >
      {/* Color accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: project.color }} />

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white text-xs font-bold"
              style={{ backgroundColor: project.color }}
            >
              {project.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <Link
                href={APP_ROUTES.projectDetail(project.id)}
                className="truncate text-sm font-semibold hover:text-primary transition-colors block"
              >
                {project.name}
              </Link>
              {project.isArchived && (
                <span className="text-xs text-muted-foreground">Archived</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Badge
              variant="outline"
              className="text-xs px-1.5 py-0 h-5 font-medium hidden sm:flex"
              style={{
                borderColor: statusColor + '50',
                color: statusColor,
                backgroundColor: statusColor + '10',
              }}
            >
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                >
                  <MoreHorizontalIcon className="h-4 w-4" />
                  <span className="sr-only">Project actions</span>
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
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pb-4">
        {project.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{project.description}</p>
        )}

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <CheckCircle2Icon className="h-3.5 w-3.5" />
              Progress
            </span>
            <span className="font-medium tabular-nums">{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="h-1.5"
            indicatorClassName="transition-all"
            style={
              {
                '--progress-color': project.color,
              } as React.CSSProperties
            }
          />
          <p className="text-xs text-muted-foreground tabular-nums">
            {taskDone} / {taskTotal} tasks done
          </p>
        </div>

        {/* Deadline */}
        {deadlineInfo && (
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs',
              deadlineInfo.overdue ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>{deadlineInfo.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
