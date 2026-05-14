import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSidebarOpen, toggleSidebar, setActiveView } from '@/store/slices/ui.slice'
import type { ActiveView } from '@/types'

export function useAppSidebarState() {
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen)
  const activeView = useAppSelector((state) => state.ui.activeView)

  return {
    sidebarOpen,
    activeView,
    open: () => dispatch(setSidebarOpen(true)),
    close: () => dispatch(setSidebarOpen(false)),
    toggle: () => dispatch(toggleSidebar()),
    setView: (view: ActiveView) => dispatch(setActiveView(view)),
  }
}
