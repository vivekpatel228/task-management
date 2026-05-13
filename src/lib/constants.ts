import type { Priority, Status } from '@/types'

export const APP_NAME = 'TaskFlow'
export const PERSIST_KEY = 'taskflow-root'

export const APP_ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  tasks: '/tasks',
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
