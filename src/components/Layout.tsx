import { Outlet } from 'react-router-dom'
import TabBar from './TabBar'
import { useApp } from '../context/AppContext'
import { getLevelForPoints, getNextLevel } from '../utils/points'

export default function Layout() {
  const { state } = useApp()
  const level = getLevelForPoints(state.profile.totalPoints)
  const next = getNextLevel(level.level)
  const progress = next
    ? ((state.profile.totalPoints - level.threshold) / (next.threshold - level.threshold)) * 100
    : 100

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-surface-light)] bg-[var(--color-bg)]/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[var(--color-primary-light)]">WeeklyWin</h1>
            {state.profile.name && (
              <p className="text-xs text-[var(--color-text-muted)]">
                {state.profile.name} · Lv {level.level} {level.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--color-accent)]">⭐ {state.profile.currentPoints}</span>
            {state.profile.streakDays > 0 && (
              <span>🔥 {state.profile.streakDays}</span>
            )}
          </div>
        </div>
        {/* XP bar */}
        <div className="mx-auto mt-1 max-w-lg">
          <div className="h-1 rounded-full bg-[var(--color-surface-light)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 pb-20">
        <Outlet />
      </main>

      <TabBar />
    </div>
  )
}
