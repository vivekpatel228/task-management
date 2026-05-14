'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CalendarIcon, MailIcon, UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateProfile } from '@/store/slices/auth.slice'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileSchema>

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatJoinDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const [avatarPreview, setAvatarPreview] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      bio: user?.bio ?? '',
      avatarUrl: user?.avatarUrl ?? '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        bio: user.bio ?? '',
        avatarUrl: user.avatarUrl ?? '',
      })
      setAvatarPreview(user.avatarUrl ?? '')
    }
  }, [user, reset])

  const watchedAvatarUrl = watch('avatarUrl')
  useEffect(() => {
    setAvatarPreview(watchedAvatarUrl ?? '')
  }, [watchedAvatarUrl])

  function onSubmit(values: ProfileFormValues) {
    dispatch(
      updateProfile({
        name: values.name,
        bio: values.bio || undefined,
        avatarUrl: values.avatarUrl || undefined,
      }),
    )
    reset(values)
    toast.success('Profile updated')
  }

  if (!user) return null

  const initials = getInitials(user.name)

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information</p>
      </div>

      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* Avatar + identity card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Your Identity</CardTitle>
            <CardDescription>How you appear across the app</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Avatar display */}
            <div className="mb-6 flex items-center gap-5">
              <Avatar className="h-20 w-20 rounded-xl text-xl">
                <AvatarImage src={avatarPreview} alt={user.name} />
                <AvatarFallback className="rounded-xl text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                {user.createdAt && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    Joined {formatJoinDate(user.createdAt)}
                  </p>
                )}
              </div>
            </div>

            <Separator className="mb-6" />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  <UserIcon className="mr-1.5 inline h-3.5 w-3.5" />
                  Display Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Email — read-only */}
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  <MailIcon className="mr-1.5 inline h-3.5 w-3.5" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={user.email}
                  readOnly
                  disabled
                  className="cursor-not-allowed bg-muted/40 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a little about yourself…"
                  rows={3}
                  className="resize-none"
                  {...register('bio')}
                />
                {errors.bio && (
                  <p className="text-xs text-destructive">{errors.bio.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Max 300 characters</p>
              </div>

              {/* Avatar URL */}
              <div className="space-y-1.5">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  placeholder="https://example.com/avatar.jpg"
                  {...register('avatarUrl')}
                  className={errors.avatarUrl ? 'border-destructive' : ''}
                />
                {errors.avatarUrl && (
                  <p className="text-xs text-destructive">{errors.avatarUrl.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Link to an image — leave empty to use initials
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" disabled={!isDirty}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account stats card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountStats userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AccountStats({ userId }: { userId: string }) {
  const tasks = useAppSelector((s) => s.tasks.items)
  const projects = useAppSelector((s) => s.projects.items)

  const personalTasks = tasks.filter((t) => !t.projectId)
  const doneTasks = tasks.filter((t) => t.status === 'done')
  const activeProjects = projects.filter((p) => !p.isArchived)

  const stats = [
    { label: 'Personal Tasks', value: personalTasks.length },
    { label: 'Tasks Completed', value: doneTasks.length },
    { label: 'Active Projects', value: activeProjects.length },
    { label: 'Total Tasks', value: tasks.length },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg bg-muted/40 px-3 py-3 text-center">
          <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
