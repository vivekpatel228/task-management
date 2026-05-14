'use client'

import * as React from 'react'
import {
  LayoutDashboardIcon,
  CheckSquareIcon,
  FolderIcon,
  KanbanIcon,
  CalendarIcon,
  Settings2Icon,
  HelpCircleIcon,
  ClipboardListIcon,
} from 'lucide-react'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { APP_ROUTES, APP_NAME } from '@/lib/constants'
import { useAppSelector } from '@/store/hooks'

const navMain = [
  { title: 'Dashboard', url: APP_ROUTES.dashboard, icon: <LayoutDashboardIcon />, isActive: true },
  { title: 'My Tasks', url: APP_ROUTES.tasks, icon: <CheckSquareIcon /> },
  { title: 'Projects', url: '#', icon: <FolderIcon /> },
  { title: 'Board', url: '#', icon: <KanbanIcon /> },
  { title: 'Calendar', url: '#', icon: <CalendarIcon /> },
]

const navSecondary = [
  { title: 'Settings', url: APP_ROUTES.settings, icon: <Settings2Icon /> },
  { title: 'Help', url: '#', icon: <HelpCircleIcon /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAppSelector((state) => state.auth.user)

  const navUser = {
    name: user?.name ?? 'Guest',
    email: user?.email ?? '',
    avatar: user?.avatarUrl ?? '',
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ClipboardListIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{APP_NAME}</span>
                  <span className="truncate text-xs">Task Management</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
