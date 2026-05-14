'use client'

import { useState } from 'react'
import { SearchIcon, SlidersHorizontalIcon, XCircleIcon, CheckIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import type { TaskFilters, TaskSort, Priority, Status, SortField, SortOrder } from '@/types'
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  DEFAULT_LABELS,
  SORT_FIELD_LABELS,
} from '@/lib/constants'

interface TaskFiltersProps {
  filters: TaskFilters
  sort: TaskSort
  onFiltersChange: (filters: TaskFilters) => void
  onSortChange: (sort: TaskSort) => void
}

const priorities: Priority[] = ['low', 'medium', 'high', 'urgent']
const statuses: Status[] = ['todo', 'in_progress', 'in_review', 'done']
const sortFields: SortField[] = ['createdAt', 'dueDate', 'priority', 'title', 'status']

function toggleArrayItem<T>(arr: T[] | undefined, item: T): T[] {
  const current = arr ?? []
  return current.includes(item) ? current.filter((i) => i !== item) : [...current, item]
}

export function TaskFiltersBar({ filters, sort, onFiltersChange, onSortChange }: TaskFiltersProps) {
  const [filterOpen, setFilterOpen] = useState(false)

  const activeFilterCount =
    (filters.status?.length ?? 0) +
    (filters.priority?.length ?? 0) +
    (filters.labelIds?.length ?? 0)

  function handleSearch(value: string) {
    onFiltersChange({ ...filters, search: value || undefined })
  }

  function toggleStatus(status: Status) {
    onFiltersChange({ ...filters, status: toggleArrayItem(filters.status, status) })
  }

  function togglePriority(priority: Priority) {
    onFiltersChange({ ...filters, priority: toggleArrayItem(filters.priority, priority) })
  }

  function toggleLabel(id: string) {
    onFiltersChange({ ...filters, labelIds: toggleArrayItem(filters.labelIds, id) })
  }

  function clearAll() {
    onFiltersChange({})
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={filters.search ?? ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter popover */}
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative gap-2 shrink-0">
            <SlidersHorizontalIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <Badge className="h-4 min-w-4 px-1 text-[10px]">{activeFilterCount}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="start">
          <div className="space-y-4">
            {/* Status */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              <div className="flex flex-wrap gap-1.5">
                {statuses.map((s) => {
                  const active = filters.status?.includes(s)
                  return (
                    <button
                      key={s}
                      onClick={() => toggleStatus(s)}
                      className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs transition-colors ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      {active && <CheckIcon className="h-3 w-3" />}
                      {STATUS_LABELS[s]}
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Priority */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Priority
              </p>
              <div className="flex flex-wrap gap-1.5">
                {priorities.map((p) => {
                  const active = filters.priority?.includes(p)
                  return (
                    <button
                      key={p}
                      onClick={() => togglePriority(p)}
                      className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs transition-colors ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      {active && <CheckIcon className="h-3 w-3" />}
                      {PRIORITY_LABELS[p]}
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Labels */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Labels
              </p>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_LABELS.map((label) => {
                  const active = filters.labelIds?.includes(label.id)
                  return (
                    <button
                      key={label.id}
                      onClick={() => toggleLabel(label.id)}
                      className={`flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs transition-colors ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: active ? 'currentColor' : label.color }}
                      />
                      {active && <CheckIcon className="h-3 w-3" />}
                      {label.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <>
                <Separator />
                <button
                  onClick={clearAll}
                  className="flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <XCircleIcon className="h-3.5 w-3.5" />
                  Clear all filters
                </button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Sort */}
      <Select
        value={`${sort.field}:${sort.order}`}
        onValueChange={(v) => {
          const [field, order] = v.split(':') as [SortField, SortOrder]
          onSortChange({ field, order })
        }}
      >
        <SelectTrigger className="h-9 w-auto shrink-0 gap-1.5 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortFields.flatMap((field) => [
            <SelectItem key={`${field}:desc`} value={`${field}:desc`}>
              {SORT_FIELD_LABELS[field]} ↓
            </SelectItem>,
            <SelectItem key={`${field}:asc`} value={`${field}:asc`}>
              {SORT_FIELD_LABELS[field]} ↑
            </SelectItem>,
          ])}
        </SelectContent>
      </Select>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <XCircleIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      )}
    </div>
  )
}
