import type { Task, TaskFilters, TaskSort } from '@/types'
import { PRIORITY_ORDER } from '@/lib/constants'

export function applyFilters(tasks: Task[], filters: TaskFilters): Task[] {
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

export function applySort(tasks: Task[], sort: TaskSort): Task[] {
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
