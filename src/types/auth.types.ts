export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  bio?: string
  createdAt: string
}

export interface StoredUser {
  id: string
  name: string
  email: string
  password: string
  avatarUrl?: string
  bio?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
