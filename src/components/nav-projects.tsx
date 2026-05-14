"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  MoreHorizontalIcon,
  PlusIcon,
  PencilIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  Trash2Icon,
  ListTodoIcon,
  Frame,
} from "lucide-react"
import { ProjectDialog } from "@/components/projects/project-dialog"
import { ProjectArchiveDialog } from "@/components/projects/project-archive-dialog"
import { ProjectDeleteDialog } from "@/components/projects/project-delete-dialog"
import { useAppDispatch } from "@/store/hooks"
import {
  addProject,
  updateProject,
  removeProject,
  archiveProject,
  unarchiveProject,
} from "@/store/slices/projects.slice"
import type { Project } from "@/types"
import { APP_ROUTES } from "@/lib/constants"

function buildProject(
  values: { name: string; description?: string; color: string; status: Project['status']; deadline?: string; id?: string },
  existing?: Project | null,
): Project {
  const now = new Date().toISOString()
  return {
    id: values.id ?? crypto.randomUUID(),
    name: values.name,
    description: values.description || undefined,
    color: values.color,
    status: values.status,
    deadline: values.deadline || undefined,
    isArchived: existing?.isArchived ?? false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

interface NavProjectsProps {
  projects: Project[]
}

export function NavProjects({ projects }: NavProjectsProps) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()
  const dispatch = useAppDispatch()

  const [createOpen, setCreateOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [archiveId, setArchiveId] = useState<string | null>(null)
  const [unarchiveId, setUnarchiveId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const activeProjects = projects.filter((p) => !p.isArchived)

  function openEdit(project: Project) {
    setEditingProject(project)
  }

  function handleSave(values: Parameters<typeof buildProject>[0]) {
    const project = buildProject(values, editingProject)
    if (editingProject) {
      dispatch(updateProject(project))
    } else {
      dispatch(addProject(project))
    }
    setEditingProject(null)
  }

  function handleArchive() {
    if (archiveId) {
      dispatch(archiveProject(archiveId))
      setArchiveId(null)
    }
  }

  function handleUnarchive() {
    if (unarchiveId) {
      dispatch(unarchiveProject(unarchiveId))
      setUnarchiveId(null)
    }
  }

  function handleDelete() {
    if (deleteId) {
      dispatch(removeProject(deleteId))
      setDeleteId(null)
    }
  }

  const archivingProject = projects.find((p) => p.id === archiveId)
  const unarchivingProject = projects.find((p) => p.id === unarchiveId)
  const deletingProject = projects.find((p) => p.id === deleteId)

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between pr-1">
          <SidebarGroupLabel className="flex items-center gap-2">
            <Frame className="h-4 w-4" />
            <span className="font-medium text-sm">Projects</span>
          </SidebarGroupLabel>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            aria-label="New project"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        <SidebarMenu>
          {activeProjects.length === 0 && (
            <li className="px-2 py-1">
              <button
                onClick={() => setCreateOpen(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                + New project
              </button>
            </li>
          )}
          {activeProjects.map((project) => {
            const url = APP_ROUTES.projectDetail(project.id)
            const isActive = pathname === url
            return (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={url}>
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </Link>
                </SidebarMenuButton>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover className="aria-expanded:bg-muted">
                      <MoreHorizontalIcon />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem asChild>
                      <Link href={url}>
                        <ListTodoIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        View Tasks
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEdit(project)}>
                      <PencilIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setArchiveId(project.id)}>
                      <ArchiveIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteId(project.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2Icon className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )
          })}

          {projects.some((p) => p.isArchived) && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`${APP_ROUTES.projects}?filter=archived`} className="text-muted-foreground">
                  <ArchiveRestoreIcon className="h-4 w-4" />
                  <span>Archived</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>

      {/* Dialogs */}
      <ProjectDialog
        open={createOpen || !!editingProject}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false)
            setEditingProject(null)
          }
        }}
        project={editingProject}
        onSave={handleSave}
      />

      <ProjectArchiveDialog
        open={!!archiveId}
        onOpenChange={(open) => !open && setArchiveId(null)}
        onConfirm={handleArchive}
        projectName={archivingProject?.name}
        isArchiving={true}
      />

      <ProjectArchiveDialog
        open={!!unarchiveId}
        onOpenChange={(open) => !open && setUnarchiveId(null)}
        onConfirm={handleUnarchive}
        projectName={unarchivingProject?.name}
        isArchiving={false}
      />

      <ProjectDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        projectName={deletingProject?.name}
      />
    </>
  )
}
