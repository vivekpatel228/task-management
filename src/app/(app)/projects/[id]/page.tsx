'use client'

import { useParams } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const project = useAppSelector((state) =>
    state.projects.items.find((p) => p.id === id)
  )

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">
        {project?.name ?? 'Project'} — Tasks
      </h1>
      <div className="min-h-96 flex-1 rounded-xl bg-muted/50" />
    </div>
  )
}
