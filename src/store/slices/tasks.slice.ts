import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Task, TaskFilters } from '@/types'

interface TasksState {
  items: Task[]
  status: 'idle' | 'loading' | 'error'
  filters: TaskFilters
}

const initialState: TasksState = {
  items: [],
  status: 'idle',
  filters: {},
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
    setFilters(state, action: PayloadAction<TaskFilters>) {
      state.filters = action.payload
    },
    clearFilters(state) {
      state.filters = {}
    },
    setStatus(state, action: PayloadAction<TasksState['status']>) {
      state.status = action.payload
    },
  },
})

export const { setTasks, addTask, updateTask, removeTask, setFilters, clearFilters, setStatus } =
  tasksSlice.actions
export default tasksSlice.reducer
