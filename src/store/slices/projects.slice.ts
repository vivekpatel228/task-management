import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Project } from '@/types'

interface ProjectsState {
  items: Project[]
}

const initialState: ProjectsState = {
  items: [],
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<Project[]>) {
      state.items = action.payload
    },
    addProject(state, action: PayloadAction<Project>) {
      state.items.unshift(action.payload)
    },
    updateProject(state, action: PayloadAction<Project>) {
      const index = state.items.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) state.items[index] = action.payload
    },
    removeProject(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== action.payload)
    },
    archiveProject(state, action: PayloadAction<string>) {
      const project = state.items.find((p) => p.id === action.payload)
      if (project) {
        project.isArchived = true
        project.updatedAt = new Date().toISOString()
      }
    },
    unarchiveProject(state, action: PayloadAction<string>) {
      const project = state.items.find((p) => p.id === action.payload)
      if (project) {
        project.isArchived = false
        project.updatedAt = new Date().toISOString()
      }
    },
  },
})

export const {
  setProjects,
  addProject,
  updateProject,
  removeProject,
  archiveProject,
  unarchiveProject,
} = projectsSlice.actions
export default projectsSlice.reducer
