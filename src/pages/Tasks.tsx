import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { getPointsForTask } from '../utils/points'
import { formatDayShort, getAllDays } from '../utils/dates'
import type { Category, DayOfWeek } from '../types'

const CAT_CLASSES: Record<string, string> = {
  school: 'cat-school',
  activity: 'cat-activity',
  chore: 'cat-chore',
}

export default function Tasks() {
  const { state, dispatch, currentWeekKey, currentWeek } = useApp()
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all')
  const [filterDay, setFilterDay] = useState<DayOfWeek | 'all'>('all')

  if (!currentWeek) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-primary-light)]">
          <span className="text-4xl">✅</span>
        </div>
        <p className="text-base text-[var(--color-text-secondary)]">No tasks yet. Plan your week first!</p>
      </div>
    )
  }

  let tasks = [...currentWeek.tasks]
  if (filterCategory !== 'all') tasks = tasks.filter(t => t.category === filterCategory)
  if (filterStatus === 'pending') tasks = tasks.filter(t => !t.completed)
  else if (filterStatus === 'completed') tasks = tasks.filter(t => t.completed)
  if (filterDay !== 'all') tasks = tasks.filter(t => t.days.includes(filterDay))

  const totalTasks = currentWeek.tasks.length
  const completedTasks = currentWeek.tasks.filter(t => t.completed).length
  const progressPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div>
      {/* Weekly progress */}
      <div className="mb-5 rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-base font-semibold text-[var(--color-text)]">Weekly Progress</span>
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">{completedTasks}/{totalTasks}</span>
        </div>
        <div className="h-3 rounded-full bg-[var(--color-border)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          {Math.round(progressPct)}% complete
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value as Category | 'all')}
          className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text)] shadow-[var(--shadow-card)]"
        >
          <option value="all">All Categories</option>
          <option value="school">School</option>
          <option value="activity">Activity</option>
          <option value="chore">Chore</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as 'all' | 'pending' | 'completed')}
          className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text)] shadow-[var(--shadow-card)]"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filterDay}
          onChange={e => setFilterDay(e.target.value as DayOfWeek | 'all')}
          className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text)] shadow-[var(--shadow-card)]"
        >
          <option value="all">All Days</option>
          {getAllDays().map(d => (
            <option key={d} value={d}>{formatDayShort(d)}</option>
          ))}
        </select>
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <p className="py-12 text-center text-base text-[var(--color-text-tertiary)]">No tasks match your filters</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map(task => {
            const pts = getPointsForTask(task, state.settings.pointValues)
            return (
              <div
                key={task.id}
                className={`flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[var(--shadow-card)] ${
                  task.completed ? 'opacity-50' : ''
                }`}
              >
                <button
                  onClick={() => {
                    if (task.completed) dispatch({ type: 'UNCOMPLETE_TASK', weekKey: currentWeekKey, taskId: task.id })
                    else dispatch({ type: 'COMPLETE_TASK', weekKey: currentWeekKey, taskId: task.id })
                  }}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm ${
                    task.completed
                      ? 'border-[var(--color-success)] bg-[var(--color-success)] text-white'
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  {task.completed && '✓'}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-base font-semibold text-[var(--color-text)] truncate ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${CAT_CLASSES[task.category]}`}>
                      {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                    </span>
                    {task.days.map(d => (
                      <span key={d} className="rounded-full bg-[var(--color-bg)] px-2.5 py-0.5 text-xs text-[var(--color-text-secondary)]">{formatDayShort(d)}</span>
                    ))}
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold text-[var(--color-primary)]">
                  +{task.completed ? task.pointsEarned : pts}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
