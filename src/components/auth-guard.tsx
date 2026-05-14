'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { APP_ROUTES } from '@/lib/constants'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setReady(false)
      router.replace(APP_ROUTES.login)
    } else {
      setReady(true)
    }
  }, [isAuthenticated, router])

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
