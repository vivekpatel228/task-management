'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Task, Priority, Status, Label as LabelType } from '@/types'
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  DEFAULT_LABELS,
} from '@/lib/constants'
import { cn } from '@/lib/utils'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done'] as const),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
  dueDate: z.string().optional(),
  labelIds: z.array(z.string()),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface TaskSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  onSave: (values: TaskFormValues & { id?: string }) => void
}

export function TaskSheet({ open, onOpenChange, task, onSave }: TaskSheetProps) {
  const isEditing = !!task
  const [labelsOpen, setLabelsOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      labelIds: [],
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        title: task?.title ?? '',
        description: task?.description ?? '',
        status: task?.status ?? 'todo',
        priority: task?.priority ?? 'medium',
        dueDate: task?.dueDate ?? '',
        labelIds: task?.labels.map((l) => l.id) ?? [],
      })
    }
  }, [open, task, reset])

  const selectedLabelIds = watch('labelIds')

  function toggleLabel(id: string) {
    const current = selectedLabelIds
    setValue(
      'labelIds',
      current.includes(id) ? current.filter((l) => l !== id) : [...current, id],
      { shouldDirty: true },
    )
  }

  function onSubmit(values: TaskFormValues) {
    onSave({ ...values, id: task?.id })
    onOpenChange(false)
  }

  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent']
  const statuses: Status[] = ['todo', 'in_progress', 'in_review', 'done']

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0" side="right">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{isEditing ? 'Edit Task' : 'New Task'}</SheetTitle>
        </SheetHeader>

        <form
          id="task-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
        >
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              {...register('title')}
              className={cn(errors.title && 'border-destructive')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              rows={3}
              {...register('description')}
              className="resize-none"
            />
          </div>

          {/* Status & Priority */}
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
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PRIORITY_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" {...register('dueDate')} />
          </div>

          {/* Labels */}
          <div className="space-y-1.5">
            <Label>Labels</Label>
            <Popover open={labelsOpen} onOpenChange={setLabelsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                  type="button"
                >
                  {selectedLabelIds.length > 0
                    ? `${selectedLabelIds.length} selected`
                    : 'Select labels'}
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-1" align="start">
                {DEFAULT_LABELS.map((label) => {
                  const selected = selectedLabelIds.includes(label.id)
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="flex-1 text-left">{label.name}</span>
                      {selected && <CheckIcon className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  )
                })}
              </PopoverContent>
            </Popover>

            {selectedLabelIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedLabelIds.map((id) => {
                  const label = DEFAULT_LABELS.find((l) => l.id === id)
                  if (!label) return null
                  return (
                    <Badge
                      key={id}
                      variant="outline"
                      className="gap-1 text-xs"
                      style={{ borderColor: label.color + '60', color: label.color }}
                    >
                      {label.name}
                      <button
                        type="button"
                        onClick={() => toggleLabel(id)}
                        className="rounded-full hover:opacity-70"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        </form>

        <SheetFooter className="border-t px-6 py-4">
          <SheetClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </SheetClose>
          <Button type="submit" form="task-form">
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
