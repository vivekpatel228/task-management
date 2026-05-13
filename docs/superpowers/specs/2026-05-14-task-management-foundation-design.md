# Task Management — Foundation Architecture Design
**Date:** 2026-05-14
**Scope:** Project foundation only — no feature pages

---

## 1. Overview

Set up the reusable, scalable foundation for a frontend-only Task Management System built on Next.js 16 + TypeScript + App Router. No backend. All state persisted to `localStorage` via `redux-persist`.

The goal is a clean architecture that feature pages can slot into without restructuring.

---

## 2. Approach

**Hybrid layer structure** — extend the existing project layout:
- Keep shadcn `components/ui/` untouched
- Add `store/` for Redux
- Expand `lib/` for utilities and constants
- Expand `types/` for domain types
- Add `components/layout/` for the authenticated shell
- Group authenticated routes under `app/(app)/`

---

## 3. Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx           ← authenticated shell layout (SidebarProvider lives here)
│   │   └── dashboard/page.tsx   ← content only, no sidebar wrapper
│   ├── layout.tsx               ← root layout: wraps with <Providers>
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                      ← untouched (shadcn primitives)
│   ├── layout/
│   │   ├── app-header.tsx       ← SidebarTrigger + dynamic Breadcrumb
│   │   └── app-sidebar.tsx      ← relabeled task-management sidebar (replaces components/app-sidebar.tsx)
│   └── providers.tsx            ← PersistGate + Redux Provider + ThemeProvider + TooltipProvider
│
├── store/
│   ├── index.ts                 ← configureStore + redux-persist root config
│   ├── hooks.ts                 ← useAppDispatch, useAppSelector
│   └── slices/
│       ├── tasks.slice.ts
│       ├── auth.slice.ts
│       ├── ui.slice.ts
│       └── settings.slice.ts
│
├── types/
│   ├── task.types.ts
│   ├── auth.types.ts
│   └── index.ts                 ← re-exports all types
│
├── lib/
│   ├── utils.ts                 ← existing cn() + new helpers
│   └── constants.ts             ← routes, labels, colors, app config
│
└── hooks/
    ├── use-mobile.ts            ← existing
    ├── use-local-storage.ts     ← generic typed hook
    └── use-app-sidebar.ts       ← sidebar state convenience hook
```

---

## 4. Redux Store

### 4.1 Persistence Strategy
- Library: `redux-persist` with `localStorage` storage engine
- `tasks` slice — persisted
- `auth` slice — persisted
- `settings` slice — persisted
- `ui` slice — **not persisted** (resets each session)

### 4.2 Slice Shapes

```ts
// tasks.slice.ts
{
  items: Task[]
  status: 'idle' | 'loading' | 'error'
  filters: TaskFilters
}

// auth.slice.ts
{
  user: User | null
  isAuthenticated: boolean
}

// ui.slice.ts
{
  sidebarOpen: boolean
  activeView: 'list' | 'board' | 'calendar'
}

// settings.slice.ts
{
  defaultView: 'list' | 'board'
  colorScheme: string
  notificationsEnabled: boolean
  theme: 'light' | 'dark' | 'system'   ← theme lives here, controlled from settings page
}
```

### 4.3 Typed Hooks (`store/hooks.ts`)
- `useAppDispatch` — returns typed `AppDispatch`
- `useAppSelector` — typed against `RootState`

---

## 5. Types

### `types/task.types.ts`
```ts
type Priority = 'low' | 'medium' | 'high' | 'urgent'
type Status   = 'todo' | 'in_progress' | 'in_review' | 'done'

interface Label {
  id: string
  name: string
  color: string
}

interface Task {
  id: string
  title: string
  description?: string
  status: Status
  priority: Priority
  labels: Label[]
  assigneeId?: string
  dueDate?: string       // ISO string
  createdAt: string
  updatedAt: string
  projectId?: string
}

interface TaskFilters {
  status?: Status[]
  priority?: Priority[]
  assigneeId?: string
  labelIds?: string[]
  search?: string
}
```

### `types/auth.types.ts`
```ts
interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
}
```

---

## 6. Utilities & Constants

### `lib/constants.ts`
```ts
APP_NAME     = 'TaskFlow'
PERSIST_KEY  = 'taskflow-root'

APP_ROUTES   = { home, login, signup, dashboard, tasks, settings }

PRIORITY_LABELS = { low, medium, high, urgent }
STATUS_LABELS   = { todo, in_progress, in_review, done }
PRIORITY_COLORS = { low: 'blue', medium: 'yellow', high: 'orange', urgent: 'red' }
STATUS_COLORS   = { todo: 'slate', in_progress: 'blue', in_review: 'purple', done: 'green' }
```

### `lib/utils.ts` additions
```ts
formatDate(iso: string): string           // "May 14, 2026"
formatRelativeDate(iso: string): string   // "2 days ago"
generateId(): string                      // crypto.randomUUID()
isOverdue(dueDate: string): boolean
```

### `hooks/use-local-storage.ts`
Generic: `useLocalStorage<T>(key, initialValue)` → `[value, setValue, removeValue]`

### `hooks/use-app-sidebar.ts`
Convenience hook over `useAppSelector` + `useAppDispatch` for sidebar open/close state.

---

## 7. Layout Shell

### Routing Groups
- `app/(auth)/` — unauthenticated pages (login, signup). Uses root layout only.
- `app/(app)/` — authenticated pages. Has its own `layout.tsx` with the full shell.

### `app/(app)/layout.tsx`
Contains `SidebarProvider` + `AppSidebar` + `SidebarInset`. Header is fixed inside `SidebarInset`. `{children}` renders in the scrollable content area. Only children re-render on navigation — sidebar and header stay mounted.

### `components/layout/app-sidebar.tsx`
Keeps the existing shadcn sidebar structure. Relabeled for task management:
```
NavMain:      Dashboard · My Tasks · Projects · Board · Calendar
NavSecondary: Settings · Help
Footer:       NavUser (avatar, name, email)
```
Uses Next.js `<Link>` for all nav items (client-side navigation, no reload).
On mobile: shadcn's built-in Sheet behavior activates automatically — no extra component needed.

### `components/layout/app-header.tsx`
- `SidebarTrigger` + vertical separator + dynamic `Breadcrumb`
- Breadcrumb accepts `segments: { label: string; href?: string }[]` prop
- No theme toggle in header

### Theme Control
- Theme lives in `settings.slice.ts`
- UI control deferred to the settings page (not part of the shell)
- `next-themes` `ThemeProvider` reads from the store via `settings.theme`

---

## 8. Out of Scope (This Spec)

- Feature pages (tasks list, board, calendar, project pages)
- Authentication logic / route guards
- API integration
- Test setup
