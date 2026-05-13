import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type Theme = 'light' | 'dark' | 'system'
type DefaultView = 'list' | 'board'

interface SettingsState {
  theme: Theme
  defaultView: DefaultView
  colorScheme: string
  notificationsEnabled: boolean
}

const initialState: SettingsState = {
  theme: 'system',
  defaultView: 'list',
  colorScheme: 'neutral',
  notificationsEnabled: true,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload
    },
    setDefaultView(state, action: PayloadAction<DefaultView>) {
      state.defaultView = action.payload
    },
    setColorScheme(state, action: PayloadAction<string>) {
      state.colorScheme = action.payload
    },
    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload
    },
  },
})

export const { setTheme, setDefaultView, setColorScheme, setNotificationsEnabled } =
  settingsSlice.actions
export default settingsSlice.reducer
