export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Status = 'todo' | 'in_progress' | 'in_review' | 'done'
export type ActiveView = 'list' | 'board' | 'calendar'

export interface Label {
  id: string
  name: string
  color: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: Status
  priority: Priority
  labels: Label[]
  assigneeId?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  projectId?: string
}

export interface TaskFilters {
  status?: Status[]
  priority?: Priority[]
  assigneeId?: string
  labelIds?: string[]
  search?: string
}
