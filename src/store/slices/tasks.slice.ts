import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Subtask, Task, TaskFilters, TaskSort } from '@/types'

interface TasksState {
  items: Task[]
  status: 'idle' | 'loading' | 'error'
  filters: TaskFilters
  sort: TaskSort
}

const initialState: TasksState = {
  items: [],
  status: 'idle',
  filters: {},
  sort: { field: 'createdAt', order: 'desc' },
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks(state, action: PayloadAction<Task[]>) {
      state.items = action.payload
    },
    addTask(state, action: PayloadAction<Task>) {
      state.items.unshift(action.payload)
    },
    updateTask(state, action: PayloadAction<Task>) {
      const index = state.items.findIndex((t) => t.id === action.payload.id)
      if (index !== -1) state.items[index] = action.payload
    },
    removeTask(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload)
    },
    toggleTaskComplete(state, action: PayloadAction<string>) {
      const task = state.items.find((t) => t.id === action.payload)
      if (task) {
        task.status = task.status === 'done' ? 'todo' : 'done'
        task.updatedAt = new Date().toISOString()
      }
    },
    setFilters(state, action: PayloadAction<TaskFilters>) {
      state.filters = action.payload
    },
    updateFilters(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters(state) {
      state.filters = {}
    },
    setSort(state, action: PayloadAction<TaskSort>) {
      state.sort = action.payload
    },
    setStatus(state, action: PayloadAction<TasksState['status']>) {
      state.status = action.payload
    },
    addSubtask(state, action: PayloadAction<{ taskId: string; subtask: Subtask }>) {
      const task = state.items.find((t) => t.id === action.payload.taskId)
      if (!task) return
      if (!task.subtasks) task.subtasks = []
      task.subtasks.push(action.payload.subtask)
      task.updatedAt = new Date().toISOString()
    },
    toggleSubtask(state, action: PayloadAction<{ taskId: string; subtaskId: string }>) {
      const task = state.items.find((t) => t.id === action.payload.taskId)
      if (!task) return
      const subtask = task.subtasks?.find((s) => s.id === action.payload.subtaskId)
      if (!subtask) return
      subtask.completed = !subtask.completed
      task.updatedAt = new Date().toISOString()
      const allDone = task.subtasks.length > 0 && task.subtasks.every((s) => s.completed)
      if (allDone && task.status !== 'done') {
        task.status = 'done'
      } else if (!allDone && task.status === 'done') {
        task.status = 'in_progress'
      }
    },
    removeSubtask(state, action: PayloadAction<{ taskId: string; subtaskId: string }>) {
      const task = state.items.find((t) => t.id === action.payload.taskId)
      if (!task) return
      task.subtasks = task.subtasks?.filter((s) => s.id !== action.payload.subtaskId) ?? []
      task.updatedAt = new Date().toISOString()
    },
  },
})

export const {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  toggleTaskComplete,
  setFilters,
  updateFilters,
  clearFilters,
  setSort,
  setStatus,
  addSubtask,
  toggleSubtask,
  removeSubtask,
} = tasksSlice.actions
export default tasksSlice.reducer
