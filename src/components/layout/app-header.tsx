"use client"

import { Fragment } from "react"
import { usePathname } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
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

interface BreadcrumbSegment {
  label: string
  href?: string
}

interface AppHeaderProps {
  segments?: BreadcrumbSegment[]
}

export function AppHeader({ segments }: AppHeaderProps) {
  const pathname = usePathname()
  const projects = useAppSelector((state) => state.projects.items)

  function resolveSegments(): BreadcrumbSegment[] {
    if (segments) return segments

    const projectDetailMatch = pathname.match(/^\/projects\/(.+)$/)
    if (projectDetailMatch) {
      const id = projectDetailMatch[1]
      const project = projects.find((p) => p.id === id)
      return [
        { label: "Projects", href: APP_ROUTES.projects },
        { label: project?.name ?? "Project" },
      ]
    }

    const staticLabels: Record<string, string> = {
      [APP_ROUTES.dashboard]: "Dashboard",
      [APP_ROUTES.tasks]: "Tasks",
      [APP_ROUTES.projects]: "Projects",
      [APP_ROUTES.settings]: "Settings",
    }

    return [{ label: staticLabels[pathname] ?? "Page" }]
  }

  const resolvedSegments = resolveSegments()

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
