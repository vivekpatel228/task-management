import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/types'

interface AuthSliceState {
  user: User | null
  isAuthenticated: boolean
}

const initialState: AuthSliceState = {
  user: null,
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
    clearUser(state) {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { setUser, clearUser } = authSlice.actions
export default authSlice.reducer
