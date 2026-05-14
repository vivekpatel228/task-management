# TaskFlow

A frontend-only task management application built with Next.js and React. All data is stored in the browser via localStorage — no backend or database required.

## Features

- **Authentication** — Sign up and log in with client-side credential storage
- **Dashboard** — Stats overview, productivity chart, task breakdown, recent activity, and project summary
- **Task Management** — Create, edit, and delete tasks with statuses, priorities, due dates, labels, and subtasks
- **Projects** — Organize tasks into projects with color coding, deadlines, and archive support
- **Multiple Views** — Switch between list and board (kanban) views for tasks
- **Filtering & Sorting** — Filter by status, priority, label, and search; sort by various fields
- **Settings** — Edit profile (name, bio, avatar), switch themes, and manage account data
- **Dark / Light / System Theme** — Persisted theme preference with a `D` keyboard shortcut to toggle
- **Persistent State** — All tasks, projects, and settings survive page refreshes via Redux Persist

## Tech Stack

| Layer             | Technology                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------- |
| Framework         | [Next.js 16](https://nextjs.org/) (App Router)                                              |
| Language          | [TypeScript 5.9](https://www.typescriptlang.org/)                                           |
| UI Runtime        | [React 19](https://react.dev/)                                                              |
| Styling           | [Tailwind CSS v4](https://tailwindcss.com/)                                                 |
| Component Library | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)                 |
| State Management  | [Redux Toolkit](https://redux-toolkit.js.org/) + [React Redux](https://react-redux.js.org/) |
| Persistence       | [Redux Persist](https://github.com/rt2zz/redux-persist) (localStorage)                      |
| Forms             | [React Hook Form](https://react-hook-form.com/)                                             |
| Validation        | [Zod](https://zod.dev/)                                                                     |
| Charts            | [Recharts](https://recharts.org/)                                                           |
| Icons             | [Lucide React](https://lucide.dev/)                                                         |
| Toasts            | [Sonner](https://sonner.emilkowal.ski/)                                                     |
| Theme             | [next-themes](https://github.com/pacocoursey/next-themes)                                   |
| Fonts             | Geist + Geist Mono (via `next/font/google`)                                                 |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login and signup pages
│   │   ├── login/
│   │   └── signup/
│   └── (app)/           # Protected app pages
│       ├── dashboard/
│       ├── tasks/
│       ├── projects/
│       │   └── [id]/    # Project detail
│       ├── profile/
│       └── settings/
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── dashboard/       # Dashboard widgets
│   ├── tasks/           # Task list, card, sheet, filters
│   ├── projects/        # Project card, dialogs
│   └── layout/          # Sidebar and header
├── store/
│   ├── slices/          # Redux slices (auth, tasks, projects, ui, settings)
│   └── index.ts         # Store configuration with redux-persist
├── lib/
│   ├── auth.ts          # localStorage auth helpers
│   ├── constants.ts     # App-wide constants
│   └── utils.ts         # cn() utility
└── types/               # Shared TypeScript types
```

## Getting Started

**Requirements:** Node.js >= 20

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Create an account on the signup page — no email verification is required.

## Available Scripts

| Script              | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the Next.js development server          |
| `npm run build`     | Build for production                          |
| `npm run start`     | Start the production server                   |
| `npm run lint`      | Run ESLint                                    |
| `npm run format`    | Format all files with Prettier                |
| `npm run typecheck` | Run TypeScript type checking without emitting |

## Data Persistence

All application data is stored in the browser's localStorage under a single Redux Persist key. This means:

- Data is scoped to the browser and device
- Clearing browser storage or using a different browser starts fresh
- No server, API, or database is involved

## Architecture Notes

- **Auth guard** — A client component wraps protected routes and redirects unauthenticated users to `/login`
- **Redux slices** — Five slices manage state: `auth`, `tasks`, `projects`, `ui`, and `settings`; the `ui` slice is excluded from persistence
- **Form validation** — All forms use Zod schemas wired to React Hook Form via `zodResolver`
- **Component library** — UI primitives come from shadcn/ui (built on Radix UI headless components) and are co-located in `src/components/ui/`
