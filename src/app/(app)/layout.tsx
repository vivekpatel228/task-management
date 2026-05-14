import type { ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { AuthGuard } from '@/components/auth-guard'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="max-h-[calc(100vh-1rem)] flex-1 overflow-hidden">
        <AppHeader />
        <AuthGuard>
          <div className="flex flex-1 flex-col overflow-y-auto">
            {children}
          </div>
        </AuthGuard>
      </SidebarInset>
    </SidebarProvider>
  )
}
