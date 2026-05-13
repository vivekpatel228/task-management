"use client"

import { Fragment } from "react"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { APP_ROUTES } from "@/lib/constants"

const ROUTE_LABELS: Record<string, string> = {
  [APP_ROUTES.dashboard]: "Dashboard",
  [APP_ROUTES.tasks]: "My Tasks",
  [APP_ROUTES.settings]: "Settings",
}

interface BreadcrumbSegment {
  label: string
  href?: string
}

interface AppHeaderProps {
  segments?: BreadcrumbSegment[]
}

export function AppHeader({ segments }: AppHeaderProps) {
  const pathname = usePathname()

  const resolvedSegments: BreadcrumbSegment[] = segments ?? [
    { label: ROUTE_LABELS[pathname] ?? "Page" },
  ]

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {resolvedSegments.map((segment, index) => (
            <Fragment key={segment.label}>
              <BreadcrumbItem>
                {index < resolvedSegments.length - 1 ? (
                  <BreadcrumbLink href={segment.href ?? "#"}>
                    {segment.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < resolvedSegments.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
