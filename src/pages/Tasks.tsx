import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { getPointsForTask } from '../utils/points'
import { formatDayShort, getAllDays } from '../utils/dates'
import type { Category, DayOfWeek } from '../types'

const CATEGORY_ICONS: Record<string, string> = {
  school: '📐',
  activity: '⚽',
  chore: '🧹',
}

export default function Tasks() {
  const { state, dispatch, currentWeekKey, currentWeek } = useApp()
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all')
  const [filterDay, setFilterDay] = useState<DayOfWeek | 'all'>('all')

  if (!currentWeek) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <span className="text-6xl">✅</span>
        <p className="text-base text-[var(--color-text-muted)]">No tasks yet. Plan your week first!</p>
      </div>
    )
  }

  let tasks = [...currentWeek.tasks]

  if (filterCategory !== 'all') {
    tasks = tasks.filter(t => t.category === filterCategory)
  }
  if (filterStatus === 'pending') {
    tasks = tasks.filter(t => !t.completed)
  } else if (filterStatus === 'completed') {
    tasks = tasks.filter(t => t.completed)
  }
  if (filterDay !== 'all') {
    tasks = tasks.filter(t => t.days.includes(filterDay))
  }

  const totalTasks = currentWeek.tasks.length
  const completedTasks = currentWeek.tasks.filter(t => t.completed).length
  const progressPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div>
      {/* Weekly progress */}
      <div className="mb-5 rounded-2xl bg-[var(--color-surface)] p-5">
        <div className="mb-2 flex items-center justify-between text-base">
          <span className="font-medium">Weekly Progress</span>
          <span className="text-[var(--color-text-muted)]">{completedTasks} of {totalTasks}</span>
        </div>
        <div className="h-3.5 rounded-full bg-[var(--color-surface-light)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-success)] to-[var(--color-accent)] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value as Category | 'all')}
          className="rounded-lg bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)]"
        >
          <option value="all">All Categories</option>
          <option value="school">📐 School</option>
          <option value="activity">⚽ Activity</option>
          <option value="chore">🧹 Chore</option>
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as 'all' | 'pending' | 'completed')}
          className="rounded-lg bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)]"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filterDay}
          onChange={e => setFilterDay(e.target.value as DayOfWeek | 'all')}
          className="rounded-lg bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)]"
        >
          <option value="all">All Days</option>
          {getAllDays().map(d => (
            <option key={d} value={d}>{formatDayShort(d)}</option>
          ))}
        </select>
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <p className="py-12 text-center text-base text-[var(--color-text-muted)]">No tasks match your filters</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map(task => {
            const pts = getPointsForTask(task, state.settings.pointValues)
            return (
              <div
                key={task.id}
                className={`flex items-center gap-4 rounded-2xl p-4 ${
                  task.completed
                    ? 'bg-[var(--color-surface)] opacity-60'
                    : 'bg-[var(--color-surface)]'
                }`}
              >
                <button
                  onClick={() => {
                    if (task.completed) {
                      dispatch({ type: 'UNCOMPLETE_TASK', weekKey: currentWeekKey, taskId: task.id })
                    } else {
                      dispatch({ type: 'COMPLETE_TASK', weekKey: currentWeekKey, taskId: task.id })
                    }
                  }}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm ${
                    task.completed
                      ? 'border-[var(--color-success)] bg-[var(--color-success)] text-[var(--color-bg)]'
                      : 'border-[var(--color-text-muted)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  {task.completed && '✓'}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-base font-medium truncate ${task.completed ? 'line-through' : ''}`}>
                    {CATEGORY_ICONS[task.category]} {task.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    {task.days.map(d => (
                      <span key={d} className="rounded bg-[var(--color-surface-light)] px-2 py-0.5">{formatDayShort(d)}</span>
                    ))}
                    {task.priority === 'high' && <span className="text-[var(--color-danger)]">High</span>}
                  </div>
                </div>
                <span className="text-sm font-bold text-[var(--color-accent)] shrink-0">
                  {task.completed ? `+${task.pointsEarned}` : `+${pts}`}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
