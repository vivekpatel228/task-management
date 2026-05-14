'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { APP_ROUTES } from '@/lib/constants'

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(!isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      setShouldRender(false)
      router.replace(APP_ROUTES.dashboard)
    } else {
      setShouldRender(true)
    }
  }, [isAuthenticated, router])

  if (!shouldRender) return null
  return <>{children}</>
}
