import type { Priority, Status, Label, SortField, ProjectStatus } from '@/types'

export const APP_NAME = 'TaskFlow'
export const PERSIST_KEY = 'taskflow-root-v2'

export const APP_ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  tasks: '/tasks',
  projects: '/projects',
  projectDetail: (id: string) => `/projects/${id}`,
  settings: '/settings',
} as const

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const STATUS_LABELS: Record<Status, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'blue',
  medium: 'yellow',
  high: 'orange',
  urgent: 'red',
}

export const STATUS_COLORS: Record<Status, string> = {
  todo: 'slate',
  in_progress: 'blue',
  in_review: 'purple',
  done: 'green',
}

export const DEFAULT_LABELS: Label[] = [
  { id: 'bug', name: 'Bug', color: '#ef4444' },
  { id: 'feature', name: 'Feature', color: '#6366f1' },
  { id: 'design', name: 'Design', color: '#ec4899' },
  { id: 'docs', name: 'Docs', color: '#10b981' },
  { id: 'research', name: 'Research', color: '#f59e0b' },
  { id: 'refactor', name: 'Refactor', color: '#8b5cf6' },
  { id: 'testing', name: 'Testing', color: '#06b6d4' },
]

export const SORT_FIELD_LABELS: Record<SortField, string> = {
  createdAt: 'Date Created',
  dueDate: 'Due Date',
  priority: 'Priority',
  title: 'Title',
  status: 'Status',
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  active: '#3b82f6',
  on_hold: '#f59e0b',
  completed: '#10b981',
  cancelled: '#6b7280',
}

export const PROJECT_COLORS = [
  '#6366f1',
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#84cc16',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
]
