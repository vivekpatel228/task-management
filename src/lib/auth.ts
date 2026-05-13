import type { StoredUser } from '@/types'

const USERS_KEY = 'taskflow-users'
const TOKEN_KEY = 'taskflow-auth-token'

export function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as StoredUser[]) : []
  } catch {
    return []
  }
}

export function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function saveAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
