'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  AlertTriangleIcon,
  CalendarIcon,
  LogOutIcon,
  MailIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateProfile, clearUser } from '@/store/slices/auth.slice'
import { setTheme as setReduxTheme } from '@/store/slices/settings.slice'
import { setTasks } from '@/store/slices/tasks.slice'
import { setProjects } from '@/store/slices/projects.slice'
import { removeAuthToken } from '@/lib/auth'
import { APP_ROUTES } from '@/lib/constants'
import type { Theme } from '@/types'
import { cn } from '@/lib/utils'

// ─── Profile form ────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})
type ProfileFormValues = z.infer<typeof profileSchema>

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatJoinDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function ProfileTab() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const tasks = useAppSelector((s) => s.tasks.items)
  const projects = useAppSelector((s) => s.projects.items)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ?? '')

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
      reset({ name: user.name, bio: user.bio ?? '', avatarUrl: user.avatarUrl ?? '' })
      setAvatarPreview(user.avatarUrl ?? '')
    }
  }, [user, reset])

  const watchedUrl = watch('avatarUrl')
  useEffect(() => { setAvatarPreview(watchedUrl ?? '') }, [watchedUrl])

  function onSubmit(values: ProfileFormValues) {
    dispatch(updateProfile({
      name: values.name,
      bio: values.bio || undefined,
      avatarUrl: values.avatarUrl || undefined,
    }))
    reset(values)
    toast.success('Profile updated')
  }

  if (!user) return null

  const personalTasks = tasks.filter((t) => !t.projectId)
  const doneTasks = tasks.filter((t) => t.status === 'done')
  const activeProjects = projects.filter((p) => !p.isArchived)
  const stats = [
    { label: 'Personal Tasks', value: personalTasks.length },
    { label: 'Completed', value: doneTasks.length },
    { label: 'Active Projects', value: activeProjects.length },
    { label: 'Total Tasks', value: tasks.length },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Personal Information</CardTitle>
          <CardDescription>Update your name, bio, and avatar</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Avatar + identity */}
          <div className="mb-6 flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-xl">
              <AvatarImage src={avatarPreview} alt={user.name} />
              <AvatarFallback className="rounded-xl text-lg font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              {user.createdAt && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarIcon className="h-3 w-3" />
                  Joined {formatJoinDate(user.createdAt)}
                </p>
              )}
            </div>
          </div>

          <Separator className="mb-6" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

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
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a little about yourself…"
                rows={3}
                className="resize-none"
                {...register('bio')}
              />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
              <p className="text-xs text-muted-foreground">Max 300 characters</p>
            </div>

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
                Leave empty to use initials
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={!isDirty}>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-muted/40 px-3 py-3 text-center">
                <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Theme options ────────────────────────────────────────────────────────────

const themeOptions: { value: Theme; label: string; preview: React.ReactNode }[] = [
  {
    value: 'light',
    label: 'Light',
    preview: (
      <div className="flex h-16 w-full flex-col gap-1.5 rounded-md border bg-white p-2 shadow-sm">
        <div className="h-2 w-10 rounded bg-slate-200" />
        <div className="h-2 w-16 rounded bg-slate-100" />
        <div className="mt-auto flex gap-1">
          <div className="h-4 w-8 rounded bg-slate-800" />
          <div className="h-4 w-8 rounded bg-slate-200" />
        </div>
      </div>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    preview: (
      <div className="flex h-16 w-full flex-col gap-1.5 rounded-md border border-slate-700 bg-slate-900 p-2 shadow-sm">
        <div className="h-2 w-10 rounded bg-slate-600" />
        <div className="h-2 w-16 rounded bg-slate-700" />
        <div className="mt-auto flex gap-1">
          <div className="h-4 w-8 rounded bg-slate-100" />
          <div className="h-4 w-8 rounded bg-slate-700" />
        </div>
      </div>
    ),
  },
  {
    value: 'system',
    label: 'System',
    preview: (
      <div className="flex h-16 w-full overflow-hidden rounded-md border shadow-sm">
        <div className="flex w-1/2 flex-col gap-1.5 bg-white p-2">
          <div className="h-2 w-5 rounded bg-slate-200" />
          <div className="h-2 w-8 rounded bg-slate-100" />
        </div>
        <div className="flex w-1/2 flex-col gap-1.5 bg-slate-900 p-2">
          <div className="h-2 w-5 rounded bg-slate-600" />
          <div className="h-2 w-8 rounded bg-slate-700" />
        </div>
      </div>
    ),
  },
]

const themeIcons: Record<Theme, React.ReactNode> = {
  light: <SunIcon className="h-4 w-4" />,
  dark: <MoonIcon className="h-4 w-4" />,
  system: <MonitorIcon className="h-4 w-4" />,
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const settings = useAppSelector((s) => s.settings)
  const user = useAppSelector((s) => s.auth.user)

  const activeTheme = (theme as Theme | undefined) ?? settings.theme

  function handleSetTheme(value: Theme) {
    setTheme(value)
    dispatch(setReduxTheme(value))
  }

  function handleLogout() {
    dispatch(clearUser())
    removeAuthToken()
    toast.info('Logged out')
    router.replace(APP_ROUTES.login)
  }

  function handleClearData() {
    dispatch(setTasks([]))
    dispatch(setProjects([]))
    toast.success('All tasks and projects cleared')
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, preferences, and account</p>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* ── Profile ── */}
          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          {/* ── Appearance ── */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Theme</CardTitle>
                <CardDescription>
                  Choose how the app looks. Saved automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((option) => {
                    const isActive = activeTheme === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSetTheme(option.value)}
                        className={cn(
                          'flex flex-col gap-2 rounded-xl border-2 p-3 text-left transition-all',
                          isActive
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40 hover:bg-accent/40',
                        )}
                      >
                        {option.preview}
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'flex h-4 w-4 items-center justify-center rounded-full border-2',
                              isActive
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/40',
                            )}
                          >
                            {isActive && <span className="block h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                          <span className="text-sm font-medium">{option.label}</span>
                          <span className={cn('ml-auto', isActive ? 'text-primary' : 'text-muted-foreground')}>
                            {themeIcons[option.value]}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Press{' '}
                  <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">D</kbd>{' '}
                  anywhere to toggle dark / light.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Account ── */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Logged in as</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user?.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5"
                    onClick={handleLogout}
                  >
                    <LogOutIcon className="h-3.5 w-3.5" />
                    Log out
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/40">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <AlertTriangleIcon className="h-4 w-4" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  These actions are irreversible. Please be certain before proceeding.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <div>
                    <p className="text-sm font-medium">Clear all data</p>
                    <p className="text-xs text-muted-foreground">
                      Delete all tasks and projects permanently
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="shrink-0"
                    onClick={handleClearData}
                  >
                    Clear Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
