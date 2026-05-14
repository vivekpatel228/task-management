'use client'

import { useMemo, useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskCard } from './task-card'
import { TaskSheet } from './task-sheet'
import { TaskFiltersBar } from './task-filters'
import { TaskEmptyState } from './task-empty-state'
import { TaskDeleteDialog } from './task-delete-dialog'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addTask,
  updateTask,
  removeTask,
  toggleTaskComplete,
  setFilters,
  setSort,
} from '@/store/slices/tasks.slice'
import type { Subtask, Task, TaskFilters, TaskSort } from '@/types'
import { DEFAULT_LABELS } from '@/lib/constants'
import { applyFilters, applySort } from '@/lib/task-utils'

function buildTask(values: {
  id?: string
  title: string
  description?: string
  status: Task['status']
  priority: Task['priority']
  dueDate?: string
  labelIds: string[]
  projectId?: string
  subtasks?: Subtask[]
}, existing?: Task | null): Task {
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
    projectId: values.projectId || undefined,
    subtasks: values.subtasks ?? existing?.subtasks ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}


export function TaskList() {
  const dispatch = useAppDispatch()
  const allTasks = useAppSelector((s) => s.tasks.items)
  const filters = useAppSelector((s) => s.tasks.filters)
  const sort = useAppSelector((s) => s.tasks.sort ?? { field: 'createdAt' as const, order: 'desc' as const })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Personal tasks only — project tasks live on their project page
  const personalTasks = useMemo(() => allTasks.filter((t) => !t.projectId), [allTasks])

  const filteredTasks = useMemo(() => applySort(applyFilters(personalTasks, filters), sort), [personalTasks, filters, sort])

  const hasFilters = !!(
    filters.search ||
    filters.status?.length ||
    filters.priority?.length ||
    filters.labelIds?.length
  )

  function openCreate() {
    setEditingTask(null)
    setSheetOpen(true)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setSheetOpen(true)
  }

  function handleSave(values: Parameters<typeof buildTask>[0]) {
    const task = buildTask(values, editingTask)
    if (editingTask) {
      dispatch(updateTask(task))
    } else {
      dispatch(addTask(task))
    }
  }

  function handleDelete() {
    if (deleteId) {
      dispatch(removeTask(deleteId))
      setDeleteId(null)
    }
  }

  const taskToDelete = personalTasks.find((t) => t.id === deleteId)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">My Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {personalTasks.length} task{personalTasks.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2 shrink-0">
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Filters */}
      <TaskFiltersBar
        filters={filters}
        sort={sort}
        onFiltersChange={(f: TaskFilters) => dispatch(setFilters(f))}
        onSortChange={(s: TaskSort) => dispatch(setSort(s))}
      />

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <TaskEmptyState hasFilters={hasFilters} onNewTask={openCreate} />
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={(id) => dispatch(toggleTaskComplete(id))}
              onEdit={openEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Sheet */}
      <TaskSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        task={editingTask}
        onSave={handleSave}
        hideProjectPicker
      />

      {/* Delete confirmation */}
      <TaskDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        taskTitle={taskToDelete?.title}
      />
    </div>
  )
}
