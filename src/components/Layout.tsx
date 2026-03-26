import { Outlet } from 'react-router-dom'
import TabBar from './TabBar'
import { useApp } from '../context/AppContext'
import { getLevelForPoints, getNextLevel } from '../utils/points'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Layout() {
  const { state } = useApp()
  const level = getLevelForPoints(state.profile.totalPoints)
  const next = getNextLevel(level.level)
  const progress = next
    ? ((state.profile.totalPoints - level.threshold) / (next.threshold - level.threshold)) * 100
    : 100
  const initial = state.profile.name ? state.profile.name.charAt(0).toUpperCase() : '?'

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg)] px-5 pb-3 pt-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              {state.profile.name ? `${state.profile.name}'s Week` : 'WeeklyWin'}
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-3.5 py-1.5">
              <span className="text-sm text-white">⭐</span>
              <span className="text-sm font-semibold text-white">{state.profile.currentPoints}</span>
            </div>
            {state.profile.streakDays > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-[var(--color-accent)]/10 px-3 py-1.5">
                <span className="text-sm">🔥</span>
                <span className="text-sm font-semibold text-[var(--color-accent)]">{state.profile.streakDays}</span>
              </div>
            )}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-base font-bold text-white">
              {initial}
            </div>
          </div>
        </div>
        {/* XP bar */}
        <div className="mx-auto mt-3 max-w-lg">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
            <span>Lv {level.level} · {level.name}</span>
            <span>{next ? `${state.profile.totalPoints}/${next.threshold}` : 'MAX'}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto w-full max-w-lg flex-1 px-5 py-4 pb-24">
        <Outlet />
      </main>

      <TabBar />
    </div>
  )
}
