'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { APP_ROUTES } from '@/lib/constants'

export default function RootPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(APP_ROUTES.dashboard)
    } else {
      router.replace(APP_ROUTES.login)
    }
  }, [isAuthenticated, router])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  )
}
