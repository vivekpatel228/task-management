'use client'

import { useMemo, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircle2Icon,
  CircleIcon,
  PencilIcon,
  PlusIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TaskCard } from '@/components/tasks/task-card'
import { TaskSheet } from '@/components/tasks/task-sheet'
import { TaskDeleteDialog } from '@/components/tasks/task-delete-dialog'
import { TaskEmptyState } from '@/components/tasks/task-empty-state'
import { TaskFiltersBar } from '@/components/tasks/task-filters'
import { ProjectDialog } from '@/components/projects/project-dialog'
import { ProjectArchiveDialog } from '@/components/projects/project-archive-dialog'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addTask,
  updateTask,
  removeTask,
  toggleTaskComplete,
} from '@/store/slices/tasks.slice'
import {
  updateProject,
  archiveProject,
  unarchiveProject,
} from '@/store/slices/projects.slice'
import type { Subtask, Task, Project, TaskFilters, TaskSort } from '@/types'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, DEFAULT_LABELS, APP_ROUTES } from '@/lib/constants'
import { applyFilters, applySort } from '@/lib/task-utils'
import { cn } from '@/lib/utils'

function buildTask(
  values: {
    id?: string
    title: string
    description?: string
    status: Task['status']
    priority: Task['priority']
    dueDate?: string
    labelIds: string[]
    projectId?: string
    subtasks?: Subtask[]
  },
  existing?: Task | null,
  projectId?: string,
): Task {
  const now = new Date().toISOString()
  const labels = values.labelIds
    .map((id) => DEFAULT_LABELS.find((l) => l.id === id))
    .filter(Boolean) as Task['labels']

  return {
    id: values.id ?? crypto.randomUUID(),
    title: values.title,
    description: values.description || undefined,
    status: values.status,
    priority: values.priority,
    labels,
    dueDate: values.dueDate || undefined,
    projectId: values.projectId ?? projectId,
    subtasks: values.subtasks ?? existing?.subtasks ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

function buildProject(
  values: { name: string; description?: string; color: string; status: Project['status']; deadline?: string; id?: string },
  existing: Project,
): Project {
  return {
    ...existing,
    name: values.name,
    description: values.description || undefined,
    color: values.color,
    status: values.status,
    deadline: values.deadline || undefined,
    updatedAt: new Date().toISOString(),
  }
}

function formatDeadline(dateStr: string): { label: string; overdue: boolean } {
  const due = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, overdue: true }
  if (diff === 0) return { label: 'Due today', overdue: false }
  return {
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    overdue: false,
  }
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()

  const project = useAppSelector((s) => s.projects.items.find((p) => p.id === id))
  const allTasks = useAppSelector((s) => s.tasks.items)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [filters, setFilters] = useState<TaskFilters>({})
  const [sort, setSort] = useState<TaskSort>({ field: 'createdAt', order: 'desc' })

  const projectTasks = useMemo(
    () => allTasks.filter((t) => t.projectId === id),
    [allTasks, id],
  )

  const filteredTasks = useMemo(
    () => applySort(applyFilters(projectTasks, filters), sort),
    [projectTasks, filters, sort],
  )

  const hasFilters = !!(
    filters.search ||
    filters.status?.length ||
    filters.priority?.length ||
    filters.labelIds?.length
  )

  const taskStats = useMemo(() => {
    const total = projectTasks.length
    const done = projectTasks.filter((t) => t.status === 'done').length
    const inProgress = projectTasks.filter((t) => t.status === 'in_progress').length
    const todo = projectTasks.filter((t) => t.status === 'todo').length
    const progress = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, inProgress, todo, progress }
  }, [projectTasks])

  if (!project) return notFound()

  // project is narrowed to Project from here on in render, but callbacks need explicit capture
  const currentProject = project as Project

  const statusColor = PROJECT_STATUS_COLORS[currentProject.status]
  const deadlineInfo = currentProject.deadline ? formatDeadline(currentProject.deadline) : null

  function openCreate() {
    setEditingTask(null)
    setSheetOpen(true)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setSheetOpen(true)
  }

  function handleSaveTask(values: Parameters<typeof buildTask>[0]) {
    const task = buildTask(values, editingTask, id)
    if (editingTask) {
      dispatch(updateTask(task))
    } else {
      dispatch(addTask(task))
    }
  }

  function handleDeleteTask() {
    if (deleteId) {
      dispatch(removeTask(deleteId))
      setDeleteId(null)
    }
  }

  function handleSaveProject(values: Parameters<typeof buildProject>[0]) {
    dispatch(updateProject(buildProject(values, currentProject)))
  }

  function handleArchiveToggle() {
    if (currentProject.isArchived) {
      dispatch(unarchiveProject(id))
    } else {
      dispatch(archiveProject(id))
    }
    setArchiveDialogOpen(false)
  }

  const taskToDelete = allTasks.find((t) => t.id === deleteId)

  return (
    <div className="flex flex-1 flex-col gap-0">
      {/* Project header */}
      <div
        className="border-b px-4 py-5 sm:px-6"
        style={{ borderTopColor: currentProject.color, borderTopWidth: 3 }}
      >
        <div className="mb-4">
          <Link
            href={APP_ROUTES.projects}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            All Projects
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white text-base font-bold shadow-sm"
              style={{ backgroundColor: currentProject.color }}
            >
              {currentProject.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold">{currentProject.name}</h1>
                {currentProject.isArchived && (
                  <Badge variant="outline" className="text-xs">Archived</Badge>
                )}
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 h-5"
                  style={{
                    borderColor: statusColor + '50',
                    color: statusColor,
                    backgroundColor: statusColor + '10',
                  }}
                >
                  {PROJECT_STATUS_LABELS[currentProject.status]}
                </Badge>
              </div>
              {currentProject.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{currentProject.description}</p>
              )}
              {deadlineInfo && (
                <div
                  className={cn(
                    'mt-1 flex items-center gap-1 text-xs',
                    deadlineInfo.overdue ? 'text-destructive' : 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {deadlineInfo.label}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setArchiveDialogOpen(true)}
            >
              {currentProject.isArchived ? (
                <><ArchiveRestoreIcon className="h-3.5 w-3.5" />Unarchive</>
              ) : (
                <><ArchiveIcon className="h-3.5 w-3.5" />Archive</>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setEditDialogOpen(true)}
            >
              <PencilIcon className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button size="sm" className="gap-1.5" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-muted/40 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Progress</p>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold tabular-nums">{taskStats.progress}%</span>
              </div>
              <Progress value={taskStats.progress} className="h-1.5" />
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Total tasks</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{taskStats.total}</p>
          </div>

          <div className="rounded-lg bg-muted/40 px-3 py-2.5">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2Icon className="h-3 w-3 text-emerald-500" />
              Done
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {taskStats.done}
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 px-3 py-2.5">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CircleIcon className="h-3 w-3 text-blue-500" />
              In Progress
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-blue-600 dark:text-blue-400">
              {taskStats.inProgress}
            </p>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        <TaskFiltersBar
          filters={filters}
          sort={sort}
          onFiltersChange={setFilters}
          onSortChange={setSort}
        />

        {filteredTasks.length === 0 ? (
          <TaskEmptyState hasFilters={hasFilters} onNewTask={openCreate} />
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={(taskId) => dispatch(toggleTaskComplete(taskId))}
                onEdit={openEdit}
                onDelete={(taskId) => setDeleteId(taskId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task sheet */}
      <TaskSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        task={editingTask}
        onSave={handleSaveTask}
        defaultProjectId={id}
      />

      {/* Task delete dialog */}
      <TaskDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteTask}
        taskTitle={taskToDelete?.title}
      />

      {/* Project edit dialog */}
      <ProjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={currentProject}
        onSave={handleSaveProject}
      />

      {/* Archive dialog */}
      <ProjectArchiveDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        onConfirm={handleArchiveToggle}
        projectName={currentProject.name}
        isArchiving={!currentProject.isArchived}
      />
    </div>
  )
}
