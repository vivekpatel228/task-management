import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User, AuthState } from '@/types'

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      state.isAuthenticated = true
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload
    },
    clearUser(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
    updateProfile(
      state,
      action: PayloadAction<{ name: string; bio?: string; avatarUrl?: string }>,
    ) {
      if (state.user) {
        state.user.name = action.payload.name
        state.user.bio = action.payload.bio
        state.user.avatarUrl = action.payload.avatarUrl
      }
    },
  },
})

export const { login, setUser, setToken, clearUser, updateProfile } = authSlice.actions
export default authSlice.reducer
