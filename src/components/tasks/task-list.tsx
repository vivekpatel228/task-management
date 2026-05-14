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
import type { Task, TaskFilters, TaskSort, Priority } from '@/types'
import { DEFAULT_LABELS, PRIORITY_ORDER } from '@/lib/constants'

function buildTask(values: {
  id?: string
  title: string
  description?: string
  status: Task['status']
  priority: Task['priority']
  dueDate?: string
  labelIds: string[]
  projectId?: string
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
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

function applyFilters(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !task.title.toLowerCase().includes(q) &&
        !task.description?.toLowerCase().includes(q)
      ) {
        return false
      }
    }
    if (filters.status?.length && !filters.status.includes(task.status)) return false
    if (filters.priority?.length && !filters.priority.includes(task.priority)) return false
    if (filters.labelIds?.length) {
      const taskLabelIds = task.labels.map((l) => l.id)
      if (!filters.labelIds.some((id) => taskLabelIds.includes(id))) return false
    }
    return true
  })
}

function applySort(tasks: Task[], sort: TaskSort): Task[] {
  return [...tasks].sort((a, b) => {
    let cmp = 0
    switch (sort.field) {
      case 'title':
        cmp = a.title.localeCompare(b.title)
        break
      case 'priority':
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        break
      case 'status': {
        const order = ['todo', 'in_progress', 'in_review', 'done']
        cmp = order.indexOf(a.status) - order.indexOf(b.status)
        break
      }
      case 'dueDate':
        cmp = (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999')
        break
      case 'createdAt':
        cmp = a.createdAt.localeCompare(b.createdAt)
        break
    }
    return sort.order === 'asc' ? cmp : -cmp
  })
}

export function TaskList() {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector((s) => s.tasks.items)
  const filters = useAppSelector((s) => s.tasks.filters)
  const sort = useAppSelector((s) => s.tasks.sort ?? { field: 'createdAt' as const, order: 'desc' as const })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredTasks = useMemo(() => applySort(applyFilters(tasks, filters), sort), [tasks, filters, sort])

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

  const taskToDelete = tasks.find((t) => t.id === deleteId)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">My Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
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
