'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ProjectArchiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  projectName?: string
  isArchiving: boolean
}

export function ProjectArchiveDialog({
  open,
  onOpenChange,
  onConfirm,
  projectName,
  isArchiving,
}: ProjectArchiveDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isArchiving ? 'Archive Project' : 'Unarchive Project'}</AlertDialogTitle>
          <AlertDialogDescription>
            {isArchiving ? (
              <>
                Archive{' '}
                {projectName && (
                  <span className="font-medium text-foreground">&ldquo;{projectName}&rdquo;</span>
                )}
                ? It will be hidden from the active list but all data is preserved.
              </>
            ) : (
              <>
                Unarchive{' '}
                {projectName && (
                  <span className="font-medium text-foreground">&ldquo;{projectName}&rdquo;</span>
                )}
                ? It will be moved back to your active projects.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isArchiving ? 'Archive' : 'Unarchive'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
