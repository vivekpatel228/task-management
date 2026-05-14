import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Project } from '@/types'

interface ProjectsState {
  items: Project[]
}

const initialState: ProjectsState = {
  items: [
    { id: '1', name: 'Website Redesign', color: '#6366f1' },
    { id: '2', name: 'Mobile App', color: '#f59e0b' },
    { id: '3', name: 'API Integration', color: '#10b981' },
    { id: '4', name: 'Marketing Campaign', color: '#ef4444' },
  ],
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<Project[]>) {
      state.items = action.payload
    },
    addProject(state, action: PayloadAction<Project>) {
      state.items.push(action.payload)
    },
    removeProject(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== action.payload)
    },
  },
})

export const { setProjects, addProject, removeProject } = projectsSlice.actions
export default projectsSlice.reducer
