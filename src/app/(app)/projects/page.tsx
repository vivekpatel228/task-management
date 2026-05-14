'use client'

import { useState, useMemo } from 'react'
import { PlusIcon, LayoutGridIcon, ListIcon, FolderOpenIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/projects/project-card'
import { ProjectListItem } from '@/components/projects/project-list-item'
import { ProjectDialog } from '@/components/projects/project-dialog'
import { ProjectArchiveDialog } from '@/components/projects/project-archive-dialog'
import { ProjectDeleteDialog } from '@/components/projects/project-delete-dialog'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addProject,
  updateProject,
  removeProject,
  archiveProject,
  unarchiveProject,
} from '@/store/slices/projects.slice'
import type { Project } from '@/types'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'list'
type FilterMode = 'all' | 'active' | 'archived'

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

export default function ProjectsPage() {
  const dispatch = useAppDispatch()
  const projects = useAppSelector((s) => s.projects.items)
  const tasks = useAppSelector((s) => s.tasks.items)

  const [view, setView] = useState<ViewMode>('grid')
  const [filter, setFilter] = useState<FilterMode>('active')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [archiveId, setArchiveId] = useState<string | null>(null)
  const [unarchiveId, setUnarchiveId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'active') return projects.filter((p) => !p.isArchived)
    if (filter === 'archived') return projects.filter((p) => p.isArchived)
    return projects
  }, [projects, filter])

  function getTaskStats(projectId: string) {
    const projectTasks = tasks.filter((t) => t.projectId === projectId)
    return {
      taskTotal: projectTasks.length,
      taskDone: projectTasks.filter((t) => t.status === 'done').length,
    }
  }

  function openCreate() {
    setEditingProject(null)
    setDialogOpen(true)
  }

  function openEdit(project: Project) {
    setEditingProject(project)
    setDialogOpen(true)
  }

  function handleSave(values: Parameters<typeof buildProject>[0]) {
    const project = buildProject(values, editingProject)
    if (editingProject) {
      dispatch(updateProject(project))
    } else {
      dispatch(addProject(project))
    }
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

  const counts = {
    all: projects.length,
    active: projects.filter((p) => !p.isArchived).length,
    archived: projects.filter((p) => p.isArchived).length,
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {counts.active} active · {counts.archived} archived
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2 self-start sm:self-auto">
          <PlusIcon className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filter tabs */}
        <div className="flex items-center rounded-lg border bg-muted/40 p-1 gap-0.5">
          {(['all', 'active', 'archived'] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors capitalize',
                filter === f
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f}
              <span className="ml-1.5 text-xs tabular-nums text-muted-foreground">
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-lg border bg-muted/40 p-1 gap-0.5">
          <button
            onClick={() => setView('grid')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              view === 'grid'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label="Grid view"
          >
            <LayoutGridIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              view === 'list'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label="List view"
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Project list */}
      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderOpenIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {filter === 'archived' ? 'No archived projects' : 'No projects yet'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filter === 'archived'
                ? 'Archive a project to see it here.'
                : 'Create your first project to get started.'}
            </p>
          </div>
          {filter !== 'archived' && (
            <Button size="sm" onClick={openCreate} className="gap-2 mt-1">
              <PlusIcon className="h-4 w-4" />
              New Project
            </Button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const stats = getTaskStats(project.id)
            return (
              <ProjectCard
                key={project.id}
                project={project}
                taskTotal={stats.taskTotal}
                taskDone={stats.taskDone}
                onEdit={openEdit}
                onArchive={setArchiveId}
                onUnarchive={setUnarchiveId}
                onDelete={setDeleteId}
              />
            )
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((project) => {
            const stats = getTaskStats(project.id)
            return (
              <ProjectListItem
                key={project.id}
                project={project}
                taskTotal={stats.taskTotal}
                taskDone={stats.taskDone}
                onEdit={openEdit}
                onArchive={setArchiveId}
                onUnarchive={setUnarchiveId}
                onDelete={setDeleteId}
              />
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
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
    </div>
  )
}
