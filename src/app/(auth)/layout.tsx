'use client'

import { type ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { APP_ROUTES } from '@/lib/constants'

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(APP_ROUTES.dashboard)
    }
  }, [isAuthenticated, router])

  return <>{children}</>
}
