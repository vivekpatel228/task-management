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
  },
})

export const { setUser, setToken, clearUser } = authSlice.actions
export default authSlice.reducer
