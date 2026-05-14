'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { PROJECT_STATUS_LABELS, PROJECT_COLORS } from '@/lib/constants'
import type { Project, ProjectStatus } from '@/types'

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  color: z.string().min(1, 'Color is required'),
  status: z.enum(['active', 'on_hold', 'completed', 'cancelled'] as const),
  deadline: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
  onSave: (values: ProjectFormValues & { id?: string }) => void
}

const statuses: ProjectStatus[] = ['active', 'on_hold', 'completed', 'cancelled']

export function ProjectDialog({ open, onOpenChange, project, onSave }: ProjectDialogProps) {
  const isEditing = !!project

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      color: PROJECT_COLORS[0],
      status: 'active',
      deadline: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: project?.name ?? '',
        description: project?.description ?? '',
        color: project?.color ?? PROJECT_COLORS[0],
        status: project?.status ?? 'active',
        deadline: project?.deadline ?? '',
      })
    }
  }, [open, project, reset])

  const selectedColor = watch('color')

  function onSubmit(values: ProjectFormValues) {
    onSave({ ...values, id: project?.id })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Project' : 'New Project'}</DialogTitle>
        </DialogHeader>

        <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="proj-name"
              placeholder="Project name"
              {...register('name')}
              className={cn(errors.name && 'border-destructive')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-desc">Description</Label>
            <Textarea
              id="proj-desc"
              placeholder="What is this project about?"
              rows={2}
              {...register('description')}
              className="resize-none"
            />
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <Label>Color</Label>
            <Controller
              control={control}
              name="color"
              render={() => (
                <div className="flex flex-wrap gap-2">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('color', color, { shouldDirty: true })}
                      className={cn(
                        'h-7 w-7 rounded-full transition-all ring-offset-2 ring-offset-background focus:outline-none',
                        selectedColor === color
                          ? 'ring-2 ring-foreground scale-110'
                          : 'hover:scale-110',
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          {/* Status & Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {PROJECT_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proj-deadline">Deadline</Label>
              <Input id="proj-deadline" type="date" {...register('deadline')} />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="project-form">
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
