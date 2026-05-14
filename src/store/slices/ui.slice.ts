import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ActiveView } from '@/types'

interface UIState {
  sidebarOpen: boolean
  activeView: ActiveView
}

const initialState: UIState = {
  sidebarOpen: true,
  activeView: 'list',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setActiveView(state, action: PayloadAction<ActiveView>) {
      state.activeView = action.payload
    },
  },
})

export const { setSidebarOpen, toggleSidebar, setActiveView } = uiSlice.actions
export default uiSlice.reducer
